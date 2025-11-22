import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import bcrypt from 'bcryptjs';
import { userService } from '@/lib/user-service';
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const user = await userService.findUserByEmail(session.user.email);

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Manually select fields to return
    const safeUser = {
        name: user.name,
        email: user.email,
        image: user.image,
        isVerified: user.isVerified
    };

    return NextResponse.json(safeUser, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { name, image, currentPassword, newPassword } = await req.json();
    const user = await userService.findUserByEmail(session.user.email);

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const updateData = {};

    // Update basic info
    if (name) updateData.name = name;
    if (image !== undefined) updateData.image = image;

    // Update password if provided
    if (newPassword) {
      if (!user.password) {
         return NextResponse.json({ message: 'You are logged in with Google. You cannot set a password here.' }, { status: 400 });
      }

      if (!currentPassword) {
        return NextResponse.json({ message: 'Current password is required to set a new password' }, { status: 400 });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return NextResponse.json({ message: 'Incorrect current password' }, { status: 400 });
      }

      updateData.password = await bcrypt.hash(newPassword, 10);
    }

    const updatedUser = await userService.updateUser({ email: session.user.email }, updateData);

    return NextResponse.json({ message: 'Profile updated successfully', user: { name: updatedUser.name, email: updatedUser.email, image: updatedUser.image } }, { status: 200 });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
