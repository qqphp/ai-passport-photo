import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orders } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { WechatPay } from '@/lib/utils/wechat-pay';
import { verifyAuth } from '@/lib/auth';

const wxpay = new WechatPay();

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    // 验证用户身份
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 获取订单ID
    const orderId = parseInt(params.orderId);
    if (isNaN(orderId)) {
      return NextResponse.json(
        { error: 'Invalid order ID' },
        { status: 400 }
      );
    }
    
    // 同时匹配订单ID和用户ID
    const order = await db.query.orders.findFirst({
      where: and(
        eq(orders.id, orderId),
        eq(orders.userId, auth.userId)
      ),
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found', message: '订单不存在或无权查看' },
        { status: 404 }
      );
    }

    // 如果订单已支付，直接返回状态
    if (order.status === 'paid') {
      return NextResponse.json({ status: 'paid' });
    }

    try {
      // 调用微信支付查询订单API
      const result = await wxpay.queryOrder(order.orderNo);
      
      // 根据微信支付文档，判断支付状态
      if (result.trade_state === 'SUCCESS') {
        // 更新本地订单状态
        await db.update(orders)
          .set({ 
            status: 'paid',
            paidAt: new Date(),
          })
          .where(eq(orders.id, order.id));
          
        return NextResponse.json({ status: 'paid' });
      }
      
      // 其他状态返回未支付
      return NextResponse.json({ status: 'pending' });
    } catch (error) {
      console.error('Query order error:', error);
      return NextResponse.json({ status: 'pending' });
    }
  } catch (error) {
    console.error('Check payment status error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 