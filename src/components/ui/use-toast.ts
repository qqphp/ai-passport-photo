import { useState, useCallback } from 'react';

interface ToastState {
  isOpen: boolean;
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

export function useToast() {
  const [toastState, setToastState] = useState<ToastState>({
    isOpen: false,
    title: '',
  });

  const toast = useCallback(({ title, description, variant = 'default' }: Omit<ToastState, 'isOpen'>) => {
    setToastState({
      isOpen: true,
      title,
      description,
      variant,
    });

    // 自动关闭
    setTimeout(() => {
      setToastState(prev => ({ ...prev, isOpen: false }));
    }, 3000);
  }, []);

  return { toast, toastState };
} 