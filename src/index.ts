import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import path from "path";
import connectDB from "./DB/mongo.connection.js";
import { connectRedis } from "./DB/redis.connection.js";
import { authenticateToken } from "./middlewares/auth.middleware.js";
import { uploadProfilePicture, uploadDir } from "./utils/multer.js";
import {
  register,
  verifyEmail,
  login,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
  googleLogin,
} from "./modules/Auth/auth.controller.js";
import {
  getMyProfile,
  getUserProfile,
  updateMyProfile,
  uploadProfilePicture as uploadUserProfilePicture,
  follow,
  unfollow,
  getMyFollowers,
  getMyFollowing,
  searchUsers,
  getSuggestions,
  updatePrivacy,
} from "./modules/User/user.controller.js";

dotenv.config({ path: path.join(process.cwd(), "config", ".env") });

const app: Application = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(uploadDir));

// Health check
app.get("/health", (_req: Request, res: Response): void => {
  res.status(200).json({
    success: true,
    message: "Social-App Backend is running",
  });
});

// ============================================
// AUTH ROUTES
// ============================================

app.post("/api/auth/register", register);
app.post("/api/auth/verify-email", verifyEmail);
app.post("/api/auth/login", login);
app.post("/api/auth/refresh-token", refreshToken);
app.post("/api/auth/logout", logout);
app.post("/api/auth/forgot-password", forgotPassword);
app.post("/api/auth/reset-password", resetPassword);
app.post("/api/auth/google-login", googleLogin);

// ============================================
// USER ROUTES (Protected)
// ============================================

app.get("/api/user/profile", authenticateToken, getMyProfile);
app.get("/api/user/profile/:userId", authenticateToken, getUserProfile);
app.put("/api/user/profile", authenticateToken, updateMyProfile);
app.post(
  "/api/user/profile-picture",
  authenticateToken,
  uploadProfilePicture.single("profilePicture"),
  uploadUserProfilePicture
);
app.post("/api/user/follow", authenticateToken, follow);
app.post("/api/user/unfollow", authenticateToken, unfollow);
app.get("/api/user/followers", authenticateToken, getMyFollowers);
app.get("/api/user/following", authenticateToken, getMyFollowing);
app.get("/api/user/search", authenticateToken, searchUsers);
app.get("/api/user/suggestions", authenticateToken, getSuggestions);
app.put("/api/user/privacy", authenticateToken, updatePrivacy);

// ============================================
// ERROR HANDLING MIDDLEWARE
// ============================================

app.use((err: Error, _req: Request, res: Response, _next: NextFunction): void => {
  console.error("Error:", err.message);

  if (err instanceof multer.MulterError) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
    return;
  }

  res.status(500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

// ============================================
// 404 HANDLER
// ============================================

app.use((_req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// ============================================
// SERVER START
// ============================================

const startServer = async (): Promise<void> => {
  try {
    await connectDB();
    await connectRedis();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
