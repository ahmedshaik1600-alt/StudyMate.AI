import { mockSummary } from "../data/mockData";
import { Clock, Tag, AlertCircle } from "lucide-react";
import { ActionButton } from "../components/ActionButton";

interface SummaryOutputProps {
  data: any;
  onGenerate: () => void;
}

export function SummaryOutput({ data, onGenerate }: SummaryOutputProps) {
  const summary = data || null;

  if (!summary) {
    return (
      <div className="flex flex-col items-center gap-4 py-10 text-center">
        <AlertCircle className="w-10 h-10 text-muted-foreground" />
        <p className="text-muted-foreground text-sm">
          No summary yet. Upload or paste your notes, then click Generate.
        </p>
        <ActionButton variant="primary" onClick={onGenerate}>
          Generate Summary
        </ActionButton>
      </div>
    );
  }

  let dateStr = "Just now";
  try {
    const dt = new Date(summary.generatedAt);
    dateStr = dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {}

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <h3 className="text-lg font-bold text-foreground">{summary.title}</h3>
        <span className="px-2 py-0.5 rounded-full text-xs font-medium gradient-primary text-primary-foreground">
          AI Generated
        </span>
      </div>
      <div className="flex gap-4 mb-6 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {dateStr}</span>
        <span className="flex items-center gap-1"><Tag className="w-3 h-3" /> {summary.type}</span>
        <span>{summary.difficulty}</span>
      </div>

      {summary.sections.map((section: any) => (
        <div key={section.heading} className="mb-5">
          <h4 className="text-sm font-semibold text-foreground mb-2">{section.heading}</h4>
          <ul className="space-y-1.5">
            {section.bullets.map((bullet: string, i: number) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                {bullet}
              </li>
            ))}
          </ul>
        </div>
      ))}

      {summary.quickTakeaways?.length > 0 && (
        <div className="p-4 rounded-lg bg-secondary mt-4">
          <h4 className="text-sm font-semibold text-foreground mb-2">💡 Quick Takeaways</h4>
          <ul className="space-y-1">
            {summary.quickTakeaways.map((t: string, i: number) => (
              <li key={i} className="text-sm text-muted-foreground">• {t}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}