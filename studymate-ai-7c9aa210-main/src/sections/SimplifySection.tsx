import { Sparkles, AlertCircle } from "lucide-react";
import { DifficultySelector } from "../components/DifficultySelector";
import { ActionButton } from "../components/ActionButton";

interface SimplifySectionProps {
  data: any;
  onGenerate: () => void;
  difficulty: string;
}

export function SimplifySection({ data, onGenerate, difficulty }: SimplifySectionProps) {
  const notes = data || null;

  const levelLabel =
    difficulty === "Beginner" ? "Very Easy" :
    difficulty === "Advanced" ? "College Level" : "School Level";

  return (
    <div>
      <div className="p-4 rounded-lg bg-secondary mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Simplify Mode</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-3">
          Turn difficult notes into easy, short, understandable revision material.
        </p>
        <div className="text-xs text-muted-foreground">
          Level: <span className="text-foreground font-medium">{levelLabel}</span>
          {" "}(adjust via Settings → Difficulty)
        </div>
      </div>

      {!notes ? (
        <div className="flex flex-col items-center gap-4 py-8 text-center">
          <AlertCircle className="w-10 h-10 text-muted-foreground" />
          <p className="text-muted-foreground text-sm">
            No simplified notes yet. Click Generate to simplify your content.
          </p>
          <ActionButton variant="primary" onClick={onGenerate} icon={<Sparkles className="w-4 h-4" />}>
            Simplify Notes
          </ActionButton>
        </div>
      ) : (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <h4 className="text-sm font-semibold text-foreground">{notes.title}</h4>
            <span className="px-2 py-0.5 rounded-full text-xs bg-success/20 text-success">{notes.level}</span>
          </div>
          <ul className="space-y-2">
            {notes.bullets.map((bullet: string, i: number) => (
              <li key={i} className="text-sm text-muted-foreground bg-secondary p-2.5 rounded-lg">
                {bullet}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}