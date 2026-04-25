import { Menu, Brain, Settings } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { useState } from "react";
import { SettingsSection } from "../sections/SettingsSection";

interface NavbarProps {
  onMenuToggle: () => void;
  summaryLength: string;
  setSummaryLength: (v: string) => void;
  summaryStyle: string;
  setSummaryStyle: (v: string) => void;
  difficulty: string;
  setDifficulty: (v: string) => void;
  flashcardCount: number;
  setFlashcardCount: (v: number) => void;
  quizCount: number;
  setQuizCount: (v: number) => void;
}

export function Navbar({
  onMenuToggle,
  summaryLength, setSummaryLength,
  summaryStyle, setSummaryStyle,
  difficulty, setDifficulty,
  flashcardCount, setFlashcardCount,
  quizCount, setQuizCount,
}: NavbarProps) {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <>
      <nav className="sticky top-0 z-50 glass-card border-b border-border px-4 md:px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={onMenuToggle} className="p-2 rounded-lg hover:bg-accent">
              <Menu className="w-5 h-5 text-foreground" />
            </button>
            <div className="flex items-center gap-2">
              <Brain className="w-7 h-7 text-primary" />
              <span className="text-lg font-bold text-foreground hidden sm:block">StudyMate AI</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="relative p-2 rounded-lg glass-card hover:glow-border transition-all duration-300"
              aria-label="Settings"
            >
              <Settings className="w-5 h-5 text-foreground" />
            </button>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* Settings popover */}
      {showSettings && (
        <div className="fixed inset-0 z-40" onClick={() => setShowSettings(false)}>
          <div
            className="absolute top-16 right-4 w-[400px] max-w-[calc(100vw-2rem)] z-50"
            onClick={(e) => e.stopPropagation()}
          >
            <SettingsSection
              onClose={() => setShowSettings(false)}
              summaryLength={summaryLength}
              setSummaryLength={setSummaryLength}
              summaryStyle={summaryStyle}
              setSummaryStyle={setSummaryStyle}
              difficulty={difficulty}
              setDifficulty={setDifficulty}
              flashcardCount={flashcardCount}
              setFlashcardCount={setFlashcardCount}
              quizCount={quizCount}
              setQuizCount={setQuizCount}
            />
          </div>
        </div>
      )}
    </>
  );
}