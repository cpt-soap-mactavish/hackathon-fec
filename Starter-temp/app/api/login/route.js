import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { userService } from '@/lib/user-service';

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    const user = await userService.findUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 400 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 400 }
      );
    }

    // In a real app, you would generate a JWT token here
    // For this demo, we'll just return success

    return NextResponse.json(
      { message: 'Login successful', user: { name: user.name, email: user.email } },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: 'An error occurred while logging in.' },
      { status: 500 }
    );
  }
}
