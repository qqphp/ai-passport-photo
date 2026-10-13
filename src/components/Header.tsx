"use client";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useState, useEffect, Suspense } from "react";
import { UserCircle, Menu, X } from "lucide-react";
import LoginDialog from "./auth/LoginDialog";
import { useAuth } from "@/lib/store/auth";
import { getCurrentUser } from "@/lib/api/user";
import UserMenu from "./auth/UserMenu";

function HeaderContent() {
  const pathname = usePathname();
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const { token, user, setUser, logout, setToken } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const searchParams = useSearchParams();
  
  // 获取用户信息
  useEffect(() => {
    if (token && !user) {
      getCurrentUser(token)
        .then(setUser)
        .catch(() => {
          // 如果获取用户信息失败，清除 token
          logout();
        });
    }
  }, [token, user, setUser, logout]);

  // 处理登录回调中的 token
  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      // 保存 token
      setToken(token);
      
      // 获取用户信息
      getCurrentUser(token)
        .then(setUser)
        .catch(() => {
          logout();
        });
      
      // 清除 URL 中的 token
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [searchParams, setToken, setUser, logout]);

  const navItems = [
    { name: "证件照", href: "/" },
    { name: "定价", href: "/pricing" },
    { name: "关于我们", href: "/about" },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex h-16 items-center justify-between">
            <Link 
              href="/" 
              className="flex items-center gap-2 text-lg font-bold hover:opacity-90 transition-opacity"
              title="青石证件照工具 - AI全能证件照 - 智能证件照处理工具"
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

              {/* 用户菜单 */}
              <UserMenu
                user={user}
                onLogout={logout}
                onLogin={() => setIsLoginDialogOpen(true)}
              />
            </div>

            {/* 移动端菜单按钮 */}
            <div className="flex items-center gap-2 sm:hidden">
              <UserMenu
                user={user}
                onLogout={logout}
                onLogin={() => setIsLoginDialogOpen(true)}
              />
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

      {/* 登录对话框 */}
      <LoginDialog
        isOpen={isLoginDialogOpen}
        onClose={() => setIsLoginDialogOpen(false)}
      />
    </>
  );
}

export default function Header() {
  return (
    <Suspense fallback={null}>
      <HeaderContent />
    </Suspense>
  );
} 