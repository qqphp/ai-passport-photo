"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { name: "证件照", href: "/" },
    { name: "关于", href: "/about" },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex h-16 items-center justify-between">
            <Link 
              href="/" 
              className="flex items-center gap-2 text-lg font-bold hover:opacity-90 transition-opacity"
              title="AI全能证件照 - 智能证件照处理工具"
            >
              <Image
                src="/logo.png"
                alt="AI全能证件照"
                width={32}
                height={32}
                className="w-8 h-8"
              />
              <span className="text-base sm:text-lg">AI全能证件照</span>
            </Link>
            
            {/* 桌面端导航 */}
            <div className="hidden sm:flex items-center gap-4">
              <ul className="flex gap-4">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`px-3 py-2 rounded-md transition-colors
                        ${pathname === item.href
                          ? "bg-foreground text-background"
                          : "hover:bg-foreground/5"
                        }`}
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>

            </div>

            {/* 移动端菜单按钮 */}
            <div className="flex items-center gap-2 sm:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-md hover:bg-foreground/5"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </nav>
        </div>

        {/* 移动端菜单 */}
        {isMobileMenuOpen && (
          <div className="sm:hidden border-t bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
              <ul className="space-y-1">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`block px-3 py-2 rounded-md transition-colors
                        ${pathname === item.href
                          ? "bg-foreground text-background"
                          : "hover:bg-foreground/5"
                        }`}
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </header>

    </>
  );
}
