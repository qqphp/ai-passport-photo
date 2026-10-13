import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { memberships } from '@/lib/db/schema';
import { eq, and, gte, isNull, or } from 'drizzle-orm';
import { verifyAuth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

    if (!membership) {
      return NextResponse.json(
        { error: 'No membership found', message: '会员信息不存在' },
        { status: 403 }
      );
    }

    // 检查剩余次数
    if (membership.remainingUses <= 0) {
      return NextResponse.json(
        { error: 'No remaining uses', message: '免费用户可使用2次，请升级会员以获取更多使用次数' },
        { status: 403 }
      );
    }

    // 更新剩余次数
    const [updated] = await db.update(memberships)
      .set({ remainingUses: membership.remainingUses - 1 })
      .where(eq(memberships.id, membership.id))
      .returning();

    return NextResponse.json({
      remainingUses: updated.remainingUses,
    });
  } catch (error) {
    console.error('Update usage error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 