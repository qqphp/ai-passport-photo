"use client";
import { useEffect } from "react";

interface WechatLoginProps {
  onSuccess: (code: string) => void;
}

export default function WechatLogin({ onSuccess }: WechatLoginProps) {
  useEffect(() => {
    // 根据环境选择回调地址
    const redirectUri = process.env.NODE_ENV === 'production'
      ? process.env.NEXT_PUBLIC_WECHAT_REDIRECT_URI
      : process.env.NEXT_PUBLIC_WECHAT_REDIRECT_URI_LOCAL;

    // 验证环境变量是否存在
    if (!process.env.NEXT_PUBLIC_WECHAT_APP_ID || !redirectUri) {
      console.error('Missing WeChat configuration');
      return;
    }

    // 加载微信 JS SDK
    const script = document.createElement("script");
    script.src = "//res.wx.qq.com/connect/zh_CN/htmledition/js/wxLogin.js";
    document.body.appendChild(script);

    script.onload = () => {
      try {
        // 初始化微信登录
        new window.WxLogin({
          self_redirect: false,
          id: "wechat-login-container",
          appid: process.env.NEXT_PUBLIC_WECHAT_APP_ID,
          scope: "snsapi_login",
          redirect_uri: encodeURIComponent(redirectUri),
          state: crypto.randomUUID(),
          style: "black",
          href: `data:text/css;base64,${btoa(`
            .impowerBox {
              width: 192px !important;
              height: 192px !important;
              border: none !important;
              margin: 0 auto !important;
            }
            .impowerBox .qrcode {
              width: 192px !important;
              height: 192px !important;
              border: none !important;
              margin: 0 !important;
            }
            .impowerBox .title, .impowerBox .info, .impowerBox .status {
              display: none !important;
            }
            .impowerBox .wrp_code {
              margin-top: 0 !important;
              border-radius: 12px !important;
              overflow: hidden !important;
              background-color: white !important;
            }
            .impowerBox .imgCode {
              width: 160px !important;
              height: 160px !important;
              margin: 16px !important;
              border: none !important;
            }
          `)}`,
        });
      } catch (error) {
        console.error('Failed to initialize WeChat login:', error);
      }
    };

    return () => {
      // 清理脚本
      const existingScript = document.querySelector(`script[src="${script.src}"]`);
      if (existingScript && existingScript.parentNode) {
        existingScript.parentNode.removeChild(existingScript);
      }
    };
  }, []);

  return (
    <div 
      id="wechat-login-container" 
      className="w-48 h-48 overflow-hidden"
    />
  );
} 