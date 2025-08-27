// Core data types
export interface AppSubmission {
  id: string;
  name: string;
  description: string;
  status: AppStatus;
  submittedAt: string;
  updatedAt: string;
  developer: {
    id: string;
    name: string;
    email: string;
  };
  category: AppCategory;
  version: string;
  metadata: {
    downloads: number;
    rating: number;
    fileSize: number;
  };
}

export enum AppStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
  FLAGGED = "flagged",
}

export enum AppCategory {
  SOCIAL = "social",
  PRODUCTIVITY = "productivity",
  ENTERTAINMENT = "entertainment",
  EDUCATION = "education",
  BUSINESS = "business",
}

// API response types
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    nextCursor?: string;
    previousCursor?: string;
    totalCount: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

// Filter and search types
export interface AppFilters {
  status?: AppStatus[];
  category?: AppCategory[];
  search?: string;
  sortBy?: "name" | "submittedAt" | "rating";
  sortOrder?: "asc" | "desc";
}

// Action types for optimistic updates
export interface AppAction {
  type: "approve" | "reject" | "flag";
  appId: string;
  moderatorId: string;
}
