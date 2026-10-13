"use client";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Zap, Shield, Users, Image, Laptop } from "lucide-react";
import Link from "next/link";

export default function About() {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const features = [
    { icon: Zap, text: "即时背景色替换" },
    { icon: Image, text: "尺寸自定义功能" },
    { icon: CheckCircle2, text: "多种格式支持" },
    { icon: Shield, text: "高质量图像输出" },
    { icon: Laptop, text: "用户友好的界面" },
    { icon: Zap, text: "快速处理" },
  ];

  const scenarios = [
    {
      title: "个人使用",
      description: "轻松处理护照、驾照、工作签证等各类证件照，满足不同场景需求。",
      items: ["护照签证", "驾驶证件", "工作证件"]
    },
    {
      title: "企业与组织",
      description: "为企业提供批量证件照处理解决方案，提高人事管理效率。",
      items: ["员工证件", "招聘材料", "团队展示"]
    },
    {
      title: "特殊场合",
      description: "为特殊场合提供定制化的照片处理服务，确保每个重要时刻的完美呈现。",
      items: ["婚礼证件", "活动证件", "纪念照片"]
    }
  ];

  const privacyFeatures = [
    {
      title: "本地处理",
      description: "所有图片处理都在您的浏览器中完成，无需上传服务器"
    },
    {
      title: "隐私保护",
      description: "不保存任何用户数据和图片信息，确保您的隐私安全"
    },
    {
      title: "安全可靠",
      description: "采用现代Web技术，提供安全可靠的使用环境"
    }
  ];

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-gradient-to-b from-background to-foreground/5">
      {/* 头部区域 */}
      <motion.div 
        className="max-w-4xl mx-auto px-4 pt-16 pb-24 text-center"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-4xl font-bold mb-6">一站式证件照处理平台</h1>
        <p className="text-lg text-foreground/80 mb-8">
          提供专业的证件照处理服务，包括背景色替换和尺寸自定义等功能，让证件照处理变得简单高效。
        </p>
        <Link href="/">
          <motion.div 
            className="inline-flex items-center gap-2 text-sm font-medium hover:gap-3 transition-all cursor-pointer"
            whileHover={{ scale: 1.05 }}
          >
            <span>立即体验</span>
            <ArrowRight className="w-4 h-4" />
          </motion.div>
        </Link>
      </motion.div>

      {/* 特性展示 */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={{
            animate: {
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
          initial="initial"
          animate="animate"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="p-6 rounded-lg border bg-background/50 backdrop-blur-sm"
              variants={fadeIn}
            >
              <feature.icon className="w-6 h-6 mb-4 text-foreground/80" />
              <h3 className="text-lg font-medium mb-2">{feature.text}</h3>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* 安全与隐私 - 在适用场景前添加 */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <motion.div
          className="rounded-2xl border bg-background/50 backdrop-blur-sm overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="px-6 py-8 md:px-10 md:py-12">
            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
              <div className="flex-1">
                <motion.h2 
                  className="text-2xl font-bold mb-4"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  安全与隐私是我们的首要承诺
                </motion.h2>
                <motion.p 
                  className="text-foreground/70 mb-6"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  viewport={{ once: true }}
                >
                  我们深知您对数据安全的关注，因此采用最严格的隐私保护措施。
                </motion.p>
                <div className="grid gap-4">
                  {privacyFeatures.map((feature, index) => (
                    <motion.div
                      key={feature.title}
                      className="flex items-start gap-3"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <Shield className="w-5 h-5 mt-0.5 text-green-500 flex-shrink-0" />
                      <div>
                        <h3 className="font-medium mb-1">{feature.title}</h3>
                        <p className="text-sm text-foreground/70">{feature.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
              <div className="flex-1 flex justify-center">
                <motion.div
                  className="relative w-full max-w-sm aspect-square"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  viewport={{ once: true }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-full blur-3xl" />
                  <div className="relative h-full flex items-center justify-center">
                    <Shield className="w-32 h-32 text-foreground/80" />
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 使用场景 */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <motion.h2 
          className="text-2xl font-bold mb-12 text-center"
          variants={fadeIn}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          适用场景
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {scenarios.map((scenario, index) => (
            <motion.div
              key={index}
              className="p-6 rounded-lg border bg-background/50 backdrop-blur-sm"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              viewport={{ once: true }}
            >
              <h3 className="text-lg font-medium mb-4">{scenario.title}</h3>
              <p className="text-sm text-foreground/70 mb-4">{scenario.description}</p>
              <ul className="space-y-2">
                {scenario.items.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 技术优势 */}
      <motion.div 
        className="max-w-4xl mx-auto px-4 py-16 text-center"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <h2 className="text-2xl font-bold mb-8">技术优势</h2>
        <div className="space-y-4">
          <p className="text-foreground/80">
            <span className="font-medium">响应式设计：</span>
            完美适配各种设备，确保最佳使用体验。
          </p>
          <p className="text-foreground/80">
            <span className="font-medium">性能优化：</span>
            采用先进的图像处理技术，在保证质量的同时提供快速的处理速度。
          </p>
          <p className="text-foreground/80">
            <span className="font-medium">安全可靠：</span>
            注重用户隐私保护，所有处理均在本地完成，无需担心数据泄露。
          </p>
        </div>
      </motion.div>

      {/* 用户体验 */}
      <motion.div 
        className="max-w-4xl mx-auto px-4 py-16 mb-16 text-center"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <h2 className="text-2xl font-bold mb-8">卓越的用户体验</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-6 rounded-lg border bg-background/50 backdrop-blur-sm">
            <h3 className="text-lg font-medium mb-4">简便操作</h3>
            <p className="text-sm text-foreground/70">
              直观的界面设计，让您无需专业知识即可轻松完成证件照处理。
            </p>
          </div>
          <div className="p-6 rounded-lg border bg-background/50 backdrop-blur-sm">
            <h3 className="text-lg font-medium mb-4">实时预览</h3>
            <p className="text-sm text-foreground/70">
              所有修改即时呈现，帮助您快速调整到理想效果。
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
} 