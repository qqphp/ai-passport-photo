export default function Footer() {
  const currentYear = new Date().getFullYear();

  const friendlyLinks = [
    { name: '图优助手', url: 'https://toimg.site' },
  ];

  return (
    <footer className="w-full border-t bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col gap-6 text-sm text-gray-500">
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <span>QQ交流群：581711375</span>
              <span className="hidden sm:inline">|</span>
              <span className="text-gray-400">欢迎加入技术交流讨论</span>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <span>商务合作微信：code0803</span>
              <span className="hidden sm:inline">|</span>
              <span className="text-gray-400">提供技术解决方案、软件定制开发、AI应用等服务</span>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2 pt-2 border-t border-gray-200">
            <span className="text-gray-400">友情链接：</span>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
              {friendlyLinks.map((link, index) => (
                <div key={link.url} className="flex items-center">
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </a>
                  {index < friendlyLinks.length - 1 && (
                    <span className="ml-4 text-gray-300">·</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-2 pt-2 border-t border-gray-200">
            <span>© {currentYear}</span>
            <span>青石证件照工具</span>
            <span className="hidden sm:inline">|</span>
            <span>版权所有</span>
            <span className="hidden sm:inline">|</span>
            <a
              href="https://beian.miit.gov.cn/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              湘ICP备2024094908号-3
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
} 