import { NextResponse } from 'next/server';

// Mock users - in production use a proper auth system like NextAuth.js
const users = [
  {
    id: 'user-1',
    email: 'alex@businessfinder.com',
    password: 'hashed_password_here', // In production, use bcrypt
    name: 'Alex Seller',
    role: 'user',
    accountType: 'both',
    isVerified: true,
  },
  {
    id: 'admin-1',
    email: 'admin@businessfinder.com',
    password: 'hashed_password_here',
    name: 'Sarah Admin',
    role: 'admin',
    accountType: 'both',
    isVerified: true,
  },
];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, email, password, name } = body;

    if (action === 'login') {
      // Login logic
      const user = users.find((u) => u.email === email);

      if (!user) {
        return NextResponse.json(
          { success: false, error: 'Invalid credentials' },
          { status: 401 }
        );
      }

      // In production, compare hashed passwords
      // const isValid = await bcrypt.compare(password, user.password);

      // Return user data (without password)
      const { password: _, ...userData } = user;

      return NextResponse.json({
        success: true,
        data: {
          user: userData,
          token: 'mock_jwt_token_here', // In production, generate a real JWT
        },
      });
    }

    if (action === 'register') {
      // Registration logic
      const existingUser = users.find((u) => u.email === email);

      if (existingUser) {
        return NextResponse.json(
          { success: false, error: 'Email already registered' },
          { status: 400 }
        );
      }

      const newUser = {
        id: `user-${Date.now()}`,
        email,
        password, // In production, hash with bcrypt
        name,
        role: 'user' as const,
        accountType: 'buyer' as const,
        isVerified: false,
      };

      users.push(newUser);

      const { password: _, ...userData } = newUser;

      return NextResponse.json(
        {
          success: true,
          data: {
            user: userData,
            token: 'mock_jwt_token_here',
          },
        },
        { status: 201 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Invalid request' },
      { status: 400 }
    );
  }
}
