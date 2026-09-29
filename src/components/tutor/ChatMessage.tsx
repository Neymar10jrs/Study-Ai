import React, { useState } from "react";
import { ChatMessage as ChatMessageType } from "@/types";
import { FormattedContent } from "./MathRenderer";
import { StepByStepSolution } from "@/components/solver/StepByStepSolution";
import { Bot, User, Copy, Check, Volume2, Sparkles, Image as ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ChatMessageProps {
  message: ChatMessageType;
  onFollowUpAction?: (actionText: string) => void;
}

export function ChatMessage({ message, onFollowUpAction }: ChatMessageProps) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = () => {
    if ("speechSynthesis" in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
      }
      const utterance = new SpeechSynthesisUtterance(message.content.replace(/[$#*_`]/g, ""));
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div
      className={`flex items-start gap-3 sm:gap-4 py-4 px-2 sm:px-4 rounded-2xl transition-colors ${
        isUser ? "bg-white/[0.02]" : "bg-[#11131c]/60 border border-white/5"
      }`}
    >
      {/* Avatar Icon */}
      <div
        className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 border ${
          isUser
            ? "bg-white/10 border-white/15 text-gray-200"
            : "bg-gradient-to-br from-orange-500/20 to-amber-500/20 border-orange-500/40 text-orange-400 shadow-glow-sm"
        }`}
      >
        {isUser ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
      </div>

      {/* Message Body */}
      <div className="flex-1 space-y-3 overflow-hidden">
        {/* Header line */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white">
              {isUser ? "You" : "StudyAI Tutor"}
            </span>
            {message.subject && (
              <Badge variant="outline" className="text-[10px] py-0 px-2">
                {message.subject}
              </Badge>
            )}
            <span className="text-xs text-gray-500">{message.timestamp}</span>
          </div>

          {!isUser && (
            <div className="flex items-center gap-1">
              <button
                onClick={handleSpeak}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                title={isSpeaking ? "Stop listening" : "Read aloud"}
              >
                <Volume2 className={`h-4 w-4 ${isSpeaking ? "text-orange-400 animate-pulse" : ""}`} />
              </button>
              <button
                onClick={handleCopy}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                title="Copy text"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          )}
        </div>

        {/* Attached Images if any */}
        {message.imageAttachments && message.imageAttachments.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {message.imageAttachments.map((img, idx) => (
              <div
                key={idx}
                className="w-32 h-20 rounded-xl overflow-hidden border border-white/15 bg-black"
              >
                <img src={img} alt="Question upload" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        )}

        {/* Content text with KaTeX & Markdown */}
        <div className="text-sm sm:text-base text-gray-200 leading-relaxed">
          <FormattedContent text={message.content} />
        </div>

        {/* Render Structured Step-by-Step Educational Solution if present */}
        {message.solution && (
          <div className="pt-2">
            <StepByStepSolution
              solution={message.solution}
              onFollowUpAction={onFollowUpAction}
            />
          </div>
        )}
      </div>
    </div>
  );
}
