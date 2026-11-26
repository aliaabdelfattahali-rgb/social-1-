import { Request, Response } from "express";
import { sendSuccess } from "../../utils/success.res.js";
import * as authService from "./auth.services.js";
import {
  validateRegister,
  validateLogin,
  validateVerifyEmail,
  validateForgotPassword,
  validateResetPassword,
  validateRefreshToken,
  validateGoogleLogin,
} from "./auth.validation.js";

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const validationError = validateRegister(req.body);
    if (validationError) {
      res.status(400).json({
        success: false,
        message: validationError,
      });
      return;
    }

    const { name, username, email, password, phone } = req.body;

    const { user } = await authService.registerUser({
      name,
      username,
      email,
      password,
      phone,
    });

    sendSuccess({
      res,
      statusCode: 201,
      message: "Registration successful. OTP sent to email for verification.",
      data: {
        userId: user._id.toString(),
        email: user.email,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Registration failed";
    res.status(400).json({
      success: false,
      message,
    });
  }
};

export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const validationError = validateVerifyEmail(req.body);
    if (validationError) {
      res.status(400).json({
        success: false,
        message: validationError,
      });
      return;
    }

    const { email, otp } = req.body;

    await authService.verifyEmail({ email, otp });

    sendSuccess({
      res,
      statusCode: 200,
      message: "Email verified successfully",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Email verification failed";
    res.status(400).json({
      success: false,
      message,
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const validationError = validateLogin(req.body);
    if (validationError) {
      res.status(400).json({
        success: false,
        message: validationError,
      });
      return;
    }

    const { email, password } = req.body;

    const { user, tokens } = await authService.loginUser({ email, password });

    sendSuccess({
      res,
      statusCode: 200,
      message: "Login successful",
      data: {
        user: {
          userId: user._id.toString(),
          name: user.name,
          username: user.username,
          email: user.email,
          isEmailVerified: user.isEmailVerified,
          profilePicture: user.profilePicture,
        },
        tokens,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Login failed";
    res.status(401).json({
      success: false,
      message,
    });
  }
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const validationError = validateRefreshToken(req.body);
    if (validationError) {
      res.status(400).json({
        success: false,
        message: validationError,
      });
      return;
    }

    const { refreshToken } = req.body;

    const { accessToken } = await authService.refreshAccessToken({ refreshToken });

    sendSuccess({
      res,
      statusCode: 200,
      message: "Access token refreshed successfully",
      data: {
        accessToken,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Token refresh failed";
    res.status(401).json({
      success: false,
      message,
    });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await authService.logoutUser({ refreshToken });
    }

    sendSuccess({
      res,
      statusCode: 200,
      message: "Logout successful",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Logout failed";
    res.status(500).json({
      success: false,
      message,
    });
  }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const validationError = validateForgotPassword(req.body);
    if (validationError) {
      res.status(400).json({
        success: false,
        message: validationError,
      });
      return;
    }

    const { email } = req.body;

    await authService.forgotPassword({ email });

    sendSuccess({
      res,
      statusCode: 200,
      message: "Password reset OTP sent to email",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Forgot password failed";
    res.status(400).json({
      success: false,
      message,
    });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const validationError = validateResetPassword(req.body);
    if (validationError) {
      res.status(400).json({
        success: false,
        message: validationError,
      });
      return;
    }

    const { email, otp, newPassword } = req.body;

    await authService.resetPassword({ email, otp, newPassword });

    sendSuccess({
      res,
      statusCode: 200,
      message: "Password reset successfully",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Password reset failed";
    res.status(400).json({
      success: false,
      message,
    });
  }
};

export const googleLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const validationError = validateGoogleLogin(req.body);
    if (validationError) {
      res.status(400).json({
        success: false,
        message: validationError,
      });
      return;
    }

    const { credential } = req.body;

    const { OAuth2Client } = await import("google-auth-library");
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload || !payload.sub || !payload.email) {
      res.status(400).json({
        success: false,
        message: "Invalid Google token",
      });
      return;
    }

    const { user, tokens } = await authService.googleLogin({
      googleId: payload.sub,
      email: payload.email,
      name: payload.name || "",
      profilePicture: payload.picture,
    });

    sendSuccess({
      res,
      statusCode: 200,
      message: "Google login successful",
      data: {
        user: {
          userId: user._id.toString(),
          name: user.name,
          username: user.username,
          email: user.email,
          isEmailVerified: user.isEmailVerified,
          profilePicture: user.profilePicture,
        },
        tokens,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Google login failed";
    res.status(401).json({
      success: false,
      message,
    });
  }
};
