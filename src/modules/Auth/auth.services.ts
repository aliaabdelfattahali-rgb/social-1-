import User from "../../DB/models/user.model.js";
import { hashPassword, comparePassword } from "../../utils/security/hash.js";
import jwt, { SignOptions } from "jsonwebtoken";
import {
  createOtp,
} from "../../utils/email/createOtp.js";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from "../../utils/email/sendEmail.js";
import {
  redisSet,
  redisGet,
  redisDel,
  redisExists,
} from "../../utils/redis-services.js";
import { IUser } from "../../DB/models/user.model.js";
import { TokenPair, TokenPayload, RefreshTokenPayload } from "./auth.types.js";

const OTP_EXPIRY_SECONDS = 600; // 10 minutes
const REFRESH_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

const getRefreshTokenKey = (userId: string): string => `refresh_token:${userId}`;

const storeRefreshToken = async (
  userId: string,
  refreshToken: string
): Promise<void> => {
  await redisSet(
    getRefreshTokenKey(userId),
    refreshToken,
    REFRESH_TOKEN_TTL_SECONDS
  );
};

// Read env vars at call time so dotenv has already loaded the .env file
const getAccessTokenSecret = (): string => {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) {
    throw new Error("JWT_ACCESS_SECRET is not configured");
  }
  return secret;
};

const getRefreshTokenSecret = (): string => {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) {
    throw new Error("JWT_REFRESH_SECRET is not configured");
  }
  return secret;
};

const generateAccessToken = (user: IUser): string => {
  const payload: TokenPayload = {
    userId: user._id.toString(),
    email: user.email,
    username: user.username,
  };
  const expiry = (process.env.JWT_ACCESS_EXPIRY || "15m") as SignOptions["expiresIn"];
  return jwt.sign(payload, getAccessTokenSecret(), { expiresIn: expiry });
};

const generateRefreshToken = (userId: string): string => {
  const payload: RefreshTokenPayload = {
    userId,
    tokenType: "refresh",
  };
  const expiry = (process.env.JWT_REFRESH_EXPIRY || "7d") as SignOptions["expiresIn"];
  return jwt.sign(payload, getRefreshTokenSecret(), { expiresIn: expiry });
};

export const registerUser = async (input: {
  name: string;
  username: string;
  email: string;
  password: string;
  phone?: string;
}): Promise<{ user: IUser; otp: string }> => {
  const { name, username, email, password, phone } = input;

  const existingEmail = await User.findOne({ email });
  if (existingEmail) {
    throw new Error("Email already registered");
  }

  const existingUsername = await User.findOne({ username });
  if (existingUsername) {
    throw new Error("Username already taken");
  }

  const hashedPassword = await hashPassword(password);

  const user = await User.create({
    name,
    username,
    email,
    password: hashedPassword,
    phone,
    isEmailVerified: false,
  });

  const otp = createOtp();
  const redisKey = `otp:verify:${email}`;
  await redisSet(redisKey, otp, OTP_EXPIRY_SECONDS);

  await sendVerificationEmail(email, name, otp, "10 minutes");

  return { user, otp };
};

export const verifyEmail = async (input: {
  email: string;
  otp: string;
}): Promise<void> => {
  const { email, otp } = input;

  const redisKey = `otp:verify:${email}`;
  const storedOtp = await redisGet(redisKey);

  if (!storedOtp) {
    throw new Error("OTP not found or has expired");
  }

  const exists = await redisExists(redisKey);
  if (!exists) {
    throw new Error("OTP not found or has expired");
  }

  if (storedOtp !== otp) {
    throw new Error("Invalid OTP");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("User not found");
  }

  user.isEmailVerified = true;
  await user.save();

  await redisDel(redisKey);
};

export const loginUser = async (input: {
  email: string;
  password: string;
}): Promise<{ user: IUser; tokens: TokenPair }> => {
  const { email, password } = input;

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw new Error("Invalid email or password");
  }

  if (!user.password) {
    throw new Error("Invalid email or password");
  }

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid email or password");
  }

  if (!user.isEmailVerified) {
    throw new Error("Email not verified. Please verify your email before logging in.");
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user._id.toString());

  await storeRefreshToken(user._id.toString(), refreshToken);

  const tokens: TokenPair = {
    accessToken,
    refreshToken,
  };

  return { user, tokens };
};

export const refreshAccessToken = async (input: {
  refreshToken: string;
}): Promise<{ accessToken: string }> => {
  const { refreshToken } = input;

  const decoded = jwt.verify(refreshToken, getRefreshTokenSecret()) as RefreshTokenPayload;

  if (decoded.tokenType !== "refresh") {
    throw new Error("Invalid token type");
  }

  const storedToken = await redisGet(getRefreshTokenKey(decoded.userId));
  if (!storedToken || storedToken !== refreshToken) {
    throw new Error("Refresh token has been revoked or is invalid");
  }

  const user = await User.findById(decoded.userId);
  if (!user) {
    throw new Error("User not found");
  }

  const accessToken = generateAccessToken(user);

  return { accessToken };
};

export const logoutUser = async (input: {
  refreshToken: string;
}): Promise<void> => {
  const { refreshToken } = input;

  try {
    const decoded = jwt.verify(refreshToken, getRefreshTokenSecret()) as RefreshTokenPayload;

    await redisDel(getRefreshTokenKey(decoded.userId));
  } catch {
    // Token may be invalid, still consider logout successful
  }
};

export const forgotPassword = async (input: {
  email: string;
}): Promise<void> => {
  const { email } = input;

  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("User not found");
  }

  const otp = createOtp();
  const redisKey = `otp:reset:${email}`;
  await redisSet(redisKey, otp, OTP_EXPIRY_SECONDS);

  await sendPasswordResetEmail(email, user.name, otp, "10 minutes");
};

export const resetPassword = async (input: {
  email: string;
  otp: string;
  newPassword: string;
}): Promise<void> => {
  const { email, otp, newPassword } = input;

  const redisKey = `otp:reset:${email}`;
  const storedOtp = await redisGet(redisKey);

  if (!storedOtp) {
    throw new Error("OTP not found or has expired");
  }

  const exists = await redisExists(redisKey);
  if (!exists) {
    throw new Error("OTP not found or has expired");
  }

  if (storedOtp !== otp) {
    throw new Error("Invalid OTP");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("User not found");
  }

  const hashedPassword = await hashPassword(newPassword);
  user.password = hashedPassword;
  await user.save();

  await redisDel(redisKey);

  await redisDel(getRefreshTokenKey(user._id.toString()));
};

const generateUniqueUsername = async (email: string): Promise<string> => {
  const base =
    email.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "").slice(0, 10) || "user";
  let candidate = base;
  let suffix = 0;
  while (await User.findOne({ username: candidate })) {
    suffix += 1;
    candidate = `${base}_${suffix}`.slice(0, 20);
  }
  return candidate;
};

export const googleLogin = async (input: {
  googleId: string;
  email: string;
  name: string;
  profilePicture?: string;
}): Promise<{ user: IUser; tokens: TokenPair }> => {
  const { googleId, email, name, profilePicture } = input;

  let user = await User.findOne({ email });

  if (!user) {
    const username = await generateUniqueUsername(email);
    user = await User.create({
      name,
      username,
      email,
      googleId,
      profilePicture,
      isEmailVerified: true,
    });
  } else if (!user.googleId) {
    user.googleId = googleId;
    user.isEmailVerified = true;
    if (profilePicture && !user.profilePicture) {
      user.profilePicture = profilePicture;
    }
    await user.save();
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user._id.toString());

  await storeRefreshToken(user._id.toString(), refreshToken);

  const tokens: TokenPair = {
    accessToken,
    refreshToken,
  };

  return { user, tokens };
};

export const getUserById = async (userId: string): Promise<IUser | null> => {
  const user = await User.findById(userId);
  return user;
};
