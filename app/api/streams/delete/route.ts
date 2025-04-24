import { prismaClient } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const streamId = searchParams.get("streamId");

    if (!streamId) {
      return NextResponse.json({ success: false, error: "Missing streamId" }, { status: 400 });
    }

    const existingStream = await prismaClient.stream.findUnique({
      where: { id: streamId },
    });

    if (!existingStream) {
      return NextResponse.json({ success: false, error: "Stream not found" }, { status: 404 });
    }

    await prismaClient.upvote.deleteMany({
      where: { streamId: streamId },
    });

    await prismaClient.stream.delete({
      where: { id: streamId },
    });

    return NextResponse.json({ success: true, message: "Stream and related upvotes deleted successfully" });
  } catch (error) {
    console.error("Error deleting stream:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to delete stream: " + (error instanceof Error ? error.message : "Unknown error")
    }, { status: 500 });
  }
}
