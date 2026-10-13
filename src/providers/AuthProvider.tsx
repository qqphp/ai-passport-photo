"use client";
import { useEffect, Suspense } from "react";
import { useAuth } from "@/lib/store/auth";
import { useSearchParams } from "next/navigation";
import { getCurrentUser } from "@/lib/api/user";

function AuthStateManager() {
  const { token, user, setToken, setUser, logout } = useAuth();
  const searchParams = useSearchParams();

  // 处理登录回调中的 token
  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      setToken(token);
      // 清除 URL 中的 token
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [searchParams, setToken]);

  // 获取用户信息
  useEffect(() => {
    if (token && !user) {
      getCurrentUser(token)
        .then(setUser)
        .catch(() => {
          logout();
        });
    }
  }, [token, user, setUser, logout]);

  return null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense fallback={null}>
        <AuthStateManager />
      </Suspense>
      {children}
    </>
  );
} 