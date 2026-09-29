import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Camera,
  Image as ImageIcon,
  Paperclip,
  Mic,
  MicOff,
  Send,
  Sparkles,
  HelpCircle,
  Lightbulb,
  BookOpen,
  ListOrdered,
  X
} from "lucide-react";

interface ChatInputProps {
  onSendMessage: (
    text: string,
    actionType?: "explain_simply" | "step_by_step" | "example" | "practice" | "summarize",
    images?: string[]
  ) => void;
  onLaunchCamera: () => void;
  isLoading?: boolean;
}

export function ChatInput({
  onSendMessage,
  onLaunchCamera,
  isLoading = false,
}: ChatInputProps) {
  const [inputText, setInputText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [attachedImages, setAttachedImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const docInputRef = useRef<HTMLInputElement | null>(null);

  const quickActions: {
    label: string;
    action: "explain_simply" | "step_by_step" | "example" | "practice" | "summarize";
    icon: React.ReactNode;
  }[] = [
    { label: "Explain Simply", action: "explain_simply", icon: <HelpCircle className="h-3.5 w-3.5 text-amber-400" /> },
    { label: "Solve Step-by-Step", action: "step_by_step", icon: <ListOrdered className="h-3.5 w-3.5 text-orange-400" /> },
    { label: "Give an Example", action: "example", icon: <Lightbulb className="h-3.5 w-3.5 text-yellow-400" /> },
    { label: "Create Practice Questions", action: "practice", icon: <BookOpen className="h-3.5 w-3.5 text-emerald-400" /> },
    { label: "Summarize", action: "summarize", icon: <Sparkles className="h-3.5 w-3.5 text-purple-400" /> },
  ];

  const handleSend = (actionOverride?: "explain_simply" | "step_by_step" | "example" | "practice" | "summarize") => {
    if ((!inputText.trim() && attachedImages.length === 0) || isLoading) return;

    const query = inputText.trim() || "Please solve and explain the attached question.";
    onSendMessage(query, actionOverride, attachedImages.length > 0 ? attachedImages : undefined);
    setInputText("");
    setAttachedImages([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleImageUpload = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setAttachedImages((prev) => [...prev, e.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const toggleVoiceRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      return;
    }

    // Try web speech recognition API
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = "en-US";
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => setIsRecording(true);
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
          setIsRecording(false);
        };
        recognition.onerror = () => setIsRecording(false);
        recognition.onend = () => setIsRecording(false);
        recognition.start();
        return;
      } catch (e) {
        console.warn("Speech recognition error:", e);
      }
    }

    // Fallback voice simulation
    setIsRecording(true);
    setTimeout(() => {
      setInputText("Can you explain how Newton's second law applies to circular motion?");
      setIsRecording(false);
    }, 1500);
  };

  return (
    <div className="space-y-3">
      {/* Hidden file inputs */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleImageUpload(e.target.files)}
      />
      <input
        type="file"
        ref={docInputRef}
        accept=".pdf,.doc,.docx,.txt"
        className="hidden"
        onChange={(e) => handleImageUpload(e.target.files)}
      />

      {/* Quick Action Prompts Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-gray-400 shrink-0 font-medium text-[11px] flex items-center gap-1">
          <Sparkles className="h-3.5 w-3.5 text-orange-400" /> Quick actions:
        </span>
        {quickActions.map((qa, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSend(qa.action)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] hover:bg-orange-500/15 border border-white/10 hover:border-orange-500/40 text-gray-300 hover:text-white transition-all shrink-0 select-none"
          >
            {qa.icon}
            <span>{qa.label}</span>
          </button>
        ))}
      </div>

      {/* Attached Images Thumbnails */}
      {attachedImages.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto p-2 bg-black/40 rounded-xl border border-white/10">
          {attachedImages.map((img, idx) => (
            <div key={idx} className="relative group w-14 h-14 rounded-lg overflow-hidden border border-white/20 bg-black shrink-0">
              <img src={img} alt="Attachment" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => setAttachedImages((prev) => prev.filter((_, i) => i !== idx))}
                className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-red-500 text-white"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          <span className="text-xs text-gray-400 ml-2">
            {attachedImages.length} image(s) ready for AI analysis
          </span>
        </div>
      )}

      {/* Main Large Input Area */}
      <div className="relative rounded-2xl glass-panel border border-white/15 focus-within:border-orange-500/60 focus-within:shadow-glow-sm transition-all duration-300 p-3 bg-[#0d0f18]/80">
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything... (type a question, paste an image, or click Scan Question)"
          rows={2}
          className="w-full bg-transparent text-sm sm:text-base text-white placeholder:text-gray-400 focus:outline-none resize-none pr-12 leading-relaxed"
        />

        {/* Action Controls Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/10">
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Prominent Scan Question Button */}
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={onLaunchCamera}
              className="gap-1.5 text-xs font-semibold shadow-glow-sm bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 text-black hover:opacity-95"
            >
              <Camera className="h-4 w-4" />
              <span className="hidden sm:inline">📷 Scan Question</span>
              <span className="sm:hidden">Scan</span>
            </Button>

            {/* Upload Image Button */}
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs gap-1.5 hover:text-white"
              title="Upload JPG, PNG, WEBP"
            >
              <ImageIcon className="h-3.5 w-3.5 text-orange-400" />
              <span className="hidden sm:inline">Upload Image</span>
            </Button>

            {/* Upload File / PDF */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => docInputRef.current?.click()}
              className="text-xs gap-1.5 text-gray-400 hover:text-white"
              title="Upload PDF or notes"
            >
              <Paperclip className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Attach PDF</span>
            </Button>

            {/* Voice Input */}
            <button
              type="button"
              onClick={toggleVoiceRecording}
              className={`p-2 rounded-xl transition-all ${
                isRecording
                  ? "bg-red-500 text-white animate-pulse"
                  : "text-gray-400 hover:text-white hover:bg-white/10"
              }`}
              title={isRecording ? "Listening..." : "Voice input"}
            >
              {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </button>
          </div>

          {/* Send Action */}
          <Button
            type="button"
            variant="default"
            size="sm"
            disabled={(!inputText.trim() && attachedImages.length === 0) || isLoading}
            isLoading={isLoading}
            onClick={() => handleSend()}
            className="px-4 text-xs font-semibold gap-1.5 shadow-md"
          >
            <span>Send</span>
            <Send className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
