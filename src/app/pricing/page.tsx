"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Crown, Zap, Infinity } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/store/auth";
import PaymentDialog from "@/components/payment/PaymentDialog";
import LoginDialog from "@/components/auth/LoginDialog";

const plans = [
  {
    name: "免费会员",
    price: "0",
    description: "体验基础功能",
    icon: Zap,
    features: [
      "智能抠图",
      "基础背景色替换",
      "标准证件照尺寸",
      "免费使用2次",
    ],
    buttonText: "开始使用",
    href: "/",
    popular: false,
    type: "free" as const,
  },
  {
    name: "VIP会员",
    price: "5",
    description: "有效期1年",
    icon: Crown,
    features: [
      "智能抠图",
      "所有背景色替换",
      "所有证件照尺寸",
      "使用次数88次",
      "优先处理",
    ],
    buttonText: "升级VIP",
    href: "/",
    popular: true,
    type: "vip" as const,
  },
  {
    name: "终身会员",
    price: "8",
    description: "一次付费永久使用",
    icon: Infinity,
    features: [
      "智能抠图",
      "所有背景色替换",
      "所有证件照尺寸",
      "使用次数188次",
      "优先处理",
      "终身免费更新",
    ],
    buttonText: "立即开通",
    href: "/",
    popular: false,
    type: "lifetime" as const,
  },
];

export default function PricingPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const { token } = useAuth();

  const handlePlanClick = (plan: typeof plans[0]) => {
    if (plan.type === 'free') {
      window.location.href = '/';
      return;
    }

    if (!token) {
      setIsLoginDialogOpen(true);
      return;
    }

    setSelectedPlan(plan.type);
    setIsPaymentDialogOpen(true);
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-gradient-to-b from-background to-foreground/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* 标题部分 */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold mb-4">简单透明的价格方案</h1>
            <p className="text-lg text-foreground/70">
              选择最适合您需求的方案，随时开始使用
            </p>
          </motion.div>
        </div>

        {/* 价格卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative flex flex-col rounded-2xl border bg-background p-8 shadow-lg ${
                plan.popular ? 'border-foreground' : 'border-border'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-0 right-0 mx-auto w-fit rounded-full bg-foreground px-3 py-1 text-xs font-medium text-background">
                  最受欢迎
                </div>
              )}

              <div className="flex flex-col flex-grow">
                <div className="flex items-center gap-2">
                  <plan.icon className="h-6 w-6" />
                  <h3 className="text-xl font-semibold">{plan.name}</h3>
                </div>

                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-bold">¥{plan.price}</span>
                  <span className="ml-1 text-sm text-foreground/60">
                    {plan.name === "终身会员" ? "/永久" : "/年"}
                  </span>
                </div>

                <p className="mt-2 text-sm text-foreground/60">
                  {plan.description}
                </p>

                <ul className="mt-8 space-y-4 flex-grow">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handlePlanClick(plan);
                  }}
                  className={`mt-8 block rounded-lg px-4 py-2 text-center text-sm font-medium transition-colors
                    ${
                      plan.popular
                        ? "bg-foreground text-background hover:bg-foreground/90"
                        : "border hover:bg-foreground/5"
                    }
                  `}
                >
                  {plan.buttonText}
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* 底部说明 */}
        <div className="mt-16 text-center text-sm text-foreground/60">
          <p>所有价格均为人民币，包含增值税</p>
        </div>
      </div>

      {/* 支付对话框 */}
      {selectedPlan && (
        <PaymentDialog
          isOpen={isPaymentDialogOpen}
          onClose={() => {
            setIsPaymentDialogOpen(false);
            setSelectedPlan(null);
          }}
          planType={selectedPlan}
        />
      )}

      {/* 登录对话框 */}
      <LoginDialog
        isOpen={isLoginDialogOpen}
        onClose={() => setIsLoginDialogOpen(false)}
      />
    </div>
  );
} 