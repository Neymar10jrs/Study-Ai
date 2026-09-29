import React from "react";
import { SubjectInfo } from "@/types";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  BrainCircuit,
  FileText,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  ArrowRight,
  ListTodo
} from "lucide-react";

interface SubjectDetailModalProps {
  subject: SubjectInfo | null;
  isOpen: boolean;
  onClose: () => void;
  onLaunchTutor: (subjectName: string) => void;
  onLaunchPractice: (subjectId: string, topic?: string) => void;
  onLaunchNotes: (subjectName: string) => void;
  onLaunchQuiz: (subjectName: string) => void;
}

export function SubjectDetailModal({
  subject,
  isOpen,
  onClose,
  onLaunchTutor,
  onLaunchPractice,
  onLaunchNotes,
  onLaunchQuiz,
}: SubjectDetailModalProps) {
  if (!subject) return null;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xl font-bold text-white">{subject.name}</span>
            <Badge variant="secondary" className="ml-2 text-xs">
              {subject.category}
            </Badge>
          </div>
        </div>
      }
      description={subject.description}
      maxWidth="2xl"
    >
      <div className="space-y-6 pt-2">
        {/* Subject Mastery Progress Bar */}
        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400 flex items-center gap-1.5 font-medium">
              <TrendingUp className="h-4 w-4 text-orange-400" />
              Subject Mastery
            </span>
            <span className="font-bold text-orange-300">{subject.masteryPercent}%</span>
          </div>

          <div className="w-full h-2.5 bg-black/60 rounded-full overflow-hidden border border-white/5">
            <div
              className="h-full bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 rounded-full transition-all duration-500 shadow-glow-sm"
              style={{ width: `${subject.masteryPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1">
            <span>{subject.topicsCount} Topics in Curriculum</span>
            <span>Target: 95% Exam Readiness</span>
          </div>
        </div>

        {/* 4 Core Subject Tools / Hub Shortcuts */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => {
              onClose();
              onLaunchTutor(subject.name);
            }}
            className="p-3.5 rounded-xl glass-panel hover:bg-orange-500/10 border border-white/10 hover:border-orange-500/40 text-center transition-all group"
          >
            <BrainCircuit className="h-6 w-6 text-orange-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-white block">AI Tutor</span>
            <span className="text-[10px] text-gray-400">Ask questions</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onLaunchNotes(subject.name);
            }}
            className="p-3.5 rounded-xl glass-panel hover:bg-amber-500/10 border border-white/10 hover:border-amber-500/40 text-center transition-all group"
          >
            <FileText className="h-6 w-6 text-amber-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-white block">Study Notes</span>
            <span className="text-[10px] text-gray-400">Key formulas</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onLaunchPractice(subject.id);
            }}
            className="p-3.5 rounded-xl glass-panel hover:bg-emerald-500/10 border border-white/10 hover:border-emerald-500/40 text-center transition-all group"
          >
            <CheckCircle2 className="h-6 w-6 text-emerald-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-white block">Practice</span>
            <span className="text-[10px] text-gray-400">Solve problems</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onLaunchQuiz(subject.name);
            }}
            className="p-3.5 rounded-xl glass-panel hover:bg-purple-500/10 border border-white/10 hover:border-purple-500/40 text-center transition-all group"
          >
            <Sparkles className="h-6 w-6 text-purple-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-white block">AI Quiz</span>
            <span className="text-[10px] text-gray-400">Test yourself</span>
          </button>
        </div>

        {/* Popular / High-Yield Topics List */}
        <div className="space-y-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
            <ListTodo className="h-4 w-4 text-orange-400" />
            Important High-Yield Topics
          </span>

          <div className="space-y-2">
            {subject.popularTopics.map((topic, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                  <span className="text-sm font-medium text-white">{topic}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onClose();
                      onLaunchPractice(subject.id, topic);
                    }}
                    className="text-xs py-1 h-7 border-white/10 hover:border-orange-500/50"
                  >
                    Practice
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      onClose();
                      onLaunchTutor(`${subject.name}: Explain ${topic}`);
                    }}
                    className="text-xs py-1 h-7 text-orange-400"
                  >
                    Learn
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>

          <Button
            variant="gradient"
            size="md"
            onClick={() => {
              onClose();
              onLaunchTutor(subject.name);
            }}
            className="font-semibold shadow-glow-amber text-xs gap-1.5"
          >
            <span>Start Learning {subject.name}</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
