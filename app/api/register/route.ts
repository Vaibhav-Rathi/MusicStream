import { prismaClient } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { Provider } from "@prisma/client";
import { sendVerificationEmail } from "@/lib/email";

interface RegistrationRequestBody {
  name: string;
  email: string;
  password: string;
  provider?: Provider;
}

export async function POST(request: NextRequest) {
  try {
    const body: RegistrationRequestBody = await request.json();
    const { name, email, password, provider = 'Credentials' } = body;

    const existingUser = await prismaClient.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'Email already in use' },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date();
    tokenExpiry.setHours(tokenExpiry.getHours() + 24);

    const user = await prismaClient.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        provider: provider as Provider,
        verificationToken,
        verificationTokenExpiry: tokenExpiry,
      }
    });

    try {
      await sendVerificationEmail(email, verificationToken);
    } catch (emailError) {
      console.error('Error sending verification email:', emailError);
      return NextResponse.json(
        { 
          user: { name, email }, 
          message: 'User created successfully. However, there was an issue sending the verification email. Please try again later.' 
        },
        { status: 201 }
      );
    }

    const { password: _, verificationToken: __, verificationTokenExpiry: ___, ...userWithoutSensitiveInfo } = user;
    
    return NextResponse.json(
      { 
        user: userWithoutSensitiveInfo, 
        message: 'User created successfully. Please check your email to verify your account.' 
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'Something went wrong', error: error.message },
      { status: 500 }
    );
  }
}
