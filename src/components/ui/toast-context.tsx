"use client";
import React, { createContext, useContext, useState, useCallback } from 'react';
import Toast from '@/components/ui/Toast';

interface ToastContextType {
  toast: (props: {
    title: string;
    description?: string;
    variant?: 'default' | 'destructive';
  }) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<{
    message: string;
    type?: 'error' | 'success';
    id: number;
  }[]>([]);
  let nextId = 0;

  const toast = useCallback(({ title, description, variant = 'default' }) => {
    const id = nextId++;
    const type = variant === 'destructive' ? 'error' : 'success';
    const message = description ? `${title}\n${description}` : title;
    
    setToasts(prev => [...prev, { message, type, id }]);
    
    // 3秒后自动移除
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* 渲染所有的 toasts */}
      {toasts.map(({ message, type, id }) => (
        <Toast
          key={id}
          message={message}
          type={type}
          onClose={() => setToasts(prev => prev.filter(t => t.id !== id))}
        />
      ))}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
} 