import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Shuffle, AlertCircle } from "lucide-react";
import { ActionButton } from "../components/ActionButton";

interface FlashcardViewerProps {
  data: any;
  onGenerate: () => void;
}

export function FlashcardViewer({ data, onGenerate }: FlashcardViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped]       = useState(false);

  const cards = data?.cards || [];

  if (!cards.length) {
    return (
      <div className="flex flex-col items-center gap-4 py-10 text-center">
        <AlertCircle className="w-10 h-10 text-muted-foreground" />
        <p className="text-muted-foreground text-sm">
          No flashcards yet. Upload or paste your notes, then click Generate.
        </p>
        <ActionButton variant="primary" onClick={onGenerate}>
          Generate Flashcards
        </ActionButton>
      </div>
    );
  }

  const card = cards[currentIndex];
  const diffColor =
    card.difficulty === "Beginner"     ? "text-success" :
    card.difficulty === "Advanced"     ? "text-primary" : "text-warning";

  const prev = () => { setCurrentIndex(Math.max(0, currentIndex - 1)); setIsFlipped(false); };
  const next = () => { setCurrentIndex(Math.min(cards.length - 1, currentIndex + 1)); setIsFlipped(false); };
  const shuffle = () => { setCurrentIndex(Math.floor(Math.random() * cards.length)); setIsFlipped(false); };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-muted-foreground">{currentIndex + 1} / {cards.length}</span>
        <span className={`text-xs font-medium ${diffColor}`}>{card.difficulty}</span>
      </div>

      <motion.div
        onClick={() => setIsFlipped(!isFlipped)}
        className="relative cursor-pointer min-h-[200px] rounded-xl bg-secondary p-8 flex items-center justify-center"
        style={{ perspective: 1000 }}
      >
        <motion.div
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.4 }}
          className="w-full text-center"
          style={{ backfaceVisibility: "hidden" }}
        >
          {!isFlipped ? (
            <div>
              <p className="text-xs text-muted-foreground mb-3">QUESTION — tap to flip</p>
              <p className="text-lg font-semibold text-foreground">{card.question}</p>
            </div>
          ) : (
            <div style={{ transform: "rotateY(180deg)" }}>
              <p className="text-xs text-muted-foreground mb-3">ANSWER</p>
              <p className="text-foreground">{card.answer}</p>
            </div>
          )}
        </motion.div>
      </motion.div>

      <div className="flex items-center justify-center gap-3 mt-6">
        <ActionButton variant="secondary" onClick={prev}    icon={<ChevronLeft  className="w-4 h-4" />}>Prev</ActionButton>
        <ActionButton variant="ghost"    onClick={shuffle}  icon={<Shuffle      className="w-4 h-4" />}>Shuffle</ActionButton>
        <ActionButton variant="secondary" onClick={next}    icon={<ChevronRight className="w-4 h-4" />}>Next</ActionButton>
      </div>
    </div>
  );
}