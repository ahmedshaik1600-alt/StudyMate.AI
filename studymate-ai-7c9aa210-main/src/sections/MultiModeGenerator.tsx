import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Layers, HelpCircle, Sparkles, RefreshCw, Copy, Download, Volume2, Timer } from "lucide-react";
import { GlassCard } from "../components/GlassCard";
import { ActionButton } from "../components/ActionButton";
import { SummaryOutput } from "./SummaryOutput";
import { FlashcardViewer } from "./FlashcardViewer";
import { QuizSection } from "./QuizSection";
import { SimplifySection } from "./SimplifySection";
import { toast } from "sonner";

const API = "http://localhost:8000";

const tabs = [
  { id: "summary",    label: "Summary",    icon: Brain },
  { id: "flashcards", label: "Flashcards", icon: Layers },
  { id: "quiz",       label: "Quiz",       icon: HelpCircle },
  { id: "simplify",   label: "Simplify",   icon: Sparkles },
];

interface MultiModeGeneratorProps {
  studyText: string;
  summaryLength: string;
  summaryStyle: string;
  difficulty: string;
  flashcardCount: number;
  quizCount: number;
}

export function MultiModeGenerator({
  studyText,
  summaryLength,
  summaryStyle,
  difficulty,
  flashcardCount,
  quizCount,
}: MultiModeGeneratorProps) {
  const [activeTab, setActiveTab]     = useState("summary");
  const [isLoading, setIsLoading]     = useState(false);
  const [summaryData, setSummaryData]   = useState<any>(null);
  const [flashcardsData, setFlashcardsData] = useState<any>(null);
  const [quizData, setQuizData]       = useState<any>(null);
  const [simplifyData, setSimplifyData] = useState<any>(null);
  const [isSpeaking, setIsSpeaking]     = useState(false);
  const quizTimedTriggerRef = useRef<(() => void) | null>(null);

  const getTextToUse = () =>
    studyText.trim() ||
    "Machine Learning is a subset of AI that enables systems to learn from data automatically.";

  // ── Generate for current tab ───────────────────────────────────────────────
  const generate = async (tab: string) => {
    const text = getTextToUse();
    setIsLoading(true);
    try {
      if (tab === "summary") {
        const res = await fetch(`${API}/summarize`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, length: summaryLength, style: summaryStyle, difficulty }),
        });
        if (!res.ok) throw new Error(await res.text());
        setSummaryData(await res.json());

      } else if (tab === "flashcards") {
        const res = await fetch(`${API}/flashcards`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, difficulty, count: flashcardCount }),
        });
        if (!res.ok) throw new Error(await res.text());
        setFlashcardsData(await res.json());

      } else if (tab === "quiz") {
        const res = await fetch(`${API}/quiz`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, difficulty, count: quizCount }),
        });
        if (!res.ok) throw new Error(await res.text());
        setQuizData(await res.json());

      } else if (tab === "simplify") {
        const level = difficulty === "Beginner" ? "Very Easy"
          : difficulty === "Advanced" ? "College Level"
          : "School Level";
        const res = await fetch(`${API}/simplify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, level }),
        });
        if (!res.ok) throw new Error(await res.text());
        setSimplifyData(await res.json());
      }
      toast.success("Generated successfully!");
    } catch (err: any) {
      toast.error("Generation failed: " + (err.message || "Unknown error"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = () => generate(activeTab);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    // Auto-generate if we don't have data for this tab yet
    const hasData =
      (tab === "summary"    && summaryData)   ||
      (tab === "flashcards" && flashcardsData) ||
      (tab === "quiz"       && quizData)       ||
      (tab === "simplify"   && simplifyData);
    if (!hasData) generate(tab);
  };

  const handleTakeTest = () => {
    if (quizTimedTriggerRef.current) quizTimedTriggerRef.current();
  };

  // ── Copy ───────────────────────────────────────────────────────────────────
  const handleCopy = async () => {
    let text = "";
    if (activeTab === "summary" && summaryData) {
      text = summaryData.sections
        .map((s: any) => `${s.heading}\n${s.bullets.map((b: string) => `• ${b}`).join("\n")}`)
        .join("\n\n");
      if (summaryData.quickTakeaways?.length) {
        text += "\n\nQuick Takeaways:\n" + summaryData.quickTakeaways.map((t: string) => `• ${t}`).join("\n");
      }
    } else if (activeTab === "simplify" && simplifyData) {
      text = simplifyData.bullets.join("\n");
    }
    if (!text) { toast.error("Nothing to copy yet — generate first!"); return; }
    await navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  // ── Download PDF ───────────────────────────────────────────────────────────
  const handleDownload = async () => {
    if (!summaryData) { toast.error("Generate a summary first!"); return; }
    try {
      toast.info("Preparing PDF…");
      const res = await fetch(`${API}/download/summary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ summary: summaryData }),
      });
      if (!res.ok) throw new Error(await res.text());
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      const title = summaryData.title?.replace(/[^a-z0-9 ]/gi, "_") || "summary";
      a.href     = url;
      a.download = `StudyMate_${title}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("PDF downloaded!");
    } catch (err: any) {
      toast.error("Download failed: " + (err.message || "Unknown error"));
    }
  };

  // ── Text-to-Speech (Web Speech API) ───────────────────────────────────────
  const handleListen = () => {
    // If already speaking — stop it
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      toast.info("Stopped.");
      return;
    }

    let text = "";
    if (activeTab === "summary" && summaryData) {
      text = summaryData.sections
        .flatMap((s: any) => [s.heading, ...s.bullets])
        .join(". ");
    } else if (activeTab === "simplify" && simplifyData) {
      text = simplifyData.bullets.join(". ").replace(/[^\w\s.,!?]/g, "");
    }
    if (!text) { toast.error("Generate content first!"); return; }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.onend   = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
    toast.success("Reading aloud — click Listen again to stop.");
  };

  const showTextActions = activeTab === "summary" || activeTab === "simplify";

  return (
    <section id="generator" className="max-w-4xl mx-auto px-4 py-12">
      <h2 className="text-2xl font-bold text-foreground mb-6">✨ AI Study Engine</h2>

      <GlassCard hover={false}>
        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 p-1 bg-secondary rounded-lg">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all flex-1 min-w-[120px] justify-center ${
                activeTab === tab.id
                  ? "gradient-primary text-primary-foreground glow-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Loading skeleton */}
        {isLoading && (
          <div className="space-y-3 mb-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-4 rounded shimmer" style={{ width: `${100 - i * 15}%` }} />
            ))}
          </div>
        )}

        {/* Content */}
        {!isLoading && (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === "summary"    && <SummaryOutput data={summaryData} onGenerate={() => generate("summary")} />}
              {activeTab === "flashcards" && <FlashcardViewer data={flashcardsData} onGenerate={() => generate("flashcards")} />}
              {activeTab === "quiz"       && <QuizSection data={quizData} onGenerate={() => generate("quiz")} onTimedTriggerRef={quizTimedTriggerRef} />}
              {activeTab === "simplify"   && <SimplifySection data={simplifyData} onGenerate={() => generate("simplify")} difficulty={difficulty} />}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Action bar */}
        <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-border">
          <ActionButton
            variant="primary"
            onClick={handleRegenerate}
            icon={<RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />}
          >
            Regenerate
          </ActionButton>
          {activeTab === "quiz" && (
            <ActionButton variant="primary" onClick={handleTakeTest} icon={<Timer className="w-4 h-4" />}>
              Take Test Quiz
            </ActionButton>
          )}
          {showTextActions && (
            <>
              <ActionButton variant="secondary" onClick={handleCopy} icon={<Copy className="w-4 h-4" />}>Copy</ActionButton>
              {activeTab === "summary" && (
                <ActionButton variant="secondary" onClick={handleDownload} icon={<Download className="w-4 h-4" />}>Download PDF</ActionButton>
              )}
              <ActionButton
                variant={isSpeaking ? "primary" : "secondary"}
                onClick={handleListen}
                icon={<Volume2 className="w-4 h-4" />}
              >
                {isSpeaking ? "Stop" : "Listen"}
              </ActionButton>
            </>
          )}
        </div>
      </GlassCard>
    </section>
  );
}