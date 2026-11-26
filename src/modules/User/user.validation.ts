export const validateUpdateProfile = (data: Record<string, unknown>): string | null => {
  const { name, username, phone } = data;

  if (name !== undefined && (typeof name !== "string" || name.trim().length < 2)) {
    return "Name must be at least 2 characters";
  }

  if (username !== undefined) {
    if (typeof username !== "string" || username.trim().length < 3) {
      return "Username must be at least 3 characters";
    }
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username.trim())) {
      return "Username can only contain letters, numbers, and underscores";
    }
  }

  if (phone !== undefined && typeof phone !== "string") {
    return "Phone must be a string";
  }

  return null;
};

export const validateFollowUser = (data: Record<string, unknown>): string | null => {
  const { targetUserId } = data;

  if (!targetUserId || typeof targetUserId !== "string") {
    return "Target user ID is required";
  }

  const objectIdPattern = /^[0-9a-fA-F]{24}$/;
  if (!objectIdPattern.test(targetUserId)) {
    return "Invalid user ID format";
  }

  return null;
};

export const validateUpdatePrivacy = (data: Record<string, unknown>): string | null => {
  const { isPrivate } = data;

  if (isPrivate === undefined || typeof isPrivate !== "boolean") {
    return "isPrivate is required and must be a boolean";
  }

  return null;
};
