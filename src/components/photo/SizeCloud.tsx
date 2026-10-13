"use client";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";

// 从数据中提取热门和常用尺寸
const sizes = [
  // 热门证件照（is_hot: 1）
  {
    category: "热门证件照",
    items: [
      { name: "一寸照", specs: "25mm×35mm" },
      { name: "二寸照", specs: "35mm×49mm" },
      { name: "社保卡证件照", specs: "26mm×32mm" },
      { name: "毕业生图像采集", specs: "41mm×54mm" },
    ]
  },
  // 考试报名照
  {
    category: "考试报名照",
    items: [
      { name: "初级会计考试", specs: "25mm×35mm" },
      { name: "教师资格证", specs: "25mm×35mm" },
      { name: "公务员考试", specs: "25mm×35mm" },
      { name: "研究生考试", specs: "39mm×52mm" },
      { name: "英语四六级", specs: "24mm×32mm" },
      { name: "计算机等级", specs: "35mm×49mm" },
    ]
  },
  // 证照办理
  {
    category: "证照办理",
    items: [
      { name: "身份证", specs: "26mm×32mm" },
      { name: "护士注册", specs: "35mm×46mm" },
      { name: "居住证", specs: "26mm×32mm" },
      { name: "医保证", specs: "26mm×32mm" },
      { name: "工作证", specs: "35mm×49mm" },
      { name: "结婚证", specs: "35mm×53mm" },
    ]
  }
];

export default function SizeCloud() {
  return (
    <section className="py-16 bg-gradient-to-b from-foreground/5 to-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-4">支持多种证件照尺寸</h2>
            <p className="text-foreground/70">
              覆盖常见证件照需求，持续更新中...
            </p>
          </motion.div>
        </div>

        {/* 分类展示 */}
        <div className="space-y-12">
          {sizes.map((category, categoryIndex) => (
            <motion.div
              key={category.category}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: categoryIndex * 0.2 }}
              viewport={{ once: true }}
            >
              <h3 className="text-lg font-medium mb-4 text-center">
                {category.category}
              </h3>
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
                className="flex flex-wrap justify-center gap-4"
              >
                {category.items.map((size, index) => (
                  <motion.div
                    key={size.name}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="group relative bg-background border rounded-lg px-4 py-2 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
                  >
                    <div className="text-sm font-medium">{size.name}</div>
                    <div className="text-xs text-foreground/60">{size.specs}</div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* 更多尺寸提示 */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-12 flex justify-center"
        >
          <div className="relative bg-foreground/5 border border-dashed rounded-lg px-6 py-3">
            <div className="flex items-center gap-2 text-sm text-foreground/60">
              <Plus className="w-4 h-4" />
              <span>支持200+种证件照规格，持续更新中...</span>
            </div>
          </div>
        </motion.div>

        {/* 底部说明 */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-12 text-center text-sm text-foreground/60"
        >
          <p>如需其他尺寸，可在上传照片后自定义裁剪尺寸</p>
        </motion.div>
      </div>
    </section>
  );
} 