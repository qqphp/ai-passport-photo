import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orders, memberships } from '@/lib/db/schema';
import { eq, and, or, isNull, gte } from 'drizzle-orm';
import { WechatPay } from '@/lib/utils/wechat-pay';

const wxpay = new WechatPay();

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const result = wxpay.verifyNotification(request.headers, body);

    // 打印回调通知信息
    // console.log('Received notification headers:', request.headers);
    // console.log('Received notification body:', body);
    // console.log('Verification result:', result);

    if (!result) {
      return NextResponse.json({ code: 'FAIL', message: '签名验证失败' });
    }

    // 根据文档，需要判断通知类型
    const notificationData = JSON.parse(body);
    if (notificationData.event_type !== 'TRANSACTION.SUCCESS') {
      return NextResponse.json({ code: 'SUCCESS' });
    }

    // 解密后的通知数据
    const { resource } = notificationData;
    const decryptedData = wxpay.decryptResource(resource);
    
    // 从解密后的数据中获取订单信息
    const { out_trade_no, trade_state, transaction_id } = decryptedData;
    
    // 查找订单
    const order = await db.query.orders.findFirst({
      where: eq(orders.orderNo, out_trade_no),
    });

    if (!order) {
      return NextResponse.json({ code: 'FAIL', message: '订单不存在' });
    }

    // 如果支付成功且订单状态不是已支付
    if (trade_state === 'SUCCESS' && order.status !== 'paid') {
      // 更新订单状态
      await db.update(orders)
        .set({ 
          status: 'paid',
          paidAt: new Date(),
          transactionId: transaction_id,
        })
        .where(eq(orders.id, order.id));

      // 获取用户当前有效的会员信息
      const currentMembership = await db.query.memberships.findFirst({
        where: and(
          eq(memberships.userId, order.userId),
          or(
            isNull(memberships.endDate),
            gte(memberships.endDate, new Date())
          )
        ),
      });

      const now = new Date();
      let newEndDate: Date | null = null;

      if (order.planType === 'vip') {
        // VIP会员 - 计算新的结束日期
        if (currentMembership?.endDate) {
          // 如果当前会员还未到期，从当前结束日期开始计算
          newEndDate = new Date(currentMembership.endDate.getTime() + 365 * 24 * 60 * 60 * 1000);
        } else {
          // 如果当前无会员或已过期，从现在开始计算
          newEndDate = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
        }
      } else {
        // 终身会员 - 无结束日期
        newEndDate = null;
      }

      const remainingUses = order.planType === 'vip' ? 88 : 188;

      if (currentMembership) {
        // 更新现有会员信息
        await db.update(memberships)
          .set({
            planType: order.planType,
            startDate: currentMembership.endDate && currentMembership.endDate > now 
              ? currentMembership.endDate  // 如果当前会员未到期，从到期日开始计算
              : now,  // 如果已过期，从现在开始
            endDate: newEndDate,
            remainingUses: remainingUses + (currentMembership.remainingUses || 0), // 累加剩余次数
          })
          .where(eq(memberships.id, currentMembership.id));
      } else {
        // 创建新的会员记录
        await db.insert(memberships).values({
          userId: order.userId,
          planType: order.planType,
          startDate: now,
          endDate: newEndDate,
          remainingUses,
        });
      }
    }

    // 按照文档要求，成功处理后返回 200 或 204 状态码
    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error('Payment notification error:', error);
    // 处理失败时返回 500 状态码和错误信息
    return NextResponse.json(
      { code: 'FAIL', message: '处理失败' },
      { status: 500 }
    );
  }
} 