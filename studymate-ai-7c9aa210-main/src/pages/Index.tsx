import { useState } from "react";
import { Navbar } from "../components/Navbar";
import { AppSidebar } from "../components/AppSidebar";
import { HeroSection } from "../sections/HeroSection";
import { UploadSection } from "../sections/UploadSection";
import { NotesSection } from "../sections/NotesSection";
import { MultiModeGenerator } from "../sections/MultiModeGenerator";
import { FooterSection } from "../sections/FooterSection";

const Index = () => {
  const [sidebarOpen, setSidebarOpen]     = useState(false);
  const [activeSection, setActiveSection] = useState("hero");

  // Two SEPARATE text sources — upload never touches the notes textarea
  const [uploadedText, setUploadedText]   = useState("");
  const [notesText, setNotesText]         = useState("");

  // AI generation settings
  const [summaryLength, setSummaryLength] = useState("Medium");
  const [summaryStyle, setSummaryStyle]   = useState("Exam");
  const [difficulty, setDifficulty]       = useState("Intermediate");
  const [flashcardCount, setFlashcardCount] = useState(10);
  const [quizCount, setQuizCount]           = useState(5);

  // Generator uses upload text if present, otherwise notes text
  const studyText = uploadedText.trim() || notesText.trim();

  const handleNavigate = (section: string) => {
    setActiveSection(section);
    const el = document.getElementById(section);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        summaryLength={summaryLength}
        setSummaryLength={setSummaryLength}
        summaryStyle={summaryStyle}
        setSummaryStyle={setSummaryStyle}
        difficulty={difficulty}
        setDifficulty={setDifficulty}
        flashcardCount={flashcardCount}
        setFlashcardCount={setFlashcardCount}
        quizCount={quizCount}
        setQuizCount={setQuizCount}
      />

      <div className="flex">
        <AppSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activeSection={activeSection}
          onNavigate={handleNavigate}
        />

        <main className="flex-1 overflow-auto">
          <HeroSection />

          {/* Upload — feeds uploadedText only, never touches notesText */}
          <UploadSection onTextExtracted={setUploadedText} />

          {/* Notes — has its own isolated notesText, never receives upload */}
          <NotesSection studyText={notesText} onTextChange={setNotesText} />

          {/* AI Engine — receives merged studyText from either source */}
          <MultiModeGenerator
            studyText={studyText}
            summaryLength={summaryLength}
            summaryStyle={summaryStyle}
            difficulty={difficulty}
            flashcardCount={flashcardCount}
            quizCount={quizCount}
          />

          <FooterSection />
        </main>
      </div>
    </div>
  );
};

export default Index;