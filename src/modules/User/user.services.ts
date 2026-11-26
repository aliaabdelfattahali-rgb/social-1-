import { Types } from "mongoose";
import User from "../../DB/models/user.model.js";
import { IUser } from "../../DB/models/user.model.js";
import { uploadDir } from "../../utils/multer.js";

export const getProfile = async (userId: string): Promise<IUser | null> => {
  const user = await User.findById(userId);
  return user;
};

export const getProfileById = async (targetUserId: string): Promise<IUser | null> => {
  const user = await User.findById(targetUserId);
  return user;
};

export const updateProfile = async (
  userId: string,
  input: { name?: string; username?: string; phone?: string }
): Promise<IUser | null> => {
  const user = await User.findById(userId);
  if (!user) {
    return null;
  }

  if (input.name !== undefined) {
    user.name = input.name;
  }

  if (input.username !== undefined) {
    const existingUsername = await User.findOne({
      username: input.username,
      _id: { $ne: userId },
    });
    if (existingUsername) {
      throw new Error("Username already taken");
    }
    user.username = input.username;
  }

  if (input.phone !== undefined) {
    user.phone = input.phone;
  }

  await user.save();
  return user;
};

export const uploadProfilePictureService = async (
  userId: string,
  filePath: string
): Promise<IUser | null> => {
  const user = await User.findById(userId);
  if (!user) {
    return null;
  }

  user.profilePicture = filePath;
  await user.save();
  return user;
};

export const followUser = async (
  userId: string,
  targetUserId: string
): Promise<void> => {
  if (userId === targetUserId) {
    throw new Error("You cannot follow yourself");
  }

  const targetUser = await User.findById(targetUserId);
  if (!targetUser) {
    throw new Error("User not found");
  }

  const currentUser = await User.findById(userId);
  if (!currentUser) {
    throw new Error("User not found");
  }

  const alreadyFollowing = currentUser.following.some(
    (id) => id.toString() === targetUserId
  );
  if (alreadyFollowing) {
    throw new Error("You are already following this user");
  }

  currentUser.following.push(new Types.ObjectId(targetUserId));
  targetUser.followers.push(new Types.ObjectId(userId));

  await currentUser.save();
  await targetUser.save();
};

export const unfollowUser = async (
  userId: string,
  targetUserId: string
): Promise<void> => {
  if (userId === targetUserId) {
    throw new Error("You cannot unfollow yourself");
  }

  const currentUser = await User.findById(userId);
  if (!currentUser) {
    throw new Error("User not found");
  }

  const targetUser = await User.findById(targetUserId);
  if (!targetUser) {
    throw new Error("User not found");
  }

  currentUser.following = currentUser.following.filter(
    (id) => id.toString() !== targetUserId
  );

  targetUser.followers = targetUser.followers.filter(
    (id) => id.toString() !== userId
  );

  await currentUser.save();
  await targetUser.save();
};

export const getFollowers = async (userId: string): Promise<IUser[]> => {
  const user = await User.findById(userId).populate("followers");
  if (!user) {
    return [];
  }

  return user.followers as unknown as IUser[];
};

export const getFollowing = async (userId: string): Promise<IUser[]> => {
  const user = await User.findById(userId).populate("following");
  if (!user) {
    return [];
  }

  return user.following as unknown as IUser[];
};

export const searchUsers = async (
  query: string,
  currentUserId: string
): Promise<IUser[]> => {
  const users = await User.find({
    _id: { $ne: currentUserId },
    $or: [
      { name: { $regex: query, $options: "i" } },
      { username: { $regex: query, $options: "i" } },
    ],
  }).limit(20);

  return users;
};

export const getSuggestions = async (
  currentUserId: string
): Promise<IUser[]> => {
  const currentUser = await User.findById(currentUserId);
  if (!currentUser) {
    return [];
  }

  const excludedIds = [currentUserId, ...currentUser.following.map((id) => id.toString())];

  const suggestions = await User.find({
    _id: { $nin: excludedIds },
    isPrivate: false,
  }).limit(10);

  return suggestions;
};

export const updatePrivacySettings = async (
  userId: string,
  isPrivate: boolean
): Promise<IUser | null> => {
  const user = await User.findById(userId);
  if (!user) {
    return null;
  }

  user.isPrivate = isPrivate;
  await user.save();
  return user;
};

export const getUploadDir = (): string => {
  return uploadDir;
};
