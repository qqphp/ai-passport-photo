import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function paymentMiddleware(request: NextRequest) {
  const contentType = request.headers.get('content-type');
  
  // 检查是否来自微信支付的通知
  if (!request.headers.get('Wechatpay-Signature')) {
    return NextResponse.json({ code: 'FAIL', message: '非法请求' }, { status: 403 });
  }

  // 获取原始请求体
  const rawBody = await request.text();
  
  // 将原始请求体附加到请求对象
  const requestWithBody = new Request(request.url, {
    method: request.method,
    headers: request.headers,
    body: rawBody,
  });

  // @ts-ignore
  requestWithBody.rawBody = rawBody;

  return requestWithBody;
} 