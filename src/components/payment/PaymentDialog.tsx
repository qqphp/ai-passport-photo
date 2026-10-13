"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, QrCode } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import LoginDialog from "@/components/auth/LoginDialog";
import { useAuth } from "@/lib/store/auth";

interface PaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  planType: 'vip' | 'lifetime' | null;
}

export default function PaymentDialog({ isOpen, onClose, planType }: PaymentDialogProps) {
  const { token } = useAuth();
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const timerRef = useRef<NodeJS.Timeout>();
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 60;

  // 创建支付订单
  const createPayment = async () => {
    if (!token) {
      setIsLoginDialogOpen(true);
      return;
    }

    try {
      const response = await fetch('/api/payment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ planType }),
      });

      if (!response.ok) {
        const error = await response.json();
        if (response.status === 401) {
          setIsLoginDialogOpen(true);
          return;
        }
        throw new Error(error.message || 'Failed to create payment');
      }

      const data = await response.json();
      setQrCodeUrl(data.codeUrl);
      setOrderId(data.orderId);
    } catch (error) {
      console.error('Create payment error:', error);
      toast.error('创建支付订单失败，请重试');
      onClose();
    }
  };

  // 检查支付状态
  const checkPaymentStatus = async () => {
    if (!orderId || isChecking) return;
    if (retryCount >= MAX_RETRIES) {
      cleanup();
      toast.error('支付超时，请重新尝试');
      onClose();
      return;
    }

    setIsChecking(true);
    try {
      const response = await fetch(`/api/payment/status/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        const error = await response.json();
        if (response.status === 401) {
          cleanup();
          setIsLoginDialogOpen(true);
          return;
        }
        throw new Error(error.message || 'Failed to check payment status');
      }

      const data = await response.json();
      if (data.status === 'paid') {
        cleanup();
        toast.success('支付成功！');
        onClose();
        window.location.reload();
      } else {
        setRetryCount(prev => prev + 1);
      }
    } catch (error) {
      setRetryCount(prev => prev + 1);
    } finally {
      setIsChecking(false);
    }
  };

  // 清理函数
  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setQrCodeUrl(null);
    setOrderId(null);
    setIsChecking(false);
  }, []);

  // 处理关闭
  const handleClose = useCallback(() => {
    cleanup();
    onClose();
  }, [cleanup, onClose]);

  // 定时检查支付状态
  useEffect(() => {
    if (orderId) {
      timerRef.current = setInterval(checkPaymentStatus, 3000);
      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }
  }, [orderId]);

  // 重置重试计数
  useEffect(() => {
    if (isOpen) {
      setRetryCount(0);
    }
  }, [isOpen]);

  // 监听登录状态变化
  useEffect(() => {
    if (isOpen && planType && token) {
      createPayment();
    }
  }, [isOpen, planType, token]);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div 
              className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm" 
              onClick={handleClose}
            />
            
            <div className="flex min-h-full items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative bg-background rounded-lg shadow-xl p-6 w-full max-w-md"
              >
                <button
                  onClick={handleClose}
                  className="absolute right-4 top-4 text-gray-400 hover:text-gray-500"
                >
                  <X className="h-5 w-5" />
                </button>

                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-4">
                    微信扫码支付
                  </h3>
                  
                  <div className="mb-4">
                    <p className="text-sm text-foreground/70">
                      {planType === 'vip' ? 'VIP会员 - ¥5/年' : '终身会员 - ¥8'}
                    </p>
                  </div>

                  {qrCodeUrl ? (
                    <div className="flex justify-center mb-4">
                      <div className="p-4 bg-white rounded-lg">
                        <QRCodeSVG 
                          value={qrCodeUrl} 
                          size={200}
                          level="H" // 使用高级纠错级别
                          includeMargin={true}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-center mb-4">
                      <div className="animate-spin">
                        <QrCode className="w-8 h-8" />
                      </div>
                    </div>
                  )}

                  <p className="text-sm text-foreground/60">
                    请使用微信扫描二维码完成支付
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      <LoginDialog
        isOpen={isLoginDialogOpen}
        onClose={() => {
          setIsLoginDialogOpen(false);
          if (!token) {
            handleClose();
          }
        }}
      />
    </>
  );
} 