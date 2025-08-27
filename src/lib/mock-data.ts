import { AppSubmission, AppStatus, AppCategory } from "@/types";
import { env } from "@/lib/env";

// Mock database with seed data
const mockApps: AppSubmission[] = Array.from(
  { length: env.MOCK_DATA_COUNT },
  (_, i) => ({
    id: `app-${i + 1}`,
    name: `App ${i + 1}`,
    description: `This is a description for app ${i + 1}. It provides ${
      Math.random() > 0.5 ? "amazing" : "innovative"
    } functionality for users.`,
    status: [
      AppStatus.PENDING,
      AppStatus.APPROVED,
      AppStatus.REJECTED,
      AppStatus.FLAGGED,
    ][i % 4],
    submittedAt: new Date(
      Date.now() -
        Math.random() *
          env.MOCK_SUBMISSION_DATE_RANGE_DAYS *
          24 *
          60 *
          60 *
          1000,
    ).toISOString(),
    updatedAt: new Date(
      Date.now() -
        Math.random() * env.MOCK_UPDATE_DATE_RANGE_DAYS * 24 * 60 * 60 * 1000,
    ).toISOString(),
    developer: {
      id: `dev-${Math.floor(i / 5) + 1}`,
      name: `Developer ${Math.floor(i / 5) + 1}`,
      email: `dev${Math.floor(i / 5) + 1}@example.com`,
    },
    category: [
      AppCategory.SOCIAL,
      AppCategory.PRODUCTIVITY,
      AppCategory.ENTERTAINMENT,
      AppCategory.EDUCATION,
      AppCategory.BUSINESS,
    ][i % 5],
    version: `${Math.floor(Math.random() * 3) + 1}.${Math.floor(
      Math.random() * 10,
    )}.${Math.floor(Math.random() * 10)}`,
    metadata: {
      downloads: Math.floor(Math.random() * 100000),
      rating: Math.round((Math.random() * 2 + 3) * 10) / 10,
      fileSize: Math.floor(Math.random() * 50) + 5,
    },
  }),
);
const appStore = new Map<string, AppSubmission>();
mockApps.forEach((app) => appStore.set(app.id, app));

export { mockApps, appStore };
