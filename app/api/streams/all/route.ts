import { prismaClient } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {
      const streams = await prismaClient.stream.findMany({
        include: {
          upvotes: true, 
        }
      });
      
      return NextResponse.json(streams);
    } catch (error) {
      console.error("Error fetching streams:", error);
      return NextResponse.json(
        { message: 'Failed to fetch streams' },
        { status: 500 }
      );
    }
  }