import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  MessageSquare,
  Bookmark,
  BookOpen,
  History,
  Trash2,
  Sparkles,
  ChevronRight,
  Layers
} from "lucide-react";

interface ChatSidebarProps {
  currentChatId?: string;
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  onSelectSubject: (subject: string) => void;
  activeSubject?: string;
  savedQuestionsCount?: number;
  onOpenSavedQuestions: () => void;
  onOpenStudyHistory: () => void;
}

export function ChatSidebar({
  currentChatId,
  onNewChat,
  onSelectChat,
  onSelectSubject,
  activeSubject = "All Subjects",
  savedQuestionsCount = 5,
  onOpenSavedQuestions,
  onOpenStudyHistory,
}: ChatSidebarProps) {
  const recentChats = [
    { id: "rc_1", title: "Integration by Parts & Calculus", subject: "Mathematics", time: "10 mins ago" },
    { id: "rc_2", title: "Incline Plane Acceleration & Normal Force", subject: "Physics", time: "2 hours ago" },
    { id: "rc_3", title: "SN1 vs SN2 Reaction Mechanism", subject: "Chemistry", time: "Yesterday" },
    { id: "rc_4", title: "Binary Search Time Complexity Proof", subject: "Computer Science", time: "2 days ago" },
  ];

  const subjects = [
    "All Subjects",
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "Computer Science",
    "Economics",
  ];

  return (
    <aside className="w-full md:w-64 lg:w-72 flex flex-col h-full bg-[#0d0f17] border-r border-white/10 p-4 space-y-4">
      {/* New Chat Button */}
      <Button
        onClick={onNewChat}
        variant="gradient"
        size="md"
        className="w-full justify-start gap-2 shadow-glow-sm font-semibold"
      >
        <Plus className="h-4 w-4" />
        <span>New Chat / Question</span>
      </Button>

      {/* Quick Nav: Saved Questions & History */}
      <div className="space-y-1">
        <button
          onClick={onOpenSavedQuestions}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
        >
          <span className="flex items-center gap-2">
            <Bookmark className="h-3.5 w-3.5 text-orange-400" />
            <span>Saved Questions</span>
          </span>
          <Badge variant="glow" className="text-[10px] px-1.5 py-0">
            {savedQuestionsCount}
          </Badge>
        </button>

        <button
          onClick={onOpenStudyHistory}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
        >
          <span className="flex items-center gap-2">
            <History className="h-3.5 w-3.5 text-amber-400" />
            <span>Study History</span>
          </span>
          <ChevronRight className="h-3.5 w-3.5 text-gray-500" />
        </button>
      </div>

      {/* Subject Filter Pills */}
      <div className="space-y-1.5 pt-2 border-t border-white/5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 px-3 flex items-center gap-1.5">
          <BookOpen className="h-3 w-3 text-orange-400" /> Subjects
        </span>
        <div className="flex flex-wrap gap-1 px-1">
          {subjects.map((sub) => (
            <button
              key={sub}
              onClick={() => onSelectSubject(sub)}
              className={`text-xs px-2.5 py-1 rounded-lg transition-colors ${
                activeSubject === sub
                  ? "bg-orange-500/20 text-orange-300 border border-orange-500/40"
                  : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      </div>

      {/* Recent Chats List */}
      <div className="flex-1 overflow-y-auto space-y-1 pt-2 border-t border-white/5 pr-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 px-3 flex items-center gap-1.5 mb-2">
          <MessageSquare className="h-3 w-3 text-orange-400" /> Recent Chats
        </span>

        {recentChats.map((chat) => (
          <div
            key={chat.id}
            onClick={() => onSelectChat(chat.id)}
            className={`w-full text-left p-2.5 rounded-xl cursor-pointer transition-all duration-150 group ${
              currentChatId === chat.id
                ? "bg-white/10 border border-orange-500/40"
                : "hover:bg-white/5 border border-transparent"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-white truncate max-w-[170px]">
                {chat.title}
              </span>
            </div>
            <div className="flex items-center justify-between text-[10px] text-gray-400 mt-1">
              <span className="text-orange-300/80">{chat.subject}</span>
              <span>{chat.time}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Study History Footer Tip */}
      <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500/10 to-transparent border border-orange-500/20 text-[11px] text-gray-300">
        <div className="flex items-center gap-1.5 text-orange-300 font-semibold mb-1">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Active Learning AI</span>
        </div>
        Ask follow-up questions to drill into any specific derivation or formula.
      </div>
    </aside>
  );
}
