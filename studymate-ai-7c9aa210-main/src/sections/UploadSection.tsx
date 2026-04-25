import { useState } from "react";
import { Upload, File, X, Check, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { GlassCard } from "../components/GlassCard";
import { ActionButton } from "../components/ActionButton";
import { toast } from "sonner";

const API = "http://localhost:8000";

interface UploadSectionProps {
  onTextExtracted: (text: string) => void;
}

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: string;
  status: "ready" | "processing" | "error";
  extractedText?: string;
}

export function UploadSection({ onTextExtracted }: UploadSectionProps) {
  const [files, setFiles]       = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const uploadFile = async (rawFile: File) => {
    const tempId = String(Date.now());
    const pending: UploadedFile = {
      id: tempId,
      name: rawFile.name,
      type: rawFile.name.split(".").pop()?.toUpperCase() || "FILE",
      size: "...",
      status: "processing",
    };
    setFiles((prev) => [...prev, pending]);

    const formData = new FormData();
    formData.append("file", rawFile);

    try {
      const res = await fetch(`${API}/upload`, { method: "POST", body: formData });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: "Upload failed" }));
        throw new Error(err.detail || "Upload failed");
      }
      const data = await res.json();
      setFiles((prev) =>
        prev.map((f) =>
          f.id === tempId
            ? { ...f, id: data.id, size: data.size, status: "ready", extractedText: data.extractedText }
            : f
        )
      );
      // Don't auto-push to notes — user clicks "Use in AI Engine" when ready
      toast.success(`${rawFile.name} uploaded — ${data.wordCount} words extracted`);
    } catch (err: any) {
      setFiles((prev) => prev.map((f) => f.id === tempId ? { ...f, status: "error" } : f));
      toast.error(err.message || "Upload failed");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    Array.from(e.dataTransfer.files).forEach(uploadFile);
  };

  const handleBrowse = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pdf,.docx,.txt";
    input.multiple = true;
    input.onchange = () => {
      if (input.files) Array.from(input.files).forEach(uploadFile);
    };
    input.click();
  };

  const handleUseText = () => {
    const readyFiles = files.filter((f) => f.status === "ready" && f.extractedText);
    if (!readyFiles.length) { toast.error("No ready files to use"); return; }
    const combined = readyFiles.map((f) => f.extractedText).join("\n\n");
    onTextExtracted(combined);
    // Scroll straight to the AI engine, skip the notes textarea
    const el = document.getElementById("generator");
    if (el) el.scrollIntoView({ behavior: "smooth" });
    toast.success("Text loaded into the AI engine — pick a tab and generate!");
  };

  const statusIcon = (status: string) => {
    if (status === "ready")      return <Check   className="w-4 h-4 text-success" />;
    if (status === "processing") return <Loader2 className="w-4 h-4 text-warning animate-spin" />;
    return <X className="w-4 h-4 text-destructive" />;
  };

  return (
    <section id="upload" className="max-w-4xl mx-auto px-4 py-12">
      <h2 className="text-2xl font-bold text-foreground mb-6">📁 Upload Study Material</h2>
      <GlassCard>
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-10 text-center transition-all duration-300 ${
            isDragging ? "border-primary bg-primary/5" : "border-border"
          }`}
        >
          <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-foreground font-medium mb-1">Drag & drop your files here</p>
          <p className="text-sm text-muted-foreground mb-4">Supports PDF, DOCX, TXT</p>
          <ActionButton variant="secondary" onClick={handleBrowse}>Browse Files</ActionButton>
        </div>

        {files.length > 0 && (
          <div className="mt-6 space-y-3">
            {files.map((file) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between p-3 rounded-lg bg-secondary"
              >
                <div className="flex items-center gap-3">
                  <File className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{file.type} · {file.size}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {statusIcon(file.status)}
                  <button
                    onClick={() => setFiles(files.filter((f) => f.id !== file.id))}
                    className="p-1 rounded hover:bg-accent"
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              </motion.div>
            ))}
            {files.some((f) => f.status === "ready") && (
              <ActionButton variant="primary" onClick={handleUseText} icon={<Upload className="w-4 h-4" />}>
                Use Extracted Text in AI Engine
              </ActionButton>
            )}
          </div>
        )}
      </GlassCard>
    </section>
  );
}