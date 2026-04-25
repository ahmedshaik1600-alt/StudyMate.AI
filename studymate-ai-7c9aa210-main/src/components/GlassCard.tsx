import { motion } from "framer-motion";
import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function GlassCard({ children, className = "", hover = true }: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      whileHover={hover ? { y: -2, boxShadow: "0 0 25px rgba(168,7,7,0.15)" } : undefined}
      className={`glass-card rounded-xl p-6 transition-all duration-300 ${className}`}
    >
      {children}
    </motion.div>
  );
}
