const WECHAT_API = 'https://api.weixin.qq.com';

export async function getAccessToken(code: string) {
  const params = new URLSearchParams({
    appid: process.env.NEXT_PUBLIC_WECHAT_APP_ID!,
    secret: process.env.WECHAT_APP_SECRET!,
    code,
    grant_type: 'authorization_code',
  });

  const response = await fetch(
    `${WECHAT_API}/sns/oauth2/access_token?${params.toString()}`
  );
  return response.json();
}

export async function getWechatUserInfo(accessToken: string, openId: string) {
  const response = await fetch(
    `${WECHAT_API}/sns/userinfo?access_token=${accessToken}&openid=${openId}`
  );
  return response.json();
} 