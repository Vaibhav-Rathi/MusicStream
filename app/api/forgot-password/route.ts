import { prismaClient } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import nodemailer from "nodemailer";


export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    const user = await prismaClient.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json(
        { message: "If an account with that email exists, a reset link has been sent." },
        { status: 200 } 
      );
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date();
    resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1); 

    await prismaClient.user.update({
      where: { email },
      data: {
        resetToken,
        resetTokenExpiry
      }
    });

    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${resetToken}`;

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: Number(process.env.EMAIL_SERVER_PORT),
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
      secure: false
    });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "Reset your password",
      html: `
        <div>
          <h1>Password Reset</h1>
          <p>Click the link below to reset your password. This link expires in 1 hour.</p>
          <a href="${resetUrl}">Reset Password</a>
        </div>
      `
    });

    return NextResponse.json(
      { message: "If an account with that email exists, a reset link has been sent." },
      { status: 200 }
    );
  }catch (error: unknown) {
    console.error("Forgot password error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      { message: "Something went wrong", error: errorMessage },
      { status: 500 }
    );
  }
}
