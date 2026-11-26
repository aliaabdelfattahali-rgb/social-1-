export const validateRegister = (data: Record<string, unknown>): string | null => {
  const { name, username, email, password, confirmPassword } = data;

  if (!name || typeof name !== "string" || name.trim().length < 2) {
    return "Name is required and must be at least 2 characters";
  }

  if (!username || typeof username !== "string" || username.trim().length < 3) {
    return "Username is required and must be at least 3 characters";
  }

  const usernameRegex = /^[a-zA-Z0-9_]+$/;
  if (!usernameRegex.test(username.trim())) {
    return "Username can only contain letters, numbers, and underscores";
  }

  if (!email || typeof email !== "string") {
    return "Email is required";
  }

  const emailRegex = /^\S+@\S+\.\S+$/;
  if (!emailRegex.test(email.trim())) {
    return "Please enter a valid email address";
  }

  if (!password || typeof password !== "string" || password.length < 6) {
    return "Password is required and must be at least 6 characters";
  }

  if (!confirmPassword || typeof confirmPassword !== "string") {
    return "Confirm password is required";
  }

  if (password !== confirmPassword) {
    return "Password and confirm password do not match";
  }

  return null;
};

export const validateLogin = (data: Record<string, unknown>): string | null => {
  const { email, password } = data;

  if (!email || typeof email !== "string") {
    return "Email is required";
  }

  const emailRegex = /^\S+@\S+\.\S+$/;
  if (!emailRegex.test(email.trim())) {
    return "Please enter a valid email address";
  }

  if (!password || typeof password !== "string") {
    return "Password is required";
  }

  return null;
};

export const validateVerifyEmail = (data: Record<string, unknown>): string | null => {
  const { email, otp } = data;

  if (!email || typeof email !== "string") {
    return "Email is required";
  }

  const emailRegex = /^\S+@\S+\.\S+$/;
  if (!emailRegex.test(email.trim())) {
    return "Please enter a valid email address";
  }

  if (!otp || typeof otp !== "string" || otp.length !== 6) {
    return "OTP is required and must be 6 digits";
  }

  return null;
};

export const validateForgotPassword = (data: Record<string, unknown>): string | null => {
  const { email } = data;

  if (!email || typeof email !== "string") {
    return "Email is required";
  }

  const emailRegex = /^\S+@\S+\.\S+$/;
  if (!emailRegex.test(email.trim())) {
    return "Please enter a valid email address";
  }

  return null;
};

export const validateResetPassword = (data: Record<string, unknown>): string | null => {
  const { email, otp, newPassword, confirmPassword } = data;

  if (!email || typeof email !== "string") {
    return "Email is required";
  }

  const emailRegex = /^\S+@\S+\.\S+$/;
  if (!emailRegex.test(email.trim())) {
    return "Please enter a valid email address";
  }

  if (!otp || typeof otp !== "string" || otp.length !== 6) {
    return "OTP is required and must be 6 digits";
  }

  if (!newPassword || typeof newPassword !== "string" || newPassword.length < 6) {
    return "New password is required and must be at least 6 characters";
  }

  if (!confirmPassword || typeof confirmPassword !== "string") {
    return "Confirm password is required";
  }

  if (newPassword !== confirmPassword) {
    return "New password and confirm password do not match";
  }

  return null;
};

export const validateRefreshToken = (data: Record<string, unknown>): string | null => {
  const { refreshToken } = data;

  if (!refreshToken || typeof refreshToken !== "string") {
    return "Refresh token is required";
  }

  return null;
};

export const validateGoogleLogin = (data: Record<string, unknown>): string | null => {
  const { credential } = data;

  if (!credential || typeof credential !== "string") {
    return "Google credential is required";
  }

  return null;
};
