import { FileText, Trash2 } from "lucide-react";
import { GlassCard } from "../components/GlassCard";
import { ActionButton } from "../components/ActionButton";
import { toast } from "sonner";

interface NotesSectionProps {
  studyText: string;
  onTextChange: (text: string) => void;
}

export function NotesSection({ studyText, onTextChange }: NotesSectionProps) {
  const handleAnalyze = () => {
    if (!studyText.trim()) {
      toast.error("Please paste some notes first!");
      return;
    }
    // Scroll to generator
    const el = document.getElementById("generator");
    if (el) el.scrollIntoView({ behavior: "smooth" });
    toast.success("Notes loaded! Open the AI Study Engine below to generate content.");
  };

  return (
    <section id="notes" className="max-w-4xl mx-auto px-4 py-12">
      <h2 className="text-2xl font-bold text-foreground mb-6">📝 Paste Class Notes</h2>
      <GlassCard>
        <textarea
          value={studyText}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder="Paste your class notes, chapter content, or textbook material here…"
          className="w-full h-48 bg-transparent text-foreground placeholder:text-muted-foreground resize-none focus:outline-none text-sm leading-relaxed"
        />
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
          <div className="flex gap-4 text-xs text-muted-foreground">
            <span>{studyText.split(/\s+/).filter(Boolean).length} words</span>
            <span>{studyText.length} characters</span>
          </div>
          <div className="flex gap-2">
            <ActionButton variant="ghost" onClick={() => onTextChange("")} icon={<Trash2 className="w-4 h-4" />}>
              Clear
            </ActionButton>
            <ActionButton variant="primary" onClick={handleAnalyze} icon={<FileText className="w-4 h-4" />}>
              Use These Notes
            </ActionButton>
          </div>
        </div>
      </GlassCard>
    </section>
  );
}