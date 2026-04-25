import { motion } from "framer-motion";

interface DifficultySelectorProps {
  value: string;
  onChange: (value: string) => void;
  options?: string[];
}

export function DifficultySelector({ value, onChange, options = ["Beginner", "Intermediate", "Advanced"] }: DifficultySelectorProps) {
  return (
    <div className="flex gap-2">
      {options.map((opt) => (
        <motion.button
          key={opt}
          whileTap={{ scale: 0.95 }}
          onClick={() => onChange(opt)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
            value === opt
              ? "gradient-primary text-primary-foreground glow-border"
              : "glass-card text-muted-foreground hover:text-foreground"
          }`}
        >
          {opt}
        </motion.button>
      ))}
    </div>
  );
}
