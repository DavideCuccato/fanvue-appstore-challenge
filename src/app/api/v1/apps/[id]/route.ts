import { NextRequest, NextResponse } from "next/server";
import { getAppById, updateAppStatus } from "@/db/queries";
import { AppStatus, AppAction } from "@/types";
import { withApiLogging } from "@/lib/api-middleware";

async function handlePatch(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = (await request.json()) as AppAction;

    const app = await getAppById(id);
    if (!app) {
      return NextResponse.json(
        {
          success: false,
          message: "App not found",
          timestamp: new Date().toISOString(),
        },
        { status: 404 },
      );
    }

    let newStatus: AppStatus;
    switch (body.type) {
      case "approve":
        newStatus = AppStatus.APPROVED;
        break;
      case "reject":
        newStatus = AppStatus.REJECTED;
        break;
      case "flag":
        newStatus = AppStatus.FLAGGED;
        break;
      default:
        return NextResponse.json(
          {
            success: false,
            message: "Invalid action",
            timestamp: new Date().toISOString(),
          },
          { status: 400 },
        );
    }

    const updatedApp = await updateAppStatus(id, newStatus);

    return NextResponse.json({
      success: true,
      data: updatedApp,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    throw error;
  }
}

export const PATCH = withApiLogging(handlePatch);
