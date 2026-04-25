import { motion } from "framer-motion";
import { ReactNode } from "react";

interface ActionButtonProps {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  onClick?: () => void;
  className?: string;
  icon?: ReactNode;
}

export function ActionButton({ children, variant = "primary", onClick, className = "", icon }: ActionButtonProps) {
  const base = "inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all duration-300";
  const variants = {
    primary: "gradient-primary text-primary-foreground glow-border hover:opacity-90",
    secondary: "glass-card text-foreground hover:glow-border",
    ghost: "text-muted-foreground hover:text-foreground hover:bg-accent",
  };

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {icon}
      {children}
    </motion.button>
  );
}
