import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, memberships } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { createToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { getAccessToken, getWechatUserInfo } from '@/lib/utils/wechat';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json(
        { error: 'Missing code parameter' },
        { status: 400 }
      );
    }

    // 获取访问令牌
    const tokenData = await getAccessToken(code);
    if (tokenData.errcode) {
      return NextResponse.json(
        { error: tokenData.errmsg },
        { status: 400 }
      );
    }

    // 获取微信用户信息
    const wechatUserInfo = await getWechatUserInfo(tokenData.access_token, tokenData.openid);
    if (wechatUserInfo.errcode) {
      return NextResponse.json(
        { error: wechatUserInfo.errmsg },
        { status: 400 }
      );
    }

    // 查找或创建用户
    let user = await db.query.users.findFirst({
      where: eq(users.openId, tokenData.openid),
    });

    if (!user) {
      const [newUser] = await db.insert(users).values({
        openId: tokenData.openid,
        nickname: wechatUserInfo.nickname,
        avatarUrl: wechatUserInfo.headimgurl,
      }).returning();
      user = newUser;
    }

    // 检查用户是否已有会员信息
    const existingMembership = await db.query.memberships.findFirst({
      where: eq(memberships.userId, user.id),
    });

    // 如果没有会员信息，创建免费会员记录
    if (!existingMembership) {
      await db.insert(memberships).values({
        userId: user.id,
        planType: 'free',
        startDate: new Date(),
        endDate: null,
        remainingUses: 2, // 免费用户初始2次使用机会
      });
    }

    // 创建 JWT token
    const token = await createToken(user.id);

    // 根据请求来源确定重定向地址
    const isLocalhost = request.headers.get('host')?.includes('localhost') || 
                       request.headers.get('host')?.includes('0.0.0.0');
    
    const baseUrl = isLocalhost
      ? 'http://localhost:3005'
      : 'https://yuqian.site';
    
    // 创建重定向响应
    const redirectUrl = new URL('/', baseUrl);
    redirectUrl.searchParams.set('token', token);
    
    const response = NextResponse.redirect(redirectUrl.toString());

    // 设置 cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Wechat callback error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 