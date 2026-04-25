import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Upload, FileText, Brain, Layers,
  HelpCircle, Sparkles, X,
} from "lucide-react";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", section: "hero" },
  { icon: Upload, label: "Upload Material", section: "upload" },
  { icon: FileText, label: "Notes Input", section: "notes" },
  { icon: Brain, label: "Summarizer", section: "generator" },
  { icon: Layers, label: "Flashcards", section: "generator" },
  { icon: HelpCircle, label: "Quiz Generator", section: "generator" },
  { icon: Sparkles, label: "Simplify Mode", section: "generator" },
];

interface AppSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeSection: string;
  onNavigate: (section: string) => void;
}

export function AppSidebar({ isOpen, onClose, activeSection, onNavigate }: AppSidebarProps) {
  const handleClick = (section: string) => {
    onNavigate(section);
    onClose();
  };

  const sidebar = (
    <div className="flex flex-col h-full w-64 glass-card border-r border-border p-4">
      <div className="flex items-center justify-between mb-8 lg:hidden">
        <span className="text-lg font-bold text-foreground">Menu</span>
        <button onClick={onClose} className="p-1 rounded hover:bg-accent">
          <X className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>
      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => {
          const isActive = activeSection === item.section;
          return (
            <motion.button
              key={item.label}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleClick(item.section)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "gradient-primary text-primary-foreground glow-border"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              <item.icon className="w-4.5 h-4.5" />
              {item.label}
            </motion.button>
          );
        })}
      </nav>
      <div className="mt-auto pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground text-center">StudyMate AI v1.0</p>
      </div>
    </div>
  );

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-background/80 z-40"
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed left-0 top-0 h-full z-50"
            >
              {sidebar}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
