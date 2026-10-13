import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, memberships } from '@/lib/db/schema';
import { eq, and, gte, isNull, or } from 'drizzle-orm';
import { verifyAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 获取用户基本信息
    const user = await db.query.users.findFirst({
      where: eq(users.id, auth.userId),
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 获取当前有效的会员信息
    const membership = await db.query.memberships.findFirst({
      where: and(
        eq(memberships.userId, auth.userId),
        or(
          isNull(memberships.endDate),
          gte(memberships.endDate, new Date())
        )
      ),
      orderBy: (memberships, { desc }) => [desc(memberships.id)],
    });

    // 构建响应数据
    const response = {
      nickname: user.nickname,
      avatarUrl: user.avatarUrl,
      planType: membership?.planType || 'free',
      endDate: membership?.endDate ? new Date(membership.endDate).toISOString() : null,
      remainingUses: membership?.remainingUses ?? 0,
    };

    // 创建响应对象并设置禁用缓存的响应头
    const jsonResponse = NextResponse.json(response);
    
    // 设置禁用缓存的响应头
    jsonResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    jsonResponse.headers.set('Pragma', 'no-cache');
    jsonResponse.headers.set('Expires', '0');
    jsonResponse.headers.set('Surrogate-Control', 'no-store');

    return jsonResponse;

  } catch (error) {
    console.error('Get user info error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 