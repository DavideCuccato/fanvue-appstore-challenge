import { NextRequest, NextResponse } from "next/server";
import { getApps } from "@/db/queries";
import { AppFilters, AppStatus, AppCategory } from "@/types";
import { env } from "@/lib/env";
import { withApiLogging } from "@/lib/api-middleware";

const CACHE_HEADERS = {
  "Cache-Control": `public, max-age=${env.API_CACHE_MAX_AGE}, stale-while-revalidate=${env.API_CACHE_STALE_WHILE_REVALIDATE}`,
};

async function handleGet(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const cursor = searchParams.get("cursor");
    const search = searchParams.get("search");
    const status = searchParams.getAll("status") as AppStatus[];
    const category = searchParams.getAll("category") as AppCategory[];
    const sortBy =
      (searchParams.get("sortBy") as "name" | "submittedAt" | "rating") ||
      "submittedAt";
    const sortOrder =
      (searchParams.get("sortOrder") as "asc" | "desc") || "desc";

    const filters: AppFilters = {
      search: search || undefined,
      status: status.length > 0 ? status : undefined,
      category: category.length > 0 ? category : undefined,
      sortBy,
      sortOrder,
    };

    const response = await getApps(filters, 50, cursor || undefined);

    return NextResponse.json(
      {
        success: true,
        data: response,
        timestamp: new Date().toISOString(),
      },
      {
        status: 200,
        headers: CACHE_HEADERS,
      },
    );
  } catch (error) {
    throw error;
  }
}

export const GET = withApiLogging(handleGet);
