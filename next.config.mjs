/** @type {import('next').NextConfig} */
const nextConfig = {
  // 阿里云 SDK 使用 Node 原生加载，保留服务端依赖的运行边界。
  serverExternalPackages: [
    '@alicloud/imageseg20191230',
    '@alicloud/openapi-client',
    '@alicloud/tea-util',
  ],
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
