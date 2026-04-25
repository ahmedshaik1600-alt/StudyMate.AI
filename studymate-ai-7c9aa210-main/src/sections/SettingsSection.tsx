import { useState } from "react";
import { X, Minus, Plus } from "lucide-react";
import { GlassCard } from "../components/GlassCard";
import { DifficultySelector } from "../components/DifficultySelector";

interface SettingsSectionProps {
  onClose?: () => void;
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

function CountStepper({
  value,
  onChange,
  min = 3,
  max = 20,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="w-7 h-7 rounded-lg glass-card flex items-center justify-center hover:bg-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Minus className="w-3 h-3 text-foreground" />
      </button>
      <span className="w-8 text-center text-sm font-semibold text-foreground tabular-nums">
        {value}
      </span>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="w-7 h-7 rounded-lg glass-card flex items-center justify-center hover:bg-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Plus className="w-3 h-3 text-foreground" />
      </button>
    </div>
  );
}

export function SettingsSection({
  onClose,
  summaryLength, setSummaryLength,
  summaryStyle, setSummaryStyle,
  difficulty, setDifficulty,
  flashcardCount, setFlashcardCount,
  quizCount, setQuizCount,
}: SettingsSectionProps) {
  const [voicePref, setVoicePref] = useState("Natural Female");
  const [autoSave, setAutoSave] = useState(true);

  return (
    <GlassCard className="p-5 shadow-xl border border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-foreground">⚙️ Settings</h3>
        {onClose && (
          <button onClick={onClose} className="p-1 rounded hover:bg-accent transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* AI Generation Controls */}
        <div>
          <label className="text-xs font-medium text-foreground block mb-1.5">Summary Length</label>
          <DifficultySelector value={summaryLength} onChange={setSummaryLength} options={["Short", "Medium", "Detailed"]} />
        </div>

        <div>
          <label className="text-xs font-medium text-foreground block mb-1.5">Summary Style</label>
          <div className="flex flex-wrap gap-1.5">
            {["Exam", "Concept", "Bullet", "Quick"].map((style) => (
              <button
                key={style}
                onClick={() => setSummaryStyle(style)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  summaryStyle === style
                    ? "gradient-primary text-primary-foreground"
                    : "glass-card text-muted-foreground hover:text-foreground"
                }`}
              >
                {style}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-foreground block mb-1.5">Difficulty</label>
          <DifficultySelector value={difficulty} onChange={setDifficulty} />
        </div>

        {/* ── Flashcard & Quiz Count ─────────────────────────────── */}
        <div className="border-t border-border pt-4 space-y-3">
          <p className="text-xs font-semibold text-foreground">Generation Quantity</p>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-xs font-medium text-foreground">🃏 Flashcards</label>
              <p className="text-[10px] text-muted-foreground">Cards per generation (3–20)</p>
            </div>
            <CountStepper value={flashcardCount} onChange={setFlashcardCount} min={3} max={20} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-xs font-medium text-foreground">❓ Quiz Questions</label>
              <p className="text-[10px] text-muted-foreground">Questions per quiz (3–20)</p>
            </div>
            <CountStepper value={quizCount} onChange={setQuizCount} min={3} max={20} />
          </div>
        </div>

        <div className="border-t border-border pt-4">
          <label className="text-xs font-medium text-foreground block mb-1">Voice Preference</label>
          <select value={voicePref} onChange={(e) => setVoicePref(e.target.value)}
            className="w-full px-3 py-1.5 rounded-lg bg-secondary text-foreground border border-border text-xs focus:outline-none focus:ring-1 focus:ring-primary">
            <option>Natural Female</option>
            <option>Natural Male</option>
            <option>Professional</option>
          </select>
        </div>

        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-foreground">Auto-save outputs</label>
          <button
            onClick={() => setAutoSave(!autoSave)}
            className={`w-10 h-5 rounded-full transition-all ${autoSave ? "gradient-primary" : "bg-accent"} relative`}
          >
            <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-foreground transition-all ${autoSave ? "left-5" : "left-0.5"}`} />
          </button>
        </div>
      </div>
    </GlassCard>
  );
}