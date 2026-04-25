import { useState } from "react";
import { Play, Pause, Volume2 } from "lucide-react";
import { GlassCard } from "../components/GlassCard";
import { ActionButton } from "../components/ActionButton";

export function TTSSection() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(35);
  const [voice, setVoice] = useState("Natural Female");
  const [speed, setSpeed] = useState("1x");

  // TODO: connect to POST /tts endpoint to generate audio from text
  const handlePlay = () => {
    setIsPlaying(!isPlaying);
    console.log("TODO: POST /tts to generate speech audio");
  };

  return (
    <section id="tts" className="max-w-4xl mx-auto px-4 py-12">
      <h2 className="text-2xl font-bold text-foreground mb-6">🔊 Text to Speech</h2>

      <GlassCard>
        <p className="text-sm text-muted-foreground mb-6">
          Read out generated summaries or simplified notes aloud. Choose voice and speed.
        </p>

        {/* Player */}
        <div className="p-6 rounded-xl bg-secondary mb-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={handlePlay}
              className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center glow-border transition-all hover:scale-105"
            >
              {isPlaying ? <Pause className="w-5 h-5 text-primary-foreground" /> : <Play className="w-5 h-5 text-primary-foreground ml-0.5" />}
            </button>
            <div className="flex-1">
              <div className="h-2 bg-accent rounded-full overflow-hidden">
                <div className="h-full gradient-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
              <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                <span>1:24</span>
                <span>4:02</span>
              </div>
            </div>
            <Volume2 className="w-5 h-5 text-muted-foreground" />
          </div>

          <div className="flex flex-wrap gap-4">
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Voice</label>
              <select
                value={voice}
                onChange={(e) => setVoice(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-accent text-foreground text-sm border border-border focus:outline-none"
              >
                <option>Natural Female</option>
                <option>Natural Male</option>
                <option>Professional</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Speed</label>
              <select
                value={speed}
                onChange={(e) => setSpeed(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-accent text-foreground text-sm border border-border focus:outline-none"
              >
                <option>0.5x</option>
                <option>0.75x</option>
                <option>1x</option>
                <option>1.25x</option>
                <option>1.5x</option>
                <option>2x</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <ActionButton variant="primary" onClick={handlePlay} icon={<Play className="w-4 h-4" />}>Read Summary</ActionButton>
          <ActionButton variant="secondary" icon={<Play className="w-4 h-4" />}>Read Simplified Version</ActionButton>
        </div>
      </GlassCard>
    </section>
  );
}
