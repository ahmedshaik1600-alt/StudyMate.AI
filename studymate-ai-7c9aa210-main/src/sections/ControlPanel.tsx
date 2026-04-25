import { DifficultySelector } from "../components/DifficultySelector";

interface ControlPanelProps {
  summaryLength: string;
  setSummaryLength: (v: string) => void;
  summaryStyle: string;
  setSummaryStyle: (v: string) => void;
  difficulty: string;
  setDifficulty: (v: string) => void;
}

export function ControlPanel({
  summaryLength, setSummaryLength,
  summaryStyle, setSummaryStyle,
  difficulty, setDifficulty,
}: ControlPanelProps) {
  return (
    <section id="controls" className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-lg font-bold text-foreground mb-4">⚙️ AI Generation Controls</h2>

      <div className="flex flex-wrap items-center gap-6">
        <div>
          <span className="text-xs font-medium text-muted-foreground block mb-1.5">Length</span>
          <DifficultySelector value={summaryLength} onChange={setSummaryLength} options={["Short", "Medium", "Detailed"]} />
        </div>

        <div>
          <span className="text-xs font-medium text-muted-foreground block mb-1.5">Style</span>
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
          <span className="text-xs font-medium text-muted-foreground block mb-1.5">Difficulty</span>
          <DifficultySelector value={difficulty} onChange={setDifficulty} />
        </div>
      </div>
    </section>
  );
}
