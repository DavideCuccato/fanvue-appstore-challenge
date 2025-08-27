import { db } from "./client";
import {
  AppSubmission,
  AppStatus,
  AppCategory,
  AppFilters,
  PaginatedResponse,
} from "@/types";

export interface DatabaseApp {
  id: string;
  name: string;
  description: string;
  status: string;
  submitted_at: string;
  updated_at: string;
  developer_id: string;
  developer_name: string;
  developer_email: string;
  category: string;
  version: string;
  downloads: number;
  rating: number;
  file_size: number;
}

function dbAppToAppSubmission(dbApp: DatabaseApp): AppSubmission {
  return {
    id: dbApp.id,
    name: dbApp.name,
    description: dbApp.description,
    status: dbApp.status as AppStatus,
    submittedAt: dbApp.submitted_at,
    updatedAt: dbApp.updated_at,
    developer: {
      id: dbApp.developer_id,
      name: dbApp.developer_name,
      email: dbApp.developer_email,
    },
    category: dbApp.category as AppCategory,
    version: dbApp.version,
    metadata: {
      downloads: dbApp.downloads,
      rating: dbApp.rating,
      fileSize: dbApp.file_size,
    },
  };
}

export async function getApps(
  filters: AppFilters = {},
  limit = 50,
  cursor?: string,
): Promise<PaginatedResponse<AppSubmission>> {
  let query = db.selectFrom("app_submissions");

  // Apply search filter
  if (filters.search) {
    const searchTerm = `%${filters.search.toLowerCase()}%`;
    query = query.where((eb) =>
      eb.or([
        eb("name", "like", searchTerm),
        eb("description", "like", searchTerm),
      ]),
    );
  }

  // Apply status filter
  if (filters.status && filters.status.length > 0) {
    query = query.where("status", "in", filters.status);
  }

  // Apply category filter
  if (filters.category && filters.category.length > 0) {
    query = query.where("category", "in", filters.category);
  }

  // Apply sorting
  const sortBy = filters.sortBy || "submitted_at";
  const sortOrder = filters.sortOrder || "desc";

  if (sortBy === "name") {
    query = query.orderBy("name", sortOrder);
  } else if (sortBy === "rating") {
    query = query.orderBy("rating", sortOrder);
  } else {
    query = query.orderBy("submitted_at", sortOrder);
  }

  // Apply cursor pagination
  if (cursor) {
    try {
      const cursorValue = Buffer.from(cursor, "base64").toString("utf8");
      if (sortBy === "name") {
        query =
          sortOrder === "desc"
            ? query.where("name", "<", cursorValue)
            : query.where("name", ">", cursorValue);
      } else if (sortBy === "rating") {
        query =
          sortOrder === "desc"
            ? query.where("rating", "<", parseFloat(cursorValue))
            : query.where("rating", ">", parseFloat(cursorValue));
      } else {
        query =
          sortOrder === "desc"
            ? query.where("submitted_at", "<", cursorValue)
            : query.where("submitted_at", ">", cursorValue);
      }
    } catch (error) {
      // Invalid cursor, ignore
    }
  }

  // Check if there's a next page
  const results = await query
    .selectAll()
    .limit(limit + 1)
    .execute();

  const hasNextPage = results.length > limit;
  const data = results.slice(0, limit);

  let nextCursor: string | undefined;
  if (hasNextPage && data.length > 0) {
    const lastItem = data[data.length - 1];
    let cursorValue: string;
    if (sortBy === "name") {
      cursorValue = lastItem.name;
    } else if (sortBy === "rating") {
      cursorValue = lastItem.rating.toString();
    } else {
      cursorValue = lastItem.submitted_at;
    }
    nextCursor = Buffer.from(cursorValue, "utf8").toString("base64");
  }

  // Get total count for pagination info
  let countQuery = db
    .selectFrom("app_submissions")
    .select((eb) => eb.fn.count("id").as("count"));

  if (filters.search) {
    const searchTerm = `%${filters.search.toLowerCase()}%`;
    countQuery = countQuery.where((eb) =>
      eb.or([
        eb("name", "like", searchTerm),
        eb("description", "like", searchTerm),
      ]),
    );
  }

  if (filters.status && filters.status.length > 0) {
    countQuery = countQuery.where("status", "in", filters.status);
  }

  if (filters.category && filters.category.length > 0) {
    countQuery = countQuery.where("category", "in", filters.category);
  }

  const countResult = await countQuery.executeTakeFirst();
  const totalCount = Number(countResult?.count || 0);

  return {
    data: data.map(dbAppToAppSubmission),
    pagination: {
      hasNextPage,
      hasPreviousPage: !!cursor,
      nextCursor,
      totalCount,
    },
  };
}

export async function getAppById(id: string): Promise<AppSubmission | null> {
  const result = await db
    .selectFrom("app_submissions")
    .selectAll()
    .where("id", "=", id)
    .executeTakeFirst();

  return result ? dbAppToAppSubmission(result) : null;
}

export async function updateAppStatus(
  id: string,
  status: AppStatus,
): Promise<AppSubmission | null> {
  const updatedAt = new Date().toISOString();

  await db
    .updateTable("app_submissions")
    .set({ status, updated_at: updatedAt })
    .where("id", "=", id)
    .execute();

  return getAppById(id);
}

export async function insertApp(app: AppSubmission): Promise<void> {
  await db
    .insertInto("app_submissions")
    .values({
      id: app.id,
      name: app.name,
      description: app.description,
      status: app.status,
      submitted_at: app.submittedAt,
      updated_at: app.updatedAt,
      developer_id: app.developer.id,
      developer_name: app.developer.name,
      developer_email: app.developer.email,
      category: app.category,
      version: app.version,
      downloads: app.metadata.downloads,
      rating: app.metadata.rating,
      file_size: app.metadata.fileSize,
    })
    .execute();
}
