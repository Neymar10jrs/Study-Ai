import React, { useState, useEffect, useCallback } from 'react';
import {
  Play, RotateCcw, Zap, Timer, BookOpen, Brain, Target, Trophy,
  ChevronRight, Lightbulb, CheckCircle2, XCircle, AlertTriangle,
  BarChart2, ArrowRight, Clock, Flame, Star
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { cn } from '../../lib/utils';
import { INITIAL_SUBJECTS, PRACTICE_QUESTIONS } from '../../services/mockData';
const SUBJECTS = INITIAL_SUBJECTS;
import { PracticeQuestion, SubjectId, SubjectInfo } from '../../types';

type PracticeMode = 'daily' | 'adaptive' | 'exam' | 'revision';
type PageState = 'configure' | 'session' | 'complete';

interface SessionAnswer {
  questionId: string;
  selectedIndex: number;
  isCorrect: boolean;
  hintsUsed: number;
  timeMs: number;
}

interface PracticePageProps {
  initialSubjectId?: string;
  initialTopic?: string;
  onNavigateToTutor?: (query?: string) => void;
}

const MODE_CONFIG = {
  daily: { label: 'Daily Practice', icon: '📅', desc: '10 questions · Mixed difficulty · Build your streak', count: 10, color: 'emerald', timed: false },
  adaptive: { label: 'Adaptive Session', icon: '🧠', desc: '15 questions · AI-adjusts difficulty in real time', count: 15, color: 'blue', timed: false },
  exam: { label: 'Exam Mode', icon: '📝', desc: '30 questions · Timed · Simulates real exam conditions', count: 30, color: 'orange', timed: true },
  revision: { label: 'Revision Mode', icon: '🔁', desc: '12 questions · Focus on your weak areas', count: 12, color: 'purple', timed: false },
};

const HINT_XP_COST = [0, 5, 15];

function generateQuestions(subjectId: string, mode: PracticeMode, count: number): PracticeQuestion[] {
  const base = PRACTICE_QUESTIONS.filter(
    q => subjectId === 'all' || q.subjectId === subjectId
  );
  // Pad if needed with varied versions
  const pool: PracticeQuestion[] = [];
  while (pool.length < count) {
    pool.push(...base);
  }
  return pool.slice(0, count).map((q, i) => ({ ...q, id: `${q.id}_${i}` }));
}

export function PracticePage({ initialSubjectId, initialTopic, onNavigateToTutor }: PracticePageProps) {
  const [pageState, setPageState] = useState<PageState>('configure');
  const [selectedMode, setSelectedMode] = useState<PracticeMode>('adaptive');
  const [selectedSubject, setSelectedSubject] = useState<string>(initialSubjectId || 'mathematics');
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<SessionAnswer[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showHint, setShowHint] = useState('');
  const [xpEarned, setXpEarned] = useState(0);
  const [xpAnimation, setXpAnimation] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());

  // Exam timer
  const [timeLeft, setTimeLeft] = useState(1800);
  useEffect(() => {
    if (pageState === 'session' && selectedMode === 'exam') {
      const timer = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) { setPageState('complete'); return 0; }
          return t - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [pageState, selectedMode]);

  const handleStart = () => {
    const cfg = MODE_CONFIG[selectedMode];
    const qs = generateQuestions(selectedSubject, selectedMode, cfg.count);
    setQuestions(qs);
    setCurrentIdx(0);
    setAnswers([]);
    setSelectedOption(null);
    setIsAnswered(false);
    setHintsUsed(0);
    setShowHint('');
    setXpEarned(0);
    setTimeLeft(1800);
    setStartTime(Date.now());
    setPageState('session');
  };

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);
    const q = questions[currentIdx];
    const correct = idx === q.correctOptionIndex;
    const timeMs = Date.now() - startTime;
    const earned = correct ? Math.max(5, 10 - hintsUsed * 3) : 2;
    if (correct) {
      setXpEarned(prev => prev + earned);
      setXpAnimation(true);
      setTimeout(() => setXpAnimation(false), 1000);
    }
    setAnswers(prev => [...prev, { questionId: q.id, selectedIndex: idx, isCorrect: correct, hintsUsed, timeMs }]);
  };

  const handleNextQuestion = () => {
    const next = currentIdx + 1;
    if (next >= questions.length) {
      setPageState('complete');
    } else {
      setCurrentIdx(next);
      setSelectedOption(null);
      setIsAnswered(false);
      setHintsUsed(0);
      setShowHint('');
      setStartTime(Date.now());
    }
  };

  const handleHint = () => {
    const nextHint = hintsUsed + 1;
    if (nextHint > 3) return;
    const q = questions[currentIdx];
    const hints = [
      `💡 Think about: ${q.conceptTested}`,
      `🔍 Relevant formula/approach: Focus on ${q.topic} fundamentals from ${q.chapter}.`,
      `📝 Step starter: The answer relates to option ${q.correctOptionIndex + 1}. Work backwards if needed.`,
    ];
    setShowHint(hints[hintsUsed]);
    setHintsUsed(nextHint);
  };

  const correctCount = answers.filter(a => a.isCorrect).length;
  const accuracy = answers.length > 0 ? Math.round((correctCount / answers.length) * 100) : 0;
  const weakTopics = [...new Set(answers.filter(a => !a.isCorrect).map(a => questions.find(q => q.id === a.questionId)?.topic || '').filter(Boolean))];

  // =========== CONFIGURE SCREEN ===========
  if (pageState === 'configure') {
    return (
      <div className="min-h-screen bg-[#090a0f] py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <Badge variant="glow" className="text-xs">AI-Powered Practice</Badge>
            <h1 className="text-3xl font-extrabold text-white">Practice Session</h1>
            <p className="text-gray-400 text-sm">Choose your mode, subject, and start learning with instant AI feedback.</p>
          </div>

          {/* Mode Selection */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-gray-300 uppercase tracking-wider">Practice Mode</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(Object.entries(MODE_CONFIG) as [PracticeMode, typeof MODE_CONFIG['daily']][]).map(([mode, cfg]) => (
                <button
                  key={mode}
                  onClick={() => setSelectedMode(mode)}
                  className={cn(
                    'glass-panel border rounded-2xl p-4 text-left transition-all duration-200 hover:scale-[1.01]',
                    selectedMode === mode
                      ? 'border-orange-500/60 bg-orange-500/10'
                      : 'border-white/10 hover:border-white/20'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{cfg.icon}</span>
                    <div>
                      <div className="font-bold text-white text-sm">{cfg.label}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{cfg.desc}</div>
                    </div>
                    {selectedMode === mode && <CheckCircle2 className="h-4 w-4 text-orange-400 ml-auto shrink-0" />}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Subject Selection */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-gray-300 uppercase tracking-wider">Subject</h2>
            <div className="flex flex-wrap gap-2">
              {['all', ...SUBJECTS.slice(0, 8).map((s: SubjectInfo) => s.id)].map(subId => (
                <button
                  key={subId}
                  onClick={() => setSelectedSubject(subId)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-semibold border transition-all',
                    selectedSubject === subId
                      ? 'bg-orange-500/20 border-orange-500/50 text-orange-300'
                      : 'glass-panel border-white/10 text-gray-400 hover:border-white/25 hover:text-white'
                  )}
                >
                  {subId === 'all' ? '🌐 All Subjects' : SUBJECTS.find((s: SubjectInfo) => s.id === subId)?.name || subId}
                </button>
              ))}
            </div>
          </div>

          {/* Start Button */}
          <div className="flex justify-center">
            <Button
              variant="gradient"
              size="lg"
              onClick={handleStart}
              className="px-12 font-bold shadow-glow-amber"
            >
              <Play className="h-5 w-5 mr-2" />
              Start {MODE_CONFIG[selectedMode].label}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // =========== SESSION SCREEN ===========
  if (pageState === 'session' && questions.length > 0) {
    const q = questions[currentIdx];
    const progressPct = ((currentIdx) / questions.length) * 100;

    return (
      <div className="min-h-screen bg-[#090a0f] py-8 px-4">
        <div className="max-w-2xl mx-auto space-y-5">
          {/* Top bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="glow" className="text-xs">{MODE_CONFIG[selectedMode].label}</Badge>
              <span className="text-xs text-gray-400">Q {currentIdx + 1} of {questions.length}</span>
            </div>
            <div className="flex items-center gap-3">
              {/* XP earned */}
              <div className={cn('flex items-center gap-1 px-2 py-1 rounded-full border border-orange-500/30 bg-orange-500/10 transition-all', xpAnimation && 'scale-110 border-orange-400')}>
                <Zap className="h-3 w-3 text-orange-400" />
                <span className="text-xs font-bold text-orange-300">{xpEarned} XP</span>
              </div>
              {/* Timer */}
              {selectedMode === 'exam' && (
                <div className={cn('flex items-center gap-1 text-xs font-mono px-2 py-1 rounded-full border', timeLeft < 300 ? 'border-red-500/50 text-red-400 bg-red-500/10' : 'border-white/10 text-gray-300')}>
                  <Clock className="h-3 w-3" />
                  {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                </div>
              )}
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-300" style={{ width: `${progressPct}%` }} />
          </div>

          {/* Question card */}
          <div className="glass-panel border border-white/10 rounded-2xl p-6 space-y-5">
            <div className="flex items-start gap-2">
              <Badge variant="secondary" className="text-xs shrink-0 mt-0.5">{q.difficulty}</Badge>
              <p className="text-base font-semibold text-white leading-relaxed">{q.question}</p>
            </div>

            {/* Options */}
            <div className="space-y-2.5">
              {q.options.map((opt, i) => {
                let variant = 'default';
                if (isAnswered) {
                  if (i === q.correctOptionIndex) variant = 'correct';
                  else if (i === selectedOption) variant = 'wrong';
                }
                return (
                  <button
                    key={i}
                    onClick={() => handleSelectOption(i)}
                    disabled={isAnswered}
                    className={cn(
                      'w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-150',
                      !isAnswered && 'glass-panel border-white/10 text-gray-200 hover:border-orange-500/40 hover:bg-orange-500/5 cursor-pointer',
                      isAnswered && variant === 'correct' && 'bg-emerald-500/20 border-emerald-500/60 text-emerald-200',
                      isAnswered && variant === 'wrong' && 'bg-red-500/20 border-red-500/50 text-red-300',
                      isAnswered && variant === 'default' && 'glass-panel border-white/5 text-gray-500 opacity-60',
                    )}
                  >
                    <span className="mr-2 font-bold">{String.fromCharCode(65 + i)}.</span>
                    {opt}
                    {isAnswered && variant === 'correct' && <CheckCircle2 className="h-4 w-4 text-emerald-400 float-right mt-0.5" />}
                    {isAnswered && variant === 'wrong' && <XCircle className="h-4 w-4 text-red-400 float-right mt-0.5" />}
                  </button>
                );
              })}
            </div>

            {/* Hint section */}
            {!isAnswered && (
              <div className="space-y-2">
                {showHint && (
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3 text-sm text-amber-200">
                    {showHint}
                  </div>
                )}
                {hintsUsed < 3 && (
                  <button onClick={handleHint} className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 transition-colors">
                    <Lightbulb className="h-3.5 w-3.5" />
                    <span>Hint {hintsUsed + 1}/3{hintsUsed > 0 ? ` (−${HINT_XP_COST[hintsUsed]} XP)` : ' (free)'}</span>
                  </button>
                )}
              </div>
            )}

            {/* After answer: explanation + next */}
            {isAnswered && (
              <div className="space-y-3 border-t border-white/10 pt-3">
                <div className={cn('text-sm rounded-xl px-4 py-3', selectedOption === q.correctOptionIndex ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-200' : 'bg-red-500/10 border border-red-500/20 text-red-200')}>
                  <strong>{selectedOption === q.correctOptionIndex ? '✓ Correct! ' : '✗ Incorrect. '}</strong>
                  {q.explanation}
                </div>
                <Button variant="gradient" size="sm" onClick={handleNextQuestion} className="w-full font-semibold">
                  {currentIdx < questions.length - 1 ? 'Next Question' : 'See Results'}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // =========== COMPLETE SCREEN ===========
  const totalHints = answers.reduce((sum, a) => sum + a.hintsUsed, 0);
  const avgTimeMs = answers.length > 0 ? answers.reduce((sum, a) => sum + a.timeMs, 0) / answers.length : 0;

  return (
    <div className="min-h-screen bg-[#090a0f] py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="text-5xl">{accuracy >= 80 ? '🏆' : accuracy >= 60 ? '⭐' : '📚'}</div>
          <h1 className="text-2xl font-extrabold text-white">
            {accuracy >= 80 ? 'Excellent Work!' : accuracy >= 60 ? 'Good Effort!' : 'Keep Practicing!'}
          </h1>
          <p className="text-gray-400 text-sm">{MODE_CONFIG[selectedMode].label} Complete</p>
        </div>

        {/* Score circle + stats */}
        <div className="glass-panel border border-white/10 rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-around">
            {/* Circular score */}
            <div className="relative w-28 h-28">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                <circle
                  cx="50" cy="50" r="40" fill="none"
                  stroke={accuracy >= 80 ? '#10b981' : accuracy >= 60 ? '#f59e0b' : '#ef4444'}
                  strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={`${(accuracy / 100) * 251.2} 251.2`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-extrabold text-white">{accuracy}%</span>
                <span className="text-xs text-gray-400">Score</span>
              </div>
            </div>

            {/* Stats */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span className="text-sm text-gray-300">{correctCount} correct</span>
              </div>
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-400" />
                <span className="text-sm text-gray-300">{answers.length - correctCount} incorrect</span>
              </div>
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-amber-400" />
                <span className="text-sm text-gray-300">{totalHints} hints used</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-400" />
                <span className="text-sm text-gray-300">{Math.round(avgTimeMs / 1000)}s avg/question</span>
              </div>
            </div>
          </div>

          {/* XP earned */}
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-orange-400" />
              <span className="font-bold text-white">XP Earned</span>
            </div>
            <span className="text-xl font-extrabold text-orange-400">+{xpEarned}</span>
          </div>

          {/* Weak topics */}
          {weakTopics.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-amber-400 text-sm font-semibold">
                <AlertTriangle className="h-4 w-4" />
                Weak Topics Detected
              </div>
              <div className="flex flex-wrap gap-2">
                {weakTopics.map(t => (
                  <Badge key={t} variant="warning" className="text-xs">{t}</Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Button variant="secondary" onClick={handleStart} className="gap-2">
            <RotateCcw className="h-4 w-4" /> Try Again
          </Button>
          {weakTopics.length > 0 && (
            <Button variant="outline" onClick={() => { setSelectedMode('revision'); handleStart(); }} className="gap-2">
              <Target className="h-4 w-4" /> Revise Weak Topics
            </Button>
          )}
          {onNavigateToTutor && (
            <Button variant="gradient" onClick={() => onNavigateToTutor()} className="gap-2">
              <Brain className="h-4 w-4" /> Ask AI Tutor
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
