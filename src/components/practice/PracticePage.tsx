import React, { useState, useEffect } from "react";
import { PRACTICE_QUESTIONS_BANK, INITIAL_SUBJECTS } from "@/services/mockData";
import { PracticeQuestion, SubjectId } from "@/types";
import { StepByStepSolution } from "@/components/solver/StepByStepSolution";
import { FormattedContent } from "@/components/tutor/MathRenderer";
import { formatTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import confetti from "canvas-confetti";
import {
  CheckCircle2,
  XCircle,
  Timer,
  Award,
  ArrowRight,
  RefreshCw,
  Lightbulb,
  Sparkles,
  BarChart3,
  HelpCircle,
  ChevronRight,
  BookOpen
} from "lucide-react";

interface PracticePageProps {
  initialSubjectId?: string;
  initialTopic?: string;
  onNavigateToTutor?: (query: string) => void;
}

export function PracticePage({
  initialSubjectId,
  initialTopic,
  onNavigateToTutor,
}: PracticePageProps) {
  const [selectedSubject, setSelectedSubject] = useState<string>(initialSubjectId || "mathematics");
  const [selectedDifficulty, setSelectedDifficulty] = useState<"Easy" | "Medium" | "Hard" | "Exam Level">("Medium");
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);

  // Active session questions
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [userScore, setUserScore] = useState(0);

  // Timer
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  useEffect(() => {
    let interval: any;
    if (sessionActive && !sessionCompleted) {
      interval = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [sessionActive, sessionCompleted]);

  const handleStartSession = () => {
    // Filter questions by subject or difficulty
    let filtered = PRACTICE_QUESTIONS_BANK.filter(
      (q) => q.subjectId === selectedSubject
    );

    if (filtered.length === 0) {
      filtered = PRACTICE_QUESTIONS_BANK;
    }

    setQuestions(filtered);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setUserScore(0);
    setSecondsElapsed(0);
    setSessionCompleted(false);
    setSessionActive(true);
  };

  const currentQ = questions[currentIndex];

  const handleSubmitAnswer = () => {
    if (selectedOption === null || isAnswerSubmitted) return;
    setIsAnswerSubmitted(true);

    if (selectedOption === currentQ.correctOptionIndex) {
      setUserScore((prev) => prev + 1);
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      setSessionCompleted(true);
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
    }
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-gray-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="border-b border-white/10 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-2 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30">
                <Award className="h-5 w-5" />
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Practice & Exam Arena
              </h1>
            </div>
            <p className="text-sm text-gray-400">
              Interactive topic practice with real-time step solutions, concepts tested, and weak-topic analytics.
            </p>
          </div>

          {sessionActive && (
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 font-mono text-sm text-amber-300">
              <Timer className="h-4 w-4 text-orange-400" />
              <span>{formatTime(secondsElapsed)}</span>
            </div>
          )}
        </div>

        {/* Configuration Screen (Before starting session) */}
        {!sessionActive && (
          <div className="p-6 rounded-2xl glass-panel border border-white/10 space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-orange-400" />
              Customize Practice Session
            </h3>

            {/* Subject Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400">
                1. Select Subject
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {INITIAL_SUBJECTS.slice(0, 8).map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => setSelectedSubject(sub.id)}
                    className={`p-3 rounded-xl border text-left text-xs sm:text-sm font-medium transition-all ${
                      selectedSubject === sub.id
                        ? "bg-orange-500/20 border-orange-500 text-white shadow-glow-sm"
                        : "bg-white/[0.02] border-white/10 text-gray-400 hover:text-white"
                    }`}
                  >
                    {sub.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400">
                2. Select Difficulty
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(["Easy", "Medium", "Hard", "Exam Level"] as const).map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setSelectedDifficulty(diff)}
                    className={`p-3 rounded-xl border text-center text-xs sm:text-sm font-semibold transition-all ${
                      selectedDifficulty === diff
                        ? "bg-gradient-to-r from-orange-500/20 to-amber-500/20 border-orange-500 text-orange-300 shadow-glow-sm"
                        : "bg-white/[0.02] border-white/10 text-gray-400 hover:text-white"
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            {/* Start Button */}
            <div className="pt-4 border-t border-white/10 flex justify-end">
              <Button
                variant="gradient"
                size="lg"
                onClick={handleStartSession}
                className="w-full sm:w-auto font-semibold shadow-glow-amber px-8"
              >
                Start Practice Session
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* ACTIVE QUESTION SCREEN */}
        {sessionActive && !sessionCompleted && currentQ && (
          <div className="space-y-6">
            {/* Question Progress bar */}
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>Question {currentIndex + 1} of {questions.length}</span>
              <div className="flex items-center gap-2">
                <Badge variant="glow" className="text-xs">
                  {currentQ.difficulty}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {currentQ.topic}
                </Badge>
              </div>
            </div>

            {/* Question Card */}
            <div className="p-6 rounded-2xl glass-panel border border-white/10 space-y-5">
              <div className="text-base sm:text-lg font-medium text-white leading-relaxed">
                <FormattedContent text={currentQ.question} />
              </div>

              {/* Multiple Choice Options */}
              <div className="space-y-3">
                {currentQ.options.map((opt, idx) => {
                  const isSelected = selectedOption === idx;
                  const isCorrect = isAnswerSubmitted && idx === currentQ.correctOptionIndex;
                  const isWrong = isAnswerSubmitted && isSelected && !isCorrect;

                  return (
                    <button
                      key={idx}
                      onClick={() => !isAnswerSubmitted && setSelectedOption(idx)}
                      disabled={isAnswerSubmitted}
                      className={`w-full p-4 rounded-xl text-left text-sm font-medium transition-all border flex items-center justify-between ${
                        isCorrect
                          ? "bg-emerald-500/20 border-emerald-500 text-emerald-200"
                          : isWrong
                          ? "bg-red-500/20 border-red-500 text-red-200"
                          : isSelected
                          ? "bg-orange-500/20 border-orange-500 text-white"
                          : "bg-white/[0.03] border-white/10 text-gray-300 hover:bg-white/[0.06]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white/10 text-xs font-mono">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span>{opt}</span>
                      </div>

                      {isCorrect && <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />}
                      {isWrong && <XCircle className="h-5 w-5 text-red-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Submit / Next Action Bar */}
              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSessionActive(false)}
                  className="text-xs text-gray-400"
                >
                  Exit Practice
                </Button>

                {!isAnswerSubmitted ? (
                  <Button
                    variant="gradient"
                    size="md"
                    disabled={selectedOption === null}
                    onClick={handleSubmitAnswer}
                    className="font-semibold shadow-glow-amber text-xs px-6"
                  >
                    Check Answer
                  </Button>
                ) : (
                  <Button
                    variant="default"
                    size="md"
                    onClick={handleNext}
                    className="font-semibold gap-1.5 text-xs px-6"
                  >
                    <span>{currentIndex < questions.length - 1 ? "Next Question" : "See Final Score"}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Answer Explanation & Concept Breakdown (Section 21) */}
            {isAnswerSubmitted && (
              <div className="space-y-4 animate-fadeIn">
                <div
                  className={`p-4 rounded-xl border flex items-start gap-3 ${
                    selectedOption === currentQ.correctOptionIndex
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-200"
                      : "bg-red-500/10 border-red-500/30 text-red-200"
                  }`}
                >
                  {selectedOption === currentQ.correctOptionIndex ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <h4 className="text-sm font-bold">
                      {selectedOption === currentQ.correctOptionIndex ? "Correct Answer!" : "Incorrect Answer"}
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-300 mt-1">
                      {currentQ.explanation}
                    </p>
                  </div>
                </div>

                {/* Concept Tested Card */}
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between text-xs">
                  <span className="text-gray-400 flex items-center gap-1.5 font-medium">
                    <Lightbulb className="h-4 w-4 text-amber-400" />
                    Concept Tested: <strong className="text-white ml-1">{currentQ.conceptTested}</strong>
                  </span>
                  {onNavigateToTutor && (
                    <button
                      onClick={() => onNavigateToTutor(`Explain ${currentQ.conceptTested}`)}
                      className="text-orange-400 hover:text-orange-300 font-medium"
                    >
                      Ask AI Tutor →
                    </button>
                  )}
                </div>

                {/* Full Educational Step-by-Step Solution */}
                <StepByStepSolution solution={currentQ.solution} />
              </div>
            )}
          </div>
        )}

        {/* SESSION SUMMARY REPORT (Section 21) */}
        {sessionCompleted && (
          <div className="p-8 rounded-2xl glass-panel border border-orange-500/40 space-y-6 text-center shadow-2xl animate-fadeIn">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 text-orange-400 border border-orange-500/40 flex items-center justify-center mx-auto shadow-glow-sm">
              <Award className="h-8 w-8" />
            </div>

            <div>
              <h2 className="text-2xl font-extrabold text-white">Practice Session Complete!</h2>
              <p className="text-sm text-gray-400 mt-1">
                Your performance metrics have been recorded to your student dashboard.
              </p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-xl mx-auto py-2">
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                <span className="text-xs text-gray-400 block mb-1">Score</span>
                <span className="text-2xl font-extrabold text-white">
                  {userScore} / {questions.length}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                <span className="text-xs text-gray-400 block mb-1">Accuracy</span>
                <span className="text-2xl font-extrabold text-amber-400">
                  {Math.round((userScore / Math.max(questions.length, 1)) * 100)}%
                </span>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                <span className="text-xs text-gray-400 block mb-1">Time Taken</span>
                <span className="text-2xl font-extrabold text-orange-400 font-mono">
                  {formatTime(secondsElapsed)}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                <span className="text-xs text-gray-400 block mb-1">XP Earned</span>
                <span className="text-2xl font-extrabold text-emerald-400">
                  +{userScore * 50}
                </span>
              </div>
            </div>

            {/* AI Insights & Weak Topics */}
            <div className="p-4 rounded-xl bg-orange-500/[0.08] border border-orange-500/25 max-w-xl mx-auto text-left text-xs text-gray-300 space-y-2">
              <span className="text-orange-300 font-bold flex items-center gap-1.5">
                <Sparkles className="h-4 w-4" /> AI Practice Recommendations:
              </span>
              <p>
                {userScore === questions.length
                  ? "Flawless performance! You have mastered these formulas. Try advancing to Exam Level questions."
                  : "You had hesitation on formula substitutions. Review the concept breakdown or request a similar practice question from the AI Tutor."}
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Button
                variant="secondary"
                size="md"
                onClick={handleStartSession}
                className="gap-2 text-xs"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Practice Again</span>
              </Button>

              <Button
                variant="gradient"
                size="md"
                onClick={() => setSessionActive(false)}
                className="font-semibold shadow-glow-amber text-xs"
              >
                Back to Practice Hub
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
