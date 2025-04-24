import { prismaClient } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email query param is required" }, { status: 400 });
    }

    const user = await prismaClient.user.findUnique({
      where: { email },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ id: user.id });
  } catch (error) {
    console.error("Error fetching user ID:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
