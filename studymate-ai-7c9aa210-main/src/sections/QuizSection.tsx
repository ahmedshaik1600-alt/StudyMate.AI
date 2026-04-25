import { useState, useEffect, useCallback, type MutableRefObject } from "react";
import { motion } from "framer-motion";
import { Check, X, RotateCcw, Timer, Play, AlertCircle } from "lucide-react";
import { ActionButton } from "../components/ActionButton";

type QuizMode = "practice" | "timed-setup" | "timed-active";

interface QuizSectionProps {
  data: any;
  onGenerate: () => void;
  onTimedTriggerRef?: MutableRefObject<(() => void) | null>;
}

export function QuizSection({ data, onGenerate, onTimedTriggerRef }: QuizSectionProps) {
  const [answers, setAnswers]         = useState<Record<number, number>>({});
  const [submitted, setSubmitted]     = useState(false);
  const [mode, setMode]               = useState<QuizMode>("practice");
  const [timedMinutes, setTimedMinutes] = useState(5);
  const [secondsLeft, setSecondsLeft] = useState(0);

  const questions = data?.questions || [];

  useEffect(() => {
    if (onTimedTriggerRef) {
      onTimedTriggerRef.current = () => setMode("timed-setup");
      return () => { onTimedTriggerRef.current = null; };
    }
  }, [onTimedTriggerRef]);

  // Reset when new quiz data arrives
  useEffect(() => {
    setAnswers({});
    setSubmitted(false);
    setMode("practice");
  }, [data]);

  const handleSubmit = useCallback(() => {
    setSubmitted(true);
    setMode("practice");
  }, []);

  const startTimedQuiz = () => {
    setAnswers({});
    setSubmitted(false);
    setSecondsLeft(timedMinutes * 60);
    setMode("timed-active");
  };

  useEffect(() => {
    if (mode !== "timed-active" || submitted) return;
    if (secondsLeft <= 0) { handleSubmit(); return; }
    const interval = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(interval);
  }, [mode, secondsLeft, submitted, handleSubmit]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    return `${m}:${(s % 60).toString().padStart(2, "0")}`;
  };

  if (!questions.length) {
    return (
      <div className="flex flex-col items-center gap-4 py-10 text-center">
        <AlertCircle className="w-10 h-10 text-muted-foreground" />
        <p className="text-muted-foreground text-sm">
          No quiz yet. Upload or paste your notes, then click Generate.
        </p>
        <ActionButton variant="primary" onClick={onGenerate}>
          Generate Quiz
        </ActionButton>
      </div>
    );
  }

  const score = submitted
    ? questions.filter((q: any) => answers[q.id] === q.correctIndex).length
    : 0;

  if (mode === "timed-setup") {
    return (
      <div className="flex flex-col items-center gap-6 py-8">
        <Timer className="w-10 h-10 text-primary" />
        <h3 className="text-lg font-bold text-foreground">Timed Test Quiz</h3>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          Set a time limit. Timer auto-submits when it runs out.
        </p>
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-foreground">Duration:</label>
          <div className="flex gap-1.5">
            {[2, 5, 10, 15, 20].map((min) => (
              <button
                key={min}
                onClick={() => setTimedMinutes(min)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  timedMinutes === min
                    ? "gradient-primary text-primary-foreground"
                    : "glass-card text-muted-foreground hover:text-foreground"
                }`}
              >
                {min}m
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <ActionButton variant="secondary" onClick={() => setMode("practice")}>Cancel</ActionButton>
          <ActionButton variant="primary" onClick={startTimedQuiz} icon={<Play className="w-4 h-4" />}>Start</ActionButton>
        </div>
      </div>
    );
  }

  return (
    <div>
      {mode === "timed-active" && !submitted && (
        <div className="flex items-center justify-between mb-4 p-3 rounded-lg bg-secondary">
          <div className="flex items-center gap-2">
            <Timer className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Timed Quiz</span>
          </div>
          <span className={`text-lg font-bold font-mono ${secondsLeft <= 30 ? "text-primary animate-pulse" : "text-foreground"}`}>
            {formatTime(secondsLeft)}
          </span>
        </div>
      )}

      {!submitted ? (
        <div className="space-y-6">
          {questions.map((q: any, qi: number) => (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: qi * 0.05 }}
              className="p-4 rounded-lg bg-secondary"
            >
              <p className="text-sm font-semibold text-foreground mb-3">{qi + 1}. {q.question}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {q.options.map((opt: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => setAnswers({ ...answers, [q.id]: i })}
                    className={`text-left px-3 py-2 rounded-lg text-sm transition-all ${
                      answers[q.id] === i
                        ? "gradient-primary text-primary-foreground"
                        : "glass-card text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </motion.div>
          ))}
          <ActionButton variant="primary" onClick={handleSubmit}>Submit Quiz</ActionButton>
        </div>
      ) : (
        <div>
          <div className="text-center p-6 rounded-xl bg-secondary mb-6">
            <p className="text-4xl font-bold text-foreground">{score}/{questions.length}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {score === questions.length ? "🎉 Perfect score!" : score >= questions.length / 2 ? "👍 Good job!" : "📚 Keep studying!"}
            </p>
          </div>
          <div className="space-y-4 mb-6">
            {questions.map((q: any, qi: number) => {
              const isCorrect = answers[q.id] === q.correctIndex;
              return (
                <div key={q.id} className="p-4 rounded-lg bg-secondary">
                  <div className="flex items-start gap-2 mb-2">
                    {isCorrect ? <Check className="w-5 h-5 text-success mt-0.5" /> : <X className="w-5 h-5 text-primary mt-0.5" />}
                    <p className="text-sm font-medium text-foreground">{qi + 1}. {q.question}</p>
                  </div>
                  <p className="text-xs text-muted-foreground ml-7">{q.explanation}</p>
                </div>
              );
            })}
          </div>
          <div className="flex gap-2">
            <ActionButton variant="secondary" onClick={() => { setAnswers({}); setSubmitted(false); }} icon={<RotateCcw className="w-4 h-4" />}>
              Retry
            </ActionButton>
            <ActionButton variant="primary" onClick={onGenerate}>
              New Quiz
            </ActionButton>
          </div>
        </div>
      )}
    </div>
  );
}