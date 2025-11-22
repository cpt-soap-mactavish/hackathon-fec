import { NextResponse } from 'next/server';
import { userService } from '@/lib/user-service';

export async function POST(req) {
  try {
    const { token } = await req.json();

    const user = await userService.findUserByVerificationToken(token);

    if (!user) {
      return NextResponse.json({ message: 'Invalid or expired token' }, { status: 400 });
    }

    await userService.updateUser({ email: user.email }, {
      isVerified: true,
      verificationToken: null,
      verificationTokenExpiry: null
    });

    return NextResponse.json({ message: 'Email verified successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
