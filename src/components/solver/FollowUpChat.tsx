import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormattedContent } from "@/components/tutor/MathRenderer";
import { Send, Bot, User, Sparkles, HelpCircle } from "lucide-react";

interface FollowUpChatProps {
  initialChats?: { role: "user" | "assistant"; text: string; timestamp: string }[];
  onSendMessage: (text: string) => Promise<void>;
  isResponding?: boolean;
}

export function FollowUpChat({
  initialChats = [],
  onSendMessage,
  isResponding = false,
}: FollowUpChatProps) {
  const [messages, setMessages] = useState(initialChats);
  const [inputText, setInputText] = useState("");
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMessages(initialChats);
  }, [initialChats]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isResponding]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isResponding) return;

    const query = inputText.trim();
    setInputText("");
    await onSendMessage(query);
  };

  return (
    <div className="space-y-4 rounded-2xl glass-panel p-5 border border-white/10">
      <div className="flex items-center gap-2 border-b border-white/10 pb-3">
        <Bot className="h-5 w-5 text-orange-400" />
        <h4 className="text-base font-bold text-white">Ask Follow-Up Questions</h4>
        <span className="text-xs text-gray-400">• Step clarification & deeper understanding</span>
      </div>

      {/* Message History */}
      <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
        {messages.length === 0 ? (
          <div className="text-center py-6 text-gray-400 text-sm">
            <HelpCircle className="h-8 w-8 text-gray-500 mx-auto mb-2 opacity-50" />
            <p>Still unclear about any step or formula? Ask below!</p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-3 text-sm ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.role === "assistant" && (
                <div className="h-7 w-7 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0 border border-orange-500/30">
                  <Bot className="h-4 w-4" />
                </div>
              )}

              <div
                className={`p-3.5 rounded-2xl max-w-[85%] ${
                  msg.role === "user"
                    ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-br-sm"
                    : "bg-surface-raised border border-white/10 text-gray-200 rounded-bl-sm"
                }`}
              >
                <FormattedContent text={msg.text} />
                <span className="text-[10px] text-white/50 block mt-1 text-right">
                  {msg.timestamp}
                </span>
              </div>

              {msg.role === "user" && (
                <div className="h-7 w-7 rounded-lg bg-white/10 text-gray-300 flex items-center justify-center shrink-0 border border-white/10">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          ))
        )}

        {isResponding && (
          <div className="flex items-center gap-3 text-sm">
            <div className="h-7 w-7 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0 border border-orange-500/30">
              <Bot className="h-4 w-4" />
            </div>
            <div className="p-3 rounded-2xl bg-surface-raised border border-white/10 text-gray-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-400 animate-ping" />
              <span>AI Tutor is explaining...</span>
            </div>
          </div>
        )}

        <div ref={endRef} />
      </div>

      {/* Input bar */}
      <form onSubmit={handleSend} className="flex items-center gap-2 pt-2 border-t border-white/10">
        <Input
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask e.g. 'Why did you use this formula?' or 'Explain step 2'..."
          disabled={isResponding}
          className="text-sm"
        />
        <Button
          type="submit"
          variant="default"
          size="md"
          disabled={!inputText.trim() || isResponding}
          className="shrink-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
