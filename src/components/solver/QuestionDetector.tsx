import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  FileQuestion,
  Edit3,
  Check,
  Sparkles,
  ArrowRight,
  BookOpen,
  HelpCircle,
  Undo
} from "lucide-react";

interface QuestionDetectorProps {
  extractedText: string;
  subject: string;
  topic: string;
  onSolve: (finalQuestion: string) => void;
  isSolving?: boolean;
}

export function QuestionDetector({
  extractedText,
  subject,
  topic,
  onSolve,
  isSolving = false,
}: QuestionDetectorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentText, setCurrentText] = useState(extractedText);

  const mathSymbols = ["±", "²", "³", "√", "π", "θ", "∫", "∑", "≤", "≥", "÷", "×", "→", "Δ", "∞", "λ"];

  const handleInsertSymbol = (sym: string) => {
    setCurrentText((prev) => prev + sym);
  };

  const handleSolve = () => {
    setIsEditing(false);
    onSolve(currentText);
  };

  return (
    <div className="p-5 rounded-2xl glass-panel border border-orange-500/30 shadow-lg space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <FileQuestion className="h-5 w-5 text-orange-400" />
          <h3 className="text-base font-bold text-white tracking-tight">Question Detected</h3>
          <Badge variant="glow" className="text-[11px]">
            AI Extracted
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            <BookOpen className="h-3 w-3 mr-1 text-orange-400" />
            {subject}
          </Badge>
          <span className="text-xs text-gray-400">• {topic}</span>
        </div>
      </div>

      {/* Extracted text or Edit Area */}
      {isEditing ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-gray-400">
              Edit question text or correct OCR reading:
            </label>
            <button
              onClick={() => setCurrentText(extractedText)}
              className="text-xs text-gray-400 hover:text-orange-300 flex items-center gap-1"
            >
              <Undo className="h-3 w-3" /> Reset original
            </button>
          </div>

          <Textarea
            value={currentText}
            onChange={(e) => setCurrentText(e.target.value)}
            rows={4}
            className="font-mono text-sm leading-relaxed"
            placeholder="Type or edit question here..."
          />

          {/* Quick Math Symbols Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 px-2 rounded-lg bg-black/40 border border-white/5 text-xs">
            <span className="text-gray-500 shrink-0 mr-1 text-[11px]">Math symbols:</span>
            {mathSymbols.map((sym, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleInsertSymbol(sym)}
                className="px-2 py-0.5 rounded bg-white/10 hover:bg-orange-500/20 text-gray-200 hover:text-orange-300 font-mono transition-colors"
              >
                {sym}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-black/40 border border-white/10 text-white font-medium text-base sm:text-lg leading-relaxed relative group">
          <blockquote className="italic border-l-2 border-orange-500 pl-3">
            "{currentText}"
          </blockquote>
          {currentText !== extractedText && (
            <span className="text-[10px] text-amber-400 mt-2 block font-normal">
              *(User edited question)
            </span>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setIsEditing(!isEditing)}
          className="text-xs gap-1.5"
        >
          {isEditing ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              Done Editing
            </>
          ) : (
            <>
              <Edit3 className="h-3.5 w-3.5 text-orange-400" />
              Edit Question
            </>
          )}
        </Button>

        <Button
          variant="gradient"
          size="md"
          isLoading={isSolving}
          onClick={handleSolve}
          className="text-sm font-semibold gap-2 shadow-glow-amber px-6"
        >
          <Sparkles className="h-4 w-4" />
          <span>Solve Question</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
