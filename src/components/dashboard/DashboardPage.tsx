import React, { useState, useEffect } from "react";
import { getStudentProfile, getSolvedQuestions, deleteSolvedQuestion, saveStudentProfile } from "@/services/storageService";
import { StudentProfile, SolvedQuestion } from "@/types";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { StepByStepSolution } from "@/components/solver/StepByStepSolution";
import {
  Flame,
  CheckCircle2,
  Clock,
  Target,
  Sparkles,
  TrendingUp,
  BrainCircuit,
  Camera,
  Trash2,
  ExternalLink,
  MessageSquare,
  ArrowRight,
  ChevronRight,
  BookOpen,
  Calendar,
  AlertTriangle,
  Award
} from "lucide-react";

interface DashboardPageProps {
  onNavigateToSolve: () => void;
  onNavigateToTutor: (topic?: string) => void;
  onNavigateToPractice: (topic: string) => void;
}

export function DashboardPage({
  onNavigateToSolve,
  onNavigateToTutor,
  onNavigateToPractice,
}: DashboardPageProps) {
  const [profile, setProfile] = useState<StudentProfile>(getStudentProfile());
  const [solvedQuestions, setSolvedQuestions] = useState<SolvedQuestion[]>(getSolvedQuestions());
  const [inspectQuestion, setInspectQuestion] = useState<SolvedQuestion | null>(null);

  useEffect(() => {
    setProfile(getStudentProfile());
    setSolvedQuestions(getSolvedQuestions());
  }, []);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Remove this solved question from your history?")) {
      deleteSolvedQuestion(id);
      setSolvedQuestions(getSolvedQuestions());
    }
  };

  // Determine time of day greeting
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  // Calculate highest activity for chart scaling
  const maxWeekly = Math.max(...profile.weeklyActivity.map((w) => w.questions), 25);

  return (
    <div className="min-h-screen bg-[#090a0f] text-gray-100 py-10 px-4 sm:px-6 lg:px-8">
      {/* Question Inspection Modal */}
      {inspectQuestion && (
        <Dialog
          isOpen={!!inspectQuestion}
          onClose={() => setInspectQuestion(null)}
          title={
            <div className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-orange-400" />
              <span>{inspectQuestion.subject} - {inspectQuestion.topic}</span>
            </div>
          }
          description={`Solved on ${formatDate(inspectQuestion.createdAt)}`}
          maxWidth="2xl"
        >
          <div className="space-y-6 pt-2">
            {/* Scanned images preview */}
            {inspectQuestion.imageUrls.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {inspectQuestion.imageUrls.map((img, i) => (
                  <div key={i} className="w-36 h-24 rounded-lg overflow-hidden border border-white/20 bg-black shrink-0">
                    <img src={img} alt="Question" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}

            <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 text-sm text-gray-200 italic">
              "{inspectQuestion.extractedText}"
            </div>

            <StepByStepSolution solution={inspectQuestion.solution} />

            <div className="flex justify-between items-center pt-4 border-t border-white/10">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setInspectQuestion(null);
                  onNavigateToTutor(`Continue discussing: ${inspectQuestion.extractedText}`);
                }}
                className="gap-1.5 text-xs"
              >
                <MessageSquare className="h-3.5 w-3.5" /> Continue Chat in AI Tutor
              </Button>

              <Button
                variant="gradient"
                size="sm"
                onClick={() => {
                  setInspectQuestion(null);
                  onNavigateToPractice(inspectQuestion.topic);
                }}
                className="gap-1.5 text-xs"
              >
                Practice Similar <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </Dialog>
      )}

      <div className="max-w-6xl mx-auto space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {timeGreeting}, {profile.name} 👋
              </h1>
              <Badge variant="glow" className="text-xs">
                {profile.gradeLevel}
              </Badge>
            </div>
            <p className="text-sm text-gray-400">
              Here is your personal study progress, active streak, and AI recommendations for today.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="default"
              size="md"
              onClick={onNavigateToSolve}
              className="gap-2 text-xs font-semibold shadow-glow-sm"
            >
              <Camera className="h-4 w-4" />
              <span>📷 Scan Question</span>
            </Button>
          </div>
        </div>

        {/* 4 Core KPI Stat Cards (Section 22) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Today's Progress */}
          <div className="glass-panel rounded-2xl p-5 border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Today's Progress
              </span>
              <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white">
                {profile.questionsSolvedToday}
              </span>
              <span className="text-xs text-gray-400">questions solved</span>
            </div>
            <div className="text-[11px] text-emerald-400 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              <span>+3 from yesterday</span>
            </div>
          </div>

          {/* Study Streak */}
          <div className="glass-panel rounded-2xl p-5 border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Study Streak
              </span>
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Flame className="h-4 w-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-amber-400">
                {profile.studyStreakDays}
              </span>
              <span className="text-xs text-gray-400">days active 🔥</span>
            </div>
            <div className="text-[11px] text-amber-300">
              Personal best: 14 days
            </div>
          </div>

          {/* Practice Accuracy */}
          <div className="glass-panel rounded-2xl p-5 border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Overall Accuracy
              </span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Target className="h-4 w-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-emerald-400">
                {profile.accuracyRate}%
              </span>
              <span className="text-xs text-gray-400">avg. score</span>
            </div>
            <div className="text-[11px] text-emerald-300">
              Top 5% across students
            </div>
          </div>

          {/* Total Study Time */}
          <div className="glass-panel rounded-2xl p-5 border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Study Time
              </span>
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white">
                {(profile.totalStudyMinutes / 60).toFixed(1)}
              </span>
              <span className="text-xs text-gray-400">hours logged</span>
            </div>
            <div className="text-[11px] text-blue-300">
              Goal: 10 hrs / week
            </div>
          </div>
        </div>

        {/* AI Recommendations Card (Section 22 & 23) */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-orange-500/15 via-amber-500/10 to-transparent border border-orange-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-400 animate-pulse" />
              <h3 className="text-base font-bold text-white">
                Personalized AI Learning Recommendations
              </h3>
            </div>
            <Badge variant="glow" className="text-[10px]">
              Adaptive Engine
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            {profile.aiRecommendations.map((rec, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-2 flex flex-col justify-between"
              >
                <p className="text-xs sm:text-sm text-gray-200 leading-relaxed">
                  {rec}
                </p>
                <button
                  onClick={() => onNavigateToPractice(rec)}
                  className="text-xs font-medium text-orange-400 hover:text-orange-300 flex items-center gap-1 self-start pt-1"
                >
                  <span>Practice this now</span>
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Analytics Section: Weekly Activity Bar Chart & Topics Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Weekly Activity Bar Chart */}
          <div className="lg:col-span-2 glass-panel rounded-2xl p-6 border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Weekly Learning Activity</h3>
                <p className="text-xs text-gray-400">Questions solved per day</p>
              </div>
              <Badge variant="secondary" className="text-xs">
                Last 7 Days
              </Badge>
            </div>

            {/* Visual Bar Chart */}
            <div className="pt-4 flex items-end justify-between gap-3 h-48 border-b border-white/10 pb-2">
              {profile.weeklyActivity.map((w, idx) => {
                const heightPercent = Math.round((w.questions / maxWeekly) * 100);
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                    <span className="text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity font-mono">
                      {w.questions}q
                    </span>
                    <div
                      className="w-full max-w-[40px] bg-gradient-to-t from-orange-500 to-amber-400 rounded-lg group-hover:brightness-125 transition-all shadow-glow-sm"
                      style={{ height: `${Math.max(heightPercent, 12)}%` }}
                    />
                    <span className="text-xs text-gray-400 font-medium">{w.day}</span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-xs text-gray-400 pt-1">
              <span>Total this week: 124 questions</span>
              <span className="text-orange-400 font-medium">8.2 hours focused study</span>
            </div>
          </div>

          {/* Strong vs Weak Topics Card (Section 23) */}
          <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-5 flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-white mb-1">Knowledge Breakdown</h3>
              <p className="text-xs text-gray-400 mb-4">Focus on weak areas for faster score boosts.</p>

              {/* Strong Topics */}
              <div className="space-y-2 mb-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Strong Mastery (≥90%)
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {profile.strongTopics.map((top, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                    >
                      {top}
                    </span>
                  ))}
                </div>
              </div>

              {/* Weak Topics */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5" /> Needs Practice
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {profile.weakTopics.map((top, idx) => (
                    <button
                      key={idx}
                      onClick={() => onNavigateToPractice(top)}
                      className="text-xs px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20 hover:border-amber-400 hover:bg-amber-500/20 transition-all flex items-center gap-1"
                    >
                      <span>{top}</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigateToPractice(profile.weakTopics[0])}
              className="w-full text-xs text-orange-300 border-orange-500/30"
            >
              Start Targeted Weak-Topic Drill
            </Button>
          </div>
        </div>

        {/* IMAGE QUESTION HISTORY (Section 25) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Camera className="h-5 w-5 text-orange-400" />
                Image Question History ({solvedQuestions.length})
              </h3>
              <p className="text-xs text-gray-400">
                All questions scanned or photographed by you, stored with full solutions and follow-up chats.
              </p>
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={onNavigateToSolve}
              className="text-xs gap-1.5"
            >
              <Camera className="h-3.5 w-3.5 text-orange-400" />
              <span>Scan New</span>
            </Button>
          </div>

          {solvedQuestions.length === 0 ? (
            <div className="p-10 rounded-2xl glass-panel border border-white/10 text-center space-y-3">
              <Camera className="h-10 w-10 text-gray-500 mx-auto opacity-50" />
              <h4 className="text-base font-bold text-white">No image questions yet</h4>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">
                Photograph or upload any problem from your textbook, homework sheet, or screen to see it solved here!
              </p>
              <Button variant="default" size="sm" onClick={onNavigateToSolve}>
                Scan Your First Question
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {solvedQuestions.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setInspectQuestion(item)}
                  className="glass-panel glass-panel-hover rounded-2xl p-4 cursor-pointer border border-white/10 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-12 h-12 rounded-xl bg-black border border-white/15 overflow-hidden shrink-0">
                        {item.imageUrls[0] ? (
                          <img src={item.imageUrls[0]} alt="Thumbnail" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-orange-400">
                            <BookOpen className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-orange-400 uppercase">
                            {item.subject}
                          </span>
                          <span className="text-gray-500">•</span>
                          <span className="text-xs text-gray-300 font-medium">{item.topic}</span>
                        </div>
                        <span className="text-[11px] text-gray-500">{formatDate(item.createdAt)}</span>
                      </div>
                    </div>

                    <Badge variant="glow" className="text-[10px]">
                      Solved
                    </Badge>
                  </div>

                  <p className="text-xs text-gray-300 line-clamp-2 italic">
                    "{item.extractedText}"
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigateToTutor(`Discuss solved question: ${item.extractedText}`);
                        }}
                        className="text-orange-400 hover:text-orange-300 font-medium flex items-center gap-1"
                      >
                        <MessageSquare className="h-3 w-3" /> Continue Chat
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigateToPractice(item.topic);
                        }}
                        className="text-amber-400 hover:text-amber-300 font-medium"
                      >
                        Practice Similar
                      </button>
                      <button
                        onClick={(e) => handleDelete(item.id, e)}
                        className="p-1 rounded-md text-gray-500 hover:text-red-400 hover:bg-white/5"
                        title="Delete question"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
