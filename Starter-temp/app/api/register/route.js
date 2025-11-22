import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { userService } from '@/lib/user-service';
import { sendVerificationEmail } from '@/lib/mail';
import prisma from '@/lib/prisma';

export async function POST(req) {
  try {
    const { username, email, password, name } = await req.json();

    // Check if user exists by email OR username
    // Check if user exists by email OR username
    const existingUser = await prisma.user.findFirst({
        where: {
            OR: [
                { email: { equals: email, mode: 'insensitive' } },
                { username: { equals: username, mode: 'insensitive' } }
            ]
        }
    });

    if (existingUser) {
      if (existingUser.email === email) {
          return NextResponse.json({ message: 'Email already exists' }, { status: 400 });
      }
      return NextResponse.json({ message: 'Login ID already exists' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.user.create({
      data: {
        name: name || username,
        username,
        email,
        password: hashedPassword,
        verificationToken,
        verificationTokenExpiry,
        isVerified: false,
        role: 'STAFF' // Default role
      }
    });

    // await sendVerificationEmail(email, verificationToken); // Keep email logic if needed, or comment out for local dev speed

    return NextResponse.json(
      { message: 'User created successfully.' },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: 'An error occurred while registering the user.' },
      { status: 500 }
    );
  }
}
