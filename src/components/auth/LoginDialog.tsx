"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Zap, Shield, Image, Laptop } from "lucide-react";
import WechatLogin from "./WechatLogin";

interface LoginDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginDialog({ isOpen, onClose }: LoginDialogProps) {
  const handleLoginSuccess = (code: string) => {
    // 微信登录成功后会自动跳转，不需要在这里处理
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* 背景遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* 对话框内容 */}
          <div className="min-h-screen px-4 text-center">
            <span className="inline-block h-screen align-middle" aria-hidden="true">&#8203;</span>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="inline-block w-full max-w-3xl p-6 my-8 overflow-hidden text-left align-middle bg-background shadow-xl rounded-2xl relative"
            >
              {/* 关闭按钮 */}
              <button
                onClick={onClose}
                className="absolute right-4 top-4 text-gray-400 hover:text-gray-500 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* 左侧产品介绍 */}
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold">欢迎使用 AI全能证件照</h2>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <Zap className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">智能抠图</h3>
                        <p className="text-sm text-foreground/70">一键抠图，快速精准地分离人像</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <Shield className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">隐私安全</h3>
                        <p className="text-sm text-foreground/70">本地处理，保护您的隐私安全</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                        <Image className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">规格齐全</h3>
                        <p className="text-sm text-foreground/70">支持证件照、证书照等多种规格</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                        <Laptop className="w-4 h-4 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">一键换底</h3>
                        <p className="text-sm text-foreground/70">快速更换照片背景颜色</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 右侧微信登录 */}
                <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-medium mb-4">微信扫码登录</h3>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <WechatLogin onSuccess={handleLoginSuccess} />
                  </div>
                  <p className="mt-4 text-sm text-gray-500">
                    使用微信扫一扫登录
                  </p>
                  <p className="mt-2 text-xs text-center text-foreground/60">
                    登录即表示同意我们的服务条款和隐私政策
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
} 