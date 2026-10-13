import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: {
    default: "AI全能证件照 - 智能证件照处理工具",
    template: "%s | AI全能证件照"
  },
  description: "专业的在线证件照处理工具，免费使用，支持智能抠图、一键换底色、尺寸裁剪等功能。适用于各类证件照，包括身份证、护照、驾照等，快速生成符合标准的电子证件照。",
  keywords: [
    "证件照制作",
    "证件照在线制作",
    "免费证件照",
    "AI证件照",
    "在线证件照",
    "智能抠图",
    "换底色",
    "证件照尺寸调整",
    "电子证件照",
    "证件照处理",
    "AI全能证件照",
    "AI全能证件照工具",
    "AI全能证件照在线制作",
    "AI全能证件照免费",
    "AI全能证件照智能抠图",
    "AI全能证件照一键换底色",
    "AI全能证件照尺寸裁剪",
  ].join(", "),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head>
        <GoogleAnalytics />
      </head>
      <body className="font-sans">
        <Suspense fallback={null}>
          <Header />
        </Suspense>
        <main>
          <Suspense fallback={null}>
            {children}
          </Suspense>
        </main>
        <Footer />
      </body>
    </html>
  );
}
