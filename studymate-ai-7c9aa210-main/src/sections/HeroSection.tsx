import { motion } from "framer-motion";
import { Brain } from "lucide-react";

export function HeroSection() {
  return (
    <section id="hero" className="relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="text-center py-12 md:py-16 px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card text-sm text-muted-foreground mb-6">
            <Brain className="w-4 h-4 text-primary" />
            AI-Powered Study Assistant
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4 leading-tight">
            Upload notes.{" "}
            <span className="text-gradient">Summarize faster.</span>
            <br />
            Revise smarter.
          </h1>

          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Your AI-powered study companion for summaries, flashcards, quizzes, and faster revision.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
