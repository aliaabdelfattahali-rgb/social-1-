import { Request, Response } from "express";
import { sendSuccess } from "../../utils/success.res.js";
import * as userService from "./user.services.js";
import { AuthRequest } from "../../middlewares/auth.middleware.js";
import { validateObjectId } from "../../middlewares/validation.middleware.js";
import {
  validateUpdateProfile,
  validateFollowUser,
  validateUpdatePrivacy,
} from "./user.validation.js";

export const getMyProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const user = await userService.getProfile(req.user.userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    sendSuccess({
      res,
      statusCode: 200,
      message: "Profile retrieved successfully",
      data: {
        userId: user._id.toString(),
        name: user.name,
        username: user.username,
        email: user.email,
        phone: user.phone,
        profilePicture: user.profilePicture,
        isEmailVerified: user.isEmailVerified,
        isPrivate: user.isPrivate,
        followersCount: user.followers.length,
        followingCount: user.following.length,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to get profile";
    res.status(500).json({
      success: false,
      message,
    });
  }
};

export const getUserProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    if (!validateObjectId(userId)) {
      res.status(400).json({
        success: false,
        message: "Invalid user ID format",
      });
      return;
    }

    const user = await userService.getProfileById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    let isFollowed = false;
    if (req.user && req.user.userId !== userId) {
      isFollowed = user.followers.some(
        (id) => id.toString() === req.user!.userId
      );
    }

    sendSuccess({
      res,
      statusCode: 200,
      message: "User profile retrieved successfully",
      data: {
        userId: user._id.toString(),
        name: user.name,
        username: user.username,
        email: user.isPrivate && req.user?.userId !== userId ? undefined : user.email,
        profilePicture: user.profilePicture,
        isEmailVerified: user.isEmailVerified,
        isPrivate: user.isPrivate,
        followersCount: user.followers.length,
        followingCount: user.following.length,
        isFollowed,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to get user profile";
    res.status(500).json({
      success: false,
      message,
    });
  }
};

export const updateMyProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const validationError = validateUpdateProfile(req.body);
    if (validationError) {
      res.status(400).json({
        success: false,
        message: validationError,
      });
      return;
    }

    const { name, username, phone } = req.body;

    const user = await userService.updateProfile(req.user.userId, { name, username, phone });
    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    sendSuccess({
      res,
      statusCode: 200,
      message: "Profile updated successfully",
      data: {
        userId: user._id.toString(),
        name: user.name,
        username: user.username,
        email: user.email,
        phone: user.phone,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update profile";
    res.status(400).json({
      success: false,
      message,
    });
  }
};

export const uploadProfilePicture = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    if (!req.file) {
      res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
      return;
    }

    const filePath = `/uploads/${req.file.filename}`;

    const user = await userService.uploadProfilePictureService(req.user.userId, filePath);
    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    sendSuccess({
      res,
      statusCode: 200,
      message: "Profile picture uploaded successfully",
      data: {
        profilePicture: user.profilePicture,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to upload profile picture";
    res.status(500).json({
      success: false,
      message,
    });
  }
};

export const follow = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const validationError = validateFollowUser(req.body);
    if (validationError) {
      res.status(400).json({
        success: false,
        message: validationError,
      });
      return;
    }

    const { targetUserId } = req.body;

    await userService.followUser(req.user.userId, targetUserId);

    sendSuccess({
      res,
      statusCode: 200,
      message: "User followed successfully",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to follow user";
    res.status(400).json({
      success: false,
      message,
    });
  }
};

export const unfollow = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const validationError = validateFollowUser(req.body);
    if (validationError) {
      res.status(400).json({
        success: false,
        message: validationError,
      });
      return;
    }

    const { targetUserId } = req.body;

    await userService.unfollowUser(req.user.userId, targetUserId);

    sendSuccess({
      res,
      statusCode: 200,
      message: "User unfollowed successfully",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to unfollow user";
    res.status(400).json({
      success: false,
      message,
    });
  }
};

export const getMyFollowers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const followers = await userService.getFollowers(req.user.userId);

    sendSuccess({
      res,
      statusCode: 200,
      message: "Followers retrieved successfully",
      data: {
        followers: followers.map((u) => ({
          userId: u._id.toString(),
          name: u.name,
          username: u.username,
          profilePicture: u.profilePicture,
          isPrivate: u.isPrivate,
        })),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to get followers";
    res.status(500).json({
      success: false,
      message,
    });
  }
};

export const getMyFollowing = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const following = await userService.getFollowing(req.user.userId);

    sendSuccess({
      res,
      statusCode: 200,
      message: "Following retrieved successfully",
      data: {
        following: following.map((u) => ({
          userId: u._id.toString(),
          name: u.name,
          username: u.username,
          profilePicture: u.profilePicture,
          isPrivate: u.isPrivate,
        })),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to get following";
    res.status(500).json({
      success: false,
      message,
    });
  }
};

export const searchUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const { q } = req.query;

    if (!q || typeof q !== "string") {
      res.status(400).json({
        success: false,
        message: "Search query is required",
      });
      return;
    }

    const users = await userService.searchUsers(q, req.user.userId);

    sendSuccess({
      res,
      statusCode: 200,
      message: "Users retrieved successfully",
      data: {
        users: users.map((u) => ({
          userId: u._id.toString(),
          name: u.name,
          username: u.username,
          profilePicture: u.profilePicture,
          isPrivate: u.isPrivate,
        })),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to search users";
    res.status(500).json({
      success: false,
      message,
    });
  }
};

export const getSuggestions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const suggestions = await userService.getSuggestions(req.user.userId);

    sendSuccess({
      res,
      statusCode: 200,
      message: "Suggestions retrieved successfully",
      data: {
        users: suggestions.map((u) => ({
          userId: u._id.toString(),
          name: u.name,
          username: u.username,
          profilePicture: u.profilePicture,
          isPrivate: u.isPrivate,
        })),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to get suggestions";
    res.status(500).json({
      success: false,
      message,
    });
  }
};

export const updatePrivacy = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const validationError = validateUpdatePrivacy(req.body);
    if (validationError) {
      res.status(400).json({
        success: false,
        message: validationError,
      });
      return;
    }

    const { isPrivate } = req.body;

    const user = await userService.updatePrivacySettings(req.user.userId, isPrivate);
    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    sendSuccess({
      res,
      statusCode: 200,
      message: "Privacy settings updated successfully",
      data: {
        isPrivate: user.isPrivate,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update privacy settings";
    res.status(500).json({
      success: false,
      message,
    });
  }
};
