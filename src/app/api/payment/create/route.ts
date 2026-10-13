import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orders } from '@/lib/db/schema';
import { nanoid } from 'nanoid';
import { verifyAuth } from '@/lib/auth';
import { WechatPay } from '@/lib/utils/wechat-pay';

const wxpay = new WechatPay();

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth) {
      console.log('Auth verification failed:', { 
        cookies: request.cookies.getAll(),
        headers: Object.fromEntries(request.headers),
        token: request.headers.get('Authorization'),
      });
      return NextResponse.json({ 
        error: 'Unauthorized',
        message: '请先登录后再进行支付'
      }, { status: 401 });
    }

    const { planType } = await request.json();
    if (!planType || !['vip', 'lifetime'].includes(planType)) {
      return NextResponse.json({ 
        error: 'Invalid plan type',
        message: '无效的会员类型'
      }, { status: 400 });
    }

    const amount = planType === 'vip' ? 5 : 8;
    const orderNo = `ORDER${nanoid(8)}`;
    
    try {
      const [order] = await db.insert(orders).values({
        userId: auth.userId,
        orderNo,
        amount,
        planType,
        status: 'pending',
        paymentMethod: 'wechat',
      }).returning();

      const description = planType === 'vip' ? 'VIP会员年费' : '终身会员费';
      const result = await wxpay.createOrder(
        orderNo,
        amount,
        description
      );

      return NextResponse.json({
        orderId: order.id,
        orderNo,
        codeUrl: result.code_url,
      });
    } catch (error) {
      console.error('Payment creation error:', error);
      return NextResponse.json({ 
        error: 'Payment creation failed',
        message: '创建支付订单失败，请重试'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Create payment error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: '服务器内部错误，请稍后重试'
    }, { status: 500 });
  }
} 