import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  UploadCloud,
  Camera,
  Image as ImageIcon,
  ClipboardPaste,
  FileText,
  X,
  Plus,
  Sparkles,
  Layers,
  ArrowRight
} from "lucide-react";

interface ImageUploaderProps {
  onImagesSelected: (images: string[]) => void;
  onLaunchCamera: () => void;
  initialImages?: string[];
  isAnalyzing?: boolean;
}

export function ImageUploader({
  onImagesSelected,
  onLaunchCamera,
  initialImages = [],
  isAnalyzing = false,
}: ImageUploaderProps) {
  const [images, setImages] = useState<string[]>(initialImages);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (initialImages && initialImages.length > 0) {
      setImages(initialImages);
    }
  }, [initialImages]);

  // Global & Local clipboard paste listener
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            const reader = new FileReader();
            reader.onload = (uploadEvent) => {
              if (uploadEvent.target?.result) {
                setImages((prev) => [...prev, uploadEvent.target!.result as string]);
              }
            };
            reader.readAsDataURL(blob);
          }
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, []);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (file.type.startsWith("image/") || file.type === "application/pdf") {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            setImages((prev) => [...prev, e.target!.result as string]);
          }
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleProceed = () => {
    if (images.length > 0) {
      onImagesSelected(images);
    }
  };

  // Sample quick questions presets for effortless testing
  const loadPreset = (type: "calculus" | "physics" | "chemistry" | "geometry") => {
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Dark sleek chalkboard style or clean exam sheet
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 800, 480);

    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 22px system-ui";

    if (type === "calculus") {
      ctx.fillText("Exam Section B: Integral Calculus", 40, 50);
      ctx.font = "18px serif";
      ctx.fillText("Evaluate the definite integral:", 40, 110);
      ctx.font = "bold 32px serif";
      ctx.fillStyle = "#b45309";
      ctx.fillText("∫₀^π  x · sin(x) dx", 80, 190);
      ctx.fillStyle = "#334155";
      ctx.font = "16px sans-serif";
      ctx.fillText("Apply integration by parts. State your u and dv choices clearly.", 40, 270);
    } else if (type === "physics") {
      ctx.fillText("Physics Test: Mechanics & Energy", 40, 50);
      ctx.font = "18px serif";
      ctx.fillText("A 5.0 kg block slides down a frictionless inclined plane of angle θ = 30°.", 40, 100);
      ctx.fillText("The incline has a length of 10 meters. (Take g = 9.8 m/s²)", 40, 135);
      ctx.font = "bold 20px serif";
      ctx.fillStyle = "#b45309";
      ctx.fillText("1) Find the acceleration of the block.", 60, 200);
      ctx.fillText("2) Calculate the final velocity at the bottom of the ramp.", 60, 240);
      // Draw incline diagram
      ctx.strokeStyle = "#0284c7";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(480, 380);
      ctx.lineTo(720, 380);
      ctx.lineTo(720, 240);
      ctx.closePath();
      ctx.stroke();
      ctx.fillStyle = "#ea580c";
      ctx.fillRect(580, 280, 40, 30);
    } else if (type === "chemistry") {
      ctx.fillText("Organic Chemistry & Reaction Mechanism", 40, 50);
      ctx.font = "20px serif";
      ctx.fillText("Predict the major product for the reaction of:", 40, 110);
      ctx.font = "bold 26px monospace";
      ctx.fillStyle = "#059669";
      ctx.fillText("2-bromo-2-methylpropane  +  H₂O  (warm)", 60, 180);
      ctx.fillStyle = "#334155";
      ctx.font = "17px sans-serif";
      ctx.fillText("Specify whether the reaction proceeds via SN1 or SN2, and explain why.", 40, 250);
    } else {
      ctx.fillText("Geometry & Trigonometry Challenge", 40, 50);
      ctx.font = "18px serif";
      ctx.fillText("In a right-angled triangle ABC, with ∠B = 90°:", 40, 100);
      ctx.font = "bold 22px serif";
      ctx.fillStyle = "#b45309";
      ctx.fillText("Side AB = 8 cm, Side BC = 15 cm. Find sin(A) and cos(A).", 60, 160);
      // Triangle diagram
      ctx.strokeStyle = "#475569";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(100, 380);
      ctx.lineTo(350, 380);
      ctx.lineTo(100, 230);
      ctx.closePath();
      ctx.stroke();
      ctx.fillStyle = "#1e293b";
      ctx.fillText("B", 85, 395);
      ctx.fillText("C", 355, 395);
      ctx.fillText("A", 85, 220);
    }

    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 2;
    ctx.strokeRect(20, 20, 760, 440);

    const data = canvas.toDataURL("image/jpeg");
    setImages((prev) => [...prev, data]);
  };

  return (
    <div className="space-y-4">
      <input
        type="file"
        ref={fileInputRef}
        accept="image/jpeg,image/png,image/webp,application/pdf"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {/* Main Drag & Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative border-2 border-dashed rounded-3xl p-6 sm:p-10 text-center transition-all duration-300 ${
          isDragOver
            ? "border-orange-500 bg-orange-500/10 scale-[1.01]"
            : "border-white/15 bg-white/[0.02] hover:bg-white/[0.04] hover:border-orange-500/40"
        }`}
      >
        <div className="flex flex-col items-center justify-center max-w-lg mx-auto">
          {/* Animated upload icon */}
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-500/10 border border-orange-500/30 text-orange-400 flex items-center justify-center mb-4 shadow-glow-sm">
            <UploadCloud className="h-8 w-8 animate-pulse" />
          </div>

          <h3 className="text-xl font-bold text-white mb-2">
            Upload or Photograph Question
          </h3>

          <p className="text-sm text-gray-300 mb-6 leading-relaxed">
            Drag & drop images here, or paste from clipboard (Ctrl+V / Cmd+V).
            <br />
            Supports <span className="text-orange-300 font-medium">handwritten notes</span>, printed questions, diagrams & multiple pages.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 w-full">
            <Button
              type="button"
              variant="default"
              size="md"
              onClick={onLaunchCamera}
              className="gap-2 shadow-glow-sm"
            >
              <Camera className="h-4 w-4" />
              <span>📷 Scan Question (Camera)</span>
            </Button>

            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => fileInputRef.current?.click()}
              className="gap-2"
            >
              <ImageIcon className="h-4 w-4 text-orange-400" />
              <span>Browse Files</span>
            </Button>
          </div>

          <div className="flex items-center gap-2 mt-4 text-xs text-gray-400">
            <ClipboardPaste className="h-3.5 w-3.5 text-amber-400" />
            <span>Tip: You can paste screenshots directly using <strong>Ctrl+V</strong></span>
          </div>
        </div>
      </div>

      {/* Preset Samples Bar for Instant Evaluation */}
      <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs text-gray-300 flex items-center gap-1.5 font-medium">
          <Sparkles className="h-3.5 w-3.5 text-amber-400" />
          Don't have an image ready? Try a sample exam question:
        </span>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => loadPreset("calculus")}
            className="text-xs px-2.5 py-1 rounded-lg bg-white/5 hover:bg-orange-500/20 text-orange-200 border border-white/10 hover:border-orange-500/40 transition-colors"
          >
            ∫ Calculus
          </button>
          <button
            onClick={() => loadPreset("physics")}
            className="text-xs px-2.5 py-1 rounded-lg bg-white/5 hover:bg-orange-500/20 text-amber-200 border border-white/10 hover:border-orange-500/40 transition-colors"
          >
            ⚡ Physics Incline
          </button>
          <button
            onClick={() => loadPreset("chemistry")}
            className="text-xs px-2.5 py-1 rounded-lg bg-white/5 hover:bg-orange-500/20 text-emerald-200 border border-white/10 hover:border-orange-500/40 transition-colors"
          >
            🧪 Organic Reaction
          </button>
          <button
            onClick={() => loadPreset("geometry")}
            className="text-xs px-2.5 py-1 rounded-lg bg-white/5 hover:bg-orange-500/20 text-blue-200 border border-white/10 hover:border-orange-500/40 transition-colors"
          >
            📐 Trigonometry
          </button>
        </div>
      </div>

      {/* Uploaded Images Gallery Strip */}
      {images.length > 0 && (
        <div className="p-4 rounded-2xl glass-panel border border-orange-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-orange-400" />
              <span className="text-sm font-bold text-white">
                Selected Images ({images.length})
              </span>
              {images.length > 1 && (
                <Badge variant="glow" className="text-[10px]">
                  Multi-Page Question
                </Badge>
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-xs text-orange-400 hover:text-orange-300 flex items-center gap-1 font-medium"
            >
              <Plus className="h-3 w-3" /> Add another image/page
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {images.map((img, idx) => (
              <div
                key={idx}
                className="relative group rounded-xl overflow-hidden border border-white/15 bg-black aspect-video flex items-center justify-center"
              >
                <img src={img} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                <span className="absolute bottom-1.5 left-1.5 text-[10px] font-bold bg-black/80 text-white px-2 py-0.5 rounded-md backdrop-blur-sm">
                  Page {idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-1.5 right-1.5 p-1 rounded-full bg-red-500/90 text-white shadow-md opacity-80 group-hover:opacity-100 transition-opacity"
                  title="Remove image"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              variant="gradient"
              size="md"
              isLoading={isAnalyzing}
              onClick={handleProceed}
              className="gap-2 font-semibold shadow-glow-amber px-6"
            >
              <span>Analyze Question ({images.length})</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
