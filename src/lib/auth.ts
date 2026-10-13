import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { SignJWT } from 'jose';
import { nanoid } from 'nanoid';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface AuthPayload {
  userId: number;
  exp: number;
}

export async function verifyAuth(request?: NextRequest) {
  try {
    // 尝试从请求头获取 token
    let token: string | undefined;
    
    if (request) {
      // 优先从请求头获取
      token = request.headers.get('Authorization')?.split(' ')[1];
      
      // 如果请求头没有，从 cookies 获取
      if (!token) {
        token = request.cookies.get('token')?.value;
      }
    } else {
      // 如果没有 request 对象，使用 cookies() API
      const cookiesList = cookies();
      const tokenCookie = await cookiesList.get('token');
      token = tokenCookie?.value;
    }

    if (!token) {
      return null;
    }

    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(JWT_SECRET)
    );

    return payload as AuthPayload;
  } catch (error) {
    console.error('Auth verification error:', error);
    return null;
  }
}

export async function createToken(userId: number) {
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setJti(nanoid())
    .setIssuedAt()
    .setExpirationTime(process.env.JWT_EXPIRES_IN!)
    .sign(new TextEncoder().encode(process.env.JWT_SECRET));
  
  return token;
} 