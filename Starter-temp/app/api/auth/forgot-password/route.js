import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendPasswordResetEmail } from '@/lib/mail';

// Generate 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req) {
  try {
    const { email } = await req.json();

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // For security, don't reveal if the user exists
      return NextResponse.json({ 
        message: 'If an account exists with this email, an OTP has been sent.' 
      }, { status: 200 });
    }

    // If user registered with Google (no password), they can't reset it here
    if (!user.password) {
      return NextResponse.json({ 
        message: 'This account uses Google Login. Please sign in with Google.' 
      }, { status: 400 });
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.user.update({
      where: { email },
      data: {
        resetToken: otp,
        resetTokenExpiry: otpExpiry,
        resetOtpAttempts: 0 // Reset attempts
      }
    });

    await sendPasswordResetEmail(email, otp);

    return NextResponse.json({ 
      message: 'If an account exists with this email, an OTP has been sent.',
      success: true 
    }, { status: 200 });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
