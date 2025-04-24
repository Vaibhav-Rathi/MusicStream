import { NextRequest, NextResponse } from "next/server";
import { prismaClient } from "@/lib/db";

export async function PATCH(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const streamId = searchParams.get("songId"); 

    if (!streamId) {
      return NextResponse.json({ success: false, error: "Missing streamId" }, { status: 400 });
    }

    const updatedStream = await prismaClient.stream.update({
      where: { id: streamId },
      data: { active: true },
    });

    return NextResponse.json({ success: true, updatedStream });
  } catch (error) {
    console.error("Error activating stream:", error);
    return NextResponse.json({ success: false, error: "Failed to activate stream" }, { status: 500 });
  }
}
