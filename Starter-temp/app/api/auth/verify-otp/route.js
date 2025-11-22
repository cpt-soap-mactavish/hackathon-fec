import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ message: 'Email and OTP are required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json({ message: 'Invalid OTP' }, { status: 400 });
    }

    // Check if OTP attempts exceeded
    if (user.resetOtpAttempts >= 3) {
      return NextResponse.json({ 
        message: 'Too many failed attempts. Please request a new OTP.' 
      }, { status: 400 });
    }

    // Check if OTP expired
    if (!user.resetTokenExpiry || new Date() > user.resetTokenExpiry) {
      return NextResponse.json({ message: 'OTP has expired' }, { status: 400 });
    }

    // Verify OTP
    if (user.resetToken !== otp) {
      // Increment failed attempts
      await prisma.user.update({
        where: { email },
        data: { resetOtpAttempts: user.resetOtpAttempts + 1 }
      });
      
      return NextResponse.json({ 
        message: `Invalid OTP. ${2 - user.resetOtpAttempts} attempts remaining.` 
      }, { status: 400 });
    }

    // OTP is valid
    return NextResponse.json({ 
      message: 'OTP verified successfully',
      success: true 
    }, { status: 200 });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
