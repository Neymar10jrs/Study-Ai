import React, { useState, useEffect, useRef } from "react";
import { ChatSidebar } from "./ChatSidebar";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { ChatMessage as ChatMessageType, DetailedSolution } from "@/types";
import { sendTutorMessage } from "@/services/aiService";
import { answerFollowUpQuestion } from "@/services/solverService";
import { getChatHistory, saveChatHistory } from "@/services/storageService";
import {
  Sparkles,
  Bot,
  BookOpen,
  HelpCircle,
  Lightbulb,
  CheckCircle2,
  Trash2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AIChatProps {
  onLaunchCamera: () => void;
  onNavigateToPractice?: (topic: string) => void;
  initialQuery?: string;
}

export function AIChat({
  onLaunchCamera,
  onNavigateToPractice,
  initialQuery,
}: AIChatProps) {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [activeSubject, setActiveSubject] = useState<string>("All Subjects");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Load chat history or welcome message
  useEffect(() => {
    const saved = getChatHistory();
    if (saved && saved.length > 0) {
      setMessages(saved);
    } else {
      const welcomeMsg: ChatMessageType = {
        id: "msg_welcome",
        role: "assistant",
        content: `👋 **Welcome to your personal AI Study Tutor!**\n\nI can help you understand any concept across **Mathematics, Physics, Chemistry, Biology, Computer Science, Economics**, and more.\n\n### How you can learn with me:\n- 📷 **Upload or photograph a question** using the **Scan Question** button.\n- ✍️ **Type an equation, formula, or concept** you want explained step-by-step.\n- 💡 Click **Explain Simply** if a topic feels confusing, or **Give an Example** to see real numbers.\n- 📝 Ask for **Practice Questions** to test your knowledge.\n\n*What would you like to explore today?*`,
        timestamp: "Just now",
        subject: "General",
      };
      setMessages([welcomeMsg]);
      saveChatHistory([welcomeMsg]);
    }
  }, []);

  // Handle incoming initialQuery from Hero search
  useEffect(() => {
    if (initialQuery) {
      handleSendMessage(initialQuery);
    }
  }, [initialQuery]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSendMessage = async (
    text: string,
    actionType?: "explain_simply" | "step_by_step" | "example" | "practice" | "summarize",
    images?: string[]
  ) => {
    const userMsg: ChatMessageType = {
      id: `usr_${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      subject: activeSubject !== "All Subjects" ? activeSubject : undefined,
      imageAttachments: images,
      actionType,
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    saveChatHistory(newHistory);
    setIsLoading(true);

    try {
      const aiResponse = await sendTutorMessage(
        text,
        activeSubject !== "All Subjects" ? activeSubject : "Mathematics",
        actionType,
        images ? { images } : undefined
      );

      const updatedHistory = [...newHistory, aiResponse];
      setMessages(updatedHistory);
      saveChatHistory(updatedHistory);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollowUpAction = async (actionText: string) => {
    // Check if there is a previous solution in messages
    const lastMsgWithSolution = [...messages].reverse().find((m) => m.solution);
    if (!lastMsgWithSolution?.solution) {
      handleSendMessage(actionText);
      return;
    }

    const userFollowUp: ChatMessageType = {
      id: `usr_fu_${Date.now()}`,
      role: "user",
      content: actionText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const newHistory = [...messages, userFollowUp];
    setMessages(newHistory);
    setIsLoading(true);

    try {
      const response = await answerFollowUpQuestion(
        lastMsgWithSolution.content,
        lastMsgWithSolution.solution,
        actionText
      );

      const aiFollowUp: ChatMessageType = {
        id: `ai_fu_${Date.now()}`,
        role: "assistant",
        content: response,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        subject: lastMsgWithSolution.solution.subject,
      };

      const finalHistory = [...newHistory, aiFollowUp];
      setMessages(finalHistory);
      saveChatHistory(finalHistory);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    const welcomeMsg: ChatMessageType = {
      id: `msg_welcome_${Date.now()}`,
      role: "assistant",
      content: `✨ **New Study Session started!** Ask any question, upload problem sheets, or pick a topic to dive into.`,
      timestamp: "Just now",
      subject: activeSubject !== "All Subjects" ? activeSubject : "General",
    };
    setMessages([welcomeMsg]);
    saveChatHistory([welcomeMsg]);
  };

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-64px)] w-full overflow-hidden bg-[#090a0f]">
      {/* Sidebar on Desktop / Collapsible on Mobile */}
      <div className="hidden md:block">
        <ChatSidebar
          onNewChat={handleNewChat}
          onSelectChat={(id) => {}}
          onSelectSubject={(sub) => setActiveSubject(sub)}
          activeSubject={activeSubject}
          savedQuestionsCount={3}
          onOpenSavedQuestions={() => {}}
          onOpenStudyHistory={() => {}}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-gradient-to-b from-[#0b0d14] to-[#090a0f]">
        {/* Header */}
        <header className="px-6 py-3.5 border-b border-white/10 flex items-center justify-between bg-black/40 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-orange-500/20 border border-orange-500/40 text-orange-400 flex items-center justify-center shadow-glow-sm">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  AI Study Tutor
                </h2>
                <Badge variant="glow" className="text-[10px]">
                  Online
                </Badge>
              </div>
              <p className="text-xs text-gray-400">Ask anything. Learn everything.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              <BookOpen className="h-3 w-3 mr-1 text-orange-400" />
              {activeSubject}
            </Badge>
            <button
              onClick={() => {
                if (window.confirm("Clear current chat conversation?")) {
                  handleNewChat();
                }
              }}
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-white/5 transition-colors"
              title="Clear conversation"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4">
          {messages.map((msg) => (
            <ChatMessage
              key={msg.id}
              message={msg}
              onFollowUpAction={handleFollowUpAction}
            />
          ))}

          {isLoading && (
            <div className="flex items-start gap-4 py-4 px-4 rounded-2xl bg-[#11131c]/60 border border-white/5">
              <div className="h-9 w-9 rounded-xl bg-orange-500/20 border border-orange-500/40 text-orange-400 flex items-center justify-center shrink-0">
                <Bot className="h-5 w-5 animate-pulse" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">StudyAI Tutor</span>
                  <span className="text-xs text-orange-400 animate-pulse">Thinking step-by-step...</span>
                </div>
                <div className="flex items-center gap-1.5 py-1">
                  <div className="w-2 h-2 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 rounded-full bg-yellow-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Floating Input Area */}
        <div className="p-4 sm:p-6 bg-gradient-to-t from-[#090a0f] via-[#090a0f]/95 to-transparent border-t border-white/5">
          <div className="max-w-4xl mx-auto">
            <ChatInput
              onSendMessage={handleSendMessage}
              onLaunchCamera={onLaunchCamera}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
