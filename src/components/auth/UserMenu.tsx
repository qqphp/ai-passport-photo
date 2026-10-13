"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, User, Crown, UserCircle } from "lucide-react";
import { useAuth } from "@/lib/store/auth";

interface UserInfo {
  nickname: string;
  avatarUrl: string;
  planType: 'free' | 'vip' | 'lifetime';
  endDate: string | null;
  remainingUses: number;
}

interface UserMenuProps {
  user: {
    nickname: string;
    avatarUrl: string;
  } | null;
  onLogout: () => void;
  onLogin: () => void;
}

export default function UserMenu({ user, onLogout, onLogin }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const { token } = useAuth();
  const menuRef = useRef<HTMLDivElement>(null);

  // 每次打开菜单时获取用户信息
  useEffect(() => {
    if (isOpen && token) {
      fetchUserInfo();
    }
  }, [isOpen, token]);

  // 添加点击外部关闭菜单的功能
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const fetchUserInfo = async () => {
    try {
      const response = await fetch('/api/user/info', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch user info');
      const data = await response.json();
      setUserInfo(data);
    } catch (error) {
      console.error('Fetch user info error:', error);
    }
  };

  const getPlanLabel = (planType: string) => {
    switch (planType) {
      case 'free':
        return '免费用户';
      case 'vip':
        return 'VIP会员';
      case 'lifetime':
        return '终身会员';
      default:
        return '未知';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '永久有效';
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* 头像按钮 */}
      <button
        onClick={() => user ? setIsOpen(!isOpen) : onLogin()}
        className="flex items-center gap-2 focus:outline-none"
      >
        {user ? (
          <Image
            src={user.avatarUrl}
            alt={user.nickname}
            width={32}
            height={32}
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            <UserCircle className="w-6 h-6 text-gray-500" />
          </div>
        )}
      </button>

      {/* 下拉菜单 */}
      <AnimatePresence>
        {isOpen && user && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-56 rounded-lg bg-background border shadow-lg py-1 z-50"
          >
            {/* 用户信息 */}
            <div className="px-4 py-2 border-b">
              <div className="flex items-center gap-2">
                <Image
                  src={user.avatarUrl}
                  alt={user.nickname}
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {user.nickname}
                  </p>
                </div>
              </div>
            </div>

            {/* 会员信息区域 */}
            {userInfo && (
              <div className="px-4 py-2 border-b space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Crown className="h-3.5 w-3.5" />
                  <span>
                    {userInfo.planType === 'free' ? (
                      '免费用户'
                    ) : (
                      <>
                        到期时间：
                        <span className="text-foreground">
                          {formatDate(userInfo.endDate)}
                        </span>
                      </>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="inline-block w-3.5 h-3.5 text-center font-bold">
                    #
                  </span>
                  <span>
                    剩余次数：
                    <span className={`text-foreground font-medium ${
                      userInfo.remainingUses === 0 ? 'text-red-500' : ''
                    }`}>
                      {userInfo.remainingUses}
                    </span>
                  </span>
                </div>
              </div>
            )}

            {/* 菜单项 */}
            <div className="py-1">
              <button
                onClick={onLogout}
                className="w-full px-4 py-2 text-sm text-left flex items-center gap-2 hover:bg-foreground/5 transition-colors text-destructive"
              >
                <LogOut className="w-4 h-4" />
                退出登录
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 