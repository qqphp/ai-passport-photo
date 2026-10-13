# AI全能证件照

## 项目简介

AI全能证件照是一个在线证件照处理工具，支持智能抠图、一键换底色、尺寸裁剪等功能。

## 项目地址

[AI全能证件照](https://id.qqphp.site)

## 项目技术栈
- node v20.18.1
- Next.js 14
- Tailwind CSS
- TypeScript

## 注意事项
1. 需要配置环境变量
```
# 创建文件
touch .env.local
```
2. 在 layout.tsx 中配置 openGraph 地址
```
openGraph: {
    url: "https://yuqian.site",
    title: "AI全能证件照 - 智能证件照处理工具",
    description: "专业的在线证件照处理工具，支持智能抠图、一键换底色、尺寸裁剪等功能。",
    siteName: "AI全能证件照"
}
```
3. 项目使用的端口是 3005
4. 在 Next.js 14+ 中，只要在 app 目录下创建 sitemap.ts 文件，Next.js 就会自动在构建时生成 sitemap.xml
5. 部署的时候需要配置好Sqlite数据库
```
npm run db:generate
npm run db:push
```
