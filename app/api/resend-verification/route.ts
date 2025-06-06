import { prismaClient } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json(
        { message: 'Invalid request body', e},
        { status: 400 }
      );
    }
    
    const { email } = body as { email?: string };

    if (!email) {
      return NextResponse.json(
        { message: 'Email is required' },
        { status: 400 }
      );
    }

    const user = await prismaClient.user.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json(
        { message: 'If your email exists in our system, a verification link has been sent' },
        { status: 200 }
      );
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { message: 'Your email is already verified. Please log in.' },
        { status: 400 }
      );
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date();
    tokenExpiry.setHours(tokenExpiry.getHours() + 24); 

    await prismaClient.user.update({
      where: { id: user.id },
      data: {
        verificationToken,
        verificationTokenExpiry: tokenExpiry
      }
    });

    await sendVerificationEmail(email, verificationToken);

    return NextResponse.json(
      { message: 'Verification email has been sent. Please check your inbox.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Resend verification error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    
    return NextResponse.json(
      { message: 'Something went wrong', error: errorMessage },
      { status: 500 }
    );
  }
}