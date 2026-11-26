export interface UpdateProfileInput {
  name?: string;
  username?: string;
  phone?: string;
  bio?: string;
}

export interface FollowUserInput {
  targetUserId: string;
}

export interface UpdatePrivacyInput {
  isPrivate: boolean;
}

export interface UserProfileResponse {
  userId: string;
  name: string;
  username: string;
  email: string;
  phone?: string;
  profilePicture?: string;
  isEmailVerified: boolean;
  isPrivate: boolean;
  followersCount: number;
  followingCount: number;
  isFollowed: boolean;
}

export interface UserListResponse {
  users: Array<{
    userId: string;
    name: string;
    username: string;
    profilePicture?: string;
    isPrivate: boolean;
  }>;
}

export interface PaginationQuery {
  page?: string;
  limit?: string;
}
