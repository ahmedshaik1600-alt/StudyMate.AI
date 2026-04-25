import { Brain } from "lucide-react";

export function FooterSection() {
  return (
    <footer className="border-t border-border mt-16">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-primary" />
            <span className="font-bold text-foreground">StudyMate AI</span>
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">

          </div>
          <p className="text-xs text-muted-foreground">© 2026 StudyMate AI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
