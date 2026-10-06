import React, { useState, useEffect } from 'react';
import {
  Play, RotateCcw, Zap, Timer, BookOpen, Brain, Target, Trophy,
  ChevronRight, Lightbulb, CheckCircle2, XCircle, AlertTriangle,
  BarChart2, ArrowRight, Clock, Flame, Star, Sparkles, HelpCircle,
  ChevronDown, ChevronUp, RefreshCw, Wand2, Layers, ArrowLeft
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { cn } from '../../lib/utils';
import { INITIAL_SUBJECTS } from '../../services/mockData';
const SUBJECTS = INITIAL_SUBJECTS;
import { PracticeQuestion, SubjectInfo } from '../../types';
import { generateQuestionsAPI, normalizeQuestionText } from '../../services/questionApiService';
import { FormattedContent } from '../tutor/MathRenderer';
import { getSubjectTopics, getSubjectName } from '../../data/syllabus';

type PracticeMode = 'daily' | 'adaptive' | 'exam' | 'revision';
type PageState = 'configure' | 'session' | 'complete';
type DifficultyLevel = 'Easy' | 'Medium' | 'Hard' | 'Exam Level';

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
  exam: { label: 'Exam Mode', icon: '📝', desc: '30 questions · Timed · Real exam simulation', count: 30, color: 'orange', timed: true },
  revision: { label: 'Revision Mode', icon: '🔁', desc: '12 questions · Focus on your weak areas', count: 12, color: 'purple', timed: false },
};

const HINT_XP_COST = [0, 5, 15];

export function PracticePage({ initialSubjectId, initialTopic, onNavigateToTutor }: PracticePageProps) {
  const [pageState, setPageState] = useState<PageState>('configure');
  const [selectedMode, setSelectedMode] = useState<PracticeMode>('adaptive');
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>('Medium');
  
  // Subject & Topic state
  const [selectedSubject, setSelectedSubject] = useState<string>(initialSubjectId || 'physics');
  const [selectedTopics, setSelectedTopics] = useState<string[]>(() => {
    if (initialTopic) return [initialTopic];
    const initialList = getSubjectTopics(initialSubjectId || 'physics');
    return [initialList[0] || 'All Topics'];
  });

  // Session-level seen questions to prevent repeating across sets
  const [seenQuestionTexts, setSeenQuestionTexts] = useState<string[]>([]);

  // Loading & Error states
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Active question session state
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
  const [showStepDetails, setShowStepDetails] = useState(false);

  // Synchronize state with props when navigating from other pages
  useEffect(() => {
    if (initialSubjectId) {
      setSelectedSubject(initialSubjectId);
      const subjectTopics = getSubjectTopics(initialSubjectId);
      if (initialTopic && subjectTopics.includes(initialTopic)) {
        setSelectedTopics([initialTopic]);
      } else {
        setSelectedTopics([subjectTopics[0] || 'All Topics']);
      }
      setQuestions([]);
      setErrorMessage(null);
      setSeenQuestionTexts([]);
    }
  }, [initialSubjectId, initialTopic]);

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

  // Available topics for selected subject
  const availableTopics = React.useMemo(() => {
    const list = getSubjectTopics(selectedSubject);
    return ['All Topics', ...list];
  }, [selectedSubject]);

  // Handle switching subjects: reset selected topics to the new subject's first topic and clear previous questions
  const handleSelectSubject = (subId: string) => {
    if (subId === selectedSubject) return;
    setSelectedSubject(subId);
    const subjectTopics = getSubjectTopics(subId);
    setSelectedTopics([subjectTopics[0] || 'All Topics']);
    setQuestions([]);
    setErrorMessage(null);
    setSeenQuestionTexts([]); // Reset seen questions on subject change
  };

  // Handle multi-select or single-select topic chips
  const handleToggleTopic = (topic: string) => {
    if (topic === 'All Topics') {
      setSelectedTopics(['All Topics']);
      return;
    }

    let next = selectedTopics.filter(t => t !== 'All Topics');
    if (next.includes(topic)) {
      next = next.filter(t => t !== topic);
      // If user unchecks all topics, keep it empty (button will be disabled)
    } else {
      next = [...next, topic];
    }

    setSelectedTopics(next);
  };

  const handleStart = async (overrideMode?: PracticeMode) => {
    if (!selectedSubject || selectedTopics.length === 0) return;

    const modeToUse = overrideMode || selectedMode;
    setIsGenerating(true);
    setErrorMessage(null);
    setQuestions([]); // Clear old questions immediately

    const cfg = MODE_CONFIG[modeToUse];
    try {
      const qs = await generateQuestionsAPI({
        subjectId: selectedSubject,
        topics: selectedTopics,
        topic: selectedTopics[0],
        difficulty: selectedDifficulty,
        count: cfg.count,
        mode: modeToUse,
        useAI: true,
        seenQuestions: seenQuestionTexts
      });

      if (!qs || qs.length === 0) {
        throw new Error(`No questions could be generated for ${getSubjectName(selectedSubject)} > ${selectedTopics.join(', ')}. Please try another topic.`);
      }

      // Safety check: verify no duplicates exist in returned set and warn in console
      const seenInThisBatch = new Set<string>();
      const duplicatesFound: string[] = [];
      qs.forEach((q, idx) => {
        const norm = normalizeQuestionText(q.question);
        if (seenInThisBatch.has(norm)) {
          duplicatesFound.push(q.question);
          console.warn(`[StudyAI] Duplicate detected at index ${idx}: "${q.question}"`);
        } else {
          seenInThisBatch.add(norm);
        }
      });
      if (duplicatesFound.length > 0) {
        console.warn(`[StudyAI] Warning: ${duplicatesFound.length} duplicates detected in generated set!`, duplicatesFound);
      }

      // Update seen questions in session state so subsequent clicks never repeat them
      setSeenQuestionTexts(prev => [
        ...prev,
        ...qs.map(q => normalizeQuestionText(q.question))
      ]);

      setQuestions(qs);
      setCurrentIdx(0);
      setAnswers([]);
      setSelectedOption(null);
      setIsAnswered(false);
      setHintsUsed(0);
      setShowHint('');
      setXpEarned(0);
      setTimeLeft(modeToUse === 'exam' ? 1800 : 0);
      setStartTime(Date.now());
      setShowStepDetails(false);
      setPageState('session');
    } catch (err: any) {
      console.error('Question generation failed:', err);
      setErrorMessage(err?.message || 'Failed to generate questions. Please check your connection and retry.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);
    setShowStepDetails(true);

    const q = questions[currentIdx];
    const correct = idx === q.correctOptionIndex;
    const timeMs = Date.now() - startTime;
    const earned = correct ? Math.max(5, 10 - hintsUsed * 3) : 2;

    if (correct) {
      setXpEarned(prev => prev + earned);
      setXpAnimation(true);
      setTimeout(() => setXpAnimation(false), 1000);
    }

    setAnswers(prev => [
      ...prev,
      { questionId: q.id, selectedIndex: idx, isCorrect: correct, hintsUsed, timeMs }
    ]);
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
      setShowStepDetails(false);
      setStartTime(Date.now());
    }
  };

  const handleHint = () => {
    const nextHint = hintsUsed + 1;
    if (nextHint > 3) return;
    const q = questions[currentIdx];
    const hints = [
      `💡 Think about: ${q.conceptTested}`,
      `🔍 Relevant approach: Focus on the fundamental rules of ${q.topic} in ${getSubjectName(q.subjectId)}.`,
      `📝 Step starter: Consider known quantities and elimination. Check units and boundaries.`,
    ];
    setShowHint(hints[hintsUsed]);
    setHintsUsed(nextHint);
  };

  const handleAskTutorAboutMistake = (q: PracticeQuestion, chosenIdx: number) => {
    if (!onNavigateToTutor) return;
    const wrongText = q.options[chosenIdx] || `Option ${String.fromCharCode(65 + chosenIdx)}`;
    const rightText = q.options[q.correctOptionIndex] || `Option ${String.fromCharCode(65 + q.correctOptionIndex)}`;
    const query = `In ${getSubjectName(q.subjectId)} (${q.topic}), for the question: "${q.question}", I mistakenly selected "${wrongText}" instead of the correct answer "${rightText}". Can you explain my mistake simply and teach me how to avoid it?`;
    onNavigateToTutor(query);
  };

  const correctCount = answers.filter(a => a.isCorrect).length;
  const accuracy = answers.length > 0 ? Math.round((correctCount / answers.length) * 100) : 0;
  const weakTopics = [...new Set(answers.filter(a => !a.isCorrect).map(a => questions.find(q => q.id === a.questionId)?.topic || '').filter(Boolean))];

  // ==========================================
  // 1. CONFIGURE SCREEN (Subject -> Topic -> Practice)
  // ==========================================
  if (pageState === 'configure') {
    const isTopicSelected = selectedTopics.length > 0;
    const currentSubjectName = getSubjectName(selectedSubject);

    return (
      <div className="min-h-screen bg-[#090a0f] py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
          {/* Header */}
          <div className="text-center space-y-2">
            <Badge variant="glow" className="text-xs">
              ✨ Practice & Diagnostic System
            </Badge>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Subject & Topic Practice
            </h1>
            <p className="text-gray-400 text-sm max-w-xl mx-auto">
              Select your subject and target chapter. Every generated question strictly matches your chosen syllabus.
            </p>
          </div>

          {/* Error Banner with Retry */}
          {errorMessage && (
            <div className="bg-red-500/15 border border-red-500/30 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fadeIn">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-red-400 shrink-0" />
                <div>
                  <div className="text-sm font-bold text-red-200">Question Generation Error</div>
                  <div className="text-xs text-red-300/90 mt-0.5">{errorMessage}</div>
                </div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleStart()}
                className="shrink-0 text-xs font-semibold bg-red-500/20 text-red-200 border-red-500/40 hover:bg-red-500/30"
              >
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                Retry
              </Button>
            </div>
          )}

          {/* STEP 1: CHOOSE SUBJECT */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center text-[11px] font-bold">1</span>
                <span>Select Subject</span>
              </h2>
              <span className="text-xs text-orange-400 font-semibold">{currentSubjectName}</span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {SUBJECTS.map((s: SubjectInfo) => {
                const isSelected = selectedSubject === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => handleSelectSubject(s.id)}
                    className={cn(
                      'px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all duration-150 flex items-center gap-2',
                      isSelected
                        ? 'bg-orange-500/25 border-orange-500/80 text-orange-200 shadow-glow-sm font-bold'
                        : 'glass-panel border-white/10 text-gray-400 hover:border-white/25 hover:text-white'
                    )}
                  >
                    <span>{s.name}</span>
                    {isSelected && <CheckCircle2 className="h-3.5 w-3.5 text-orange-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 2: CHOOSE TOPIC / CHAPTER */}
          <div className="space-y-3 glass-panel border border-orange-500/20 rounded-2xl p-5 bg-gradient-to-br from-orange-500/5 to-transparent">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center text-[11px] font-bold">2</span>
                <span>Choose Topic / Chapter in {currentSubjectName}</span>
              </h2>
              <span className="text-[11px] text-gray-400">
                {selectedTopics.length === 0 ? (
                  <span className="text-red-400 font-medium">Select at least 1 topic</span>
                ) : (
                  `${selectedTopics.length} selected`
                )}
              </span>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {availableTopics.map(topic => {
                const isSelected = selectedTopics.includes(topic);
                return (
                  <button
                    key={topic}
                    onClick={() => handleToggleTopic(topic)}
                    className={cn(
                      'px-3.5 py-2 rounded-xl text-xs font-medium border transition-all duration-150 flex items-center gap-1.5',
                      isSelected
                        ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-black font-bold border-orange-400 shadow-glow-sm scale-[1.02]'
                        : 'bg-black/40 border-white/10 text-gray-300 hover:border-orange-500/40 hover:text-white'
                    )}
                  >
                    <span>{topic}</span>
                    {isSelected && <CheckCircle2 className="h-3.5 w-3.5 text-black" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 3: PRACTICE MODE & DIFFICULTY */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center text-[11px] font-bold">3</span>
                <span>Practice Mode & Difficulty</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(Object.entries(MODE_CONFIG) as [PracticeMode, typeof MODE_CONFIG['daily']][]).map(([mode, cfg]) => (
                <button
                  key={mode}
                  onClick={() => setSelectedMode(mode)}
                  className={cn(
                    'glass-panel border rounded-2xl p-4 text-left transition-all duration-150',
                    selectedMode === mode
                      ? 'border-orange-500/70 bg-orange-500/10 shadow-glow-sm'
                      : 'border-white/10 hover:border-white/20'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{cfg.icon}</span>
                    <div className="flex-1">
                      <div className="font-bold text-white text-sm flex items-center justify-between">
                        <span>{cfg.label}</span>
                        {selectedMode === mode && <CheckCircle2 className="h-4 w-4 text-orange-400 shrink-0" />}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">{cfg.desc}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Difficulty Pills */}
            <div className="flex items-center gap-2 pt-2">
              <span className="text-xs text-gray-400 font-semibold mr-1">Difficulty:</span>
              {(['Easy', 'Medium', 'Hard', 'Exam Level'] as DifficultyLevel[]).map(lvl => (
                <button
                  key={lvl}
                  onClick={() => setSelectedDifficulty(lvl)}
                  className={cn(
                    'px-3 py-1 rounded-lg text-xs font-medium border transition-colors',
                    selectedDifficulty === lvl
                      ? 'bg-orange-500/20 border-orange-500/60 text-orange-300 font-bold'
                      : 'border-white/10 text-gray-400 hover:text-white'
                  )}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* START BUTTON (Disabled if no topic chosen or generating) */}
          <div className="flex flex-col items-center gap-3 pt-3">
            <Button
              variant="gradient"
              size="lg"
              disabled={!isTopicSelected || isGenerating}
              onClick={() => handleStart()}
              className={cn(
                'px-14 py-3 font-extrabold text-sm shadow-glow-amber transition-all duration-200',
                !isTopicSelected && 'opacity-40 cursor-not-allowed hover:scale-100'
              )}
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Generating {currentSubjectName} Questions...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Start Practice ({currentSubjectName} &gt; {selectedTopics.join(', ')})
                </>
              )}
            </Button>

            {!isTopicSelected && (
              <span className="text-xs text-amber-400 font-medium">
                ⚠️ Please select at least one topic above to enable practice.
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // 2. ACTIVE PRACTICE SESSION SCREEN
  // ==========================================
  if (pageState === 'session' && questions.length > 0) {
    const q = questions[currentIdx];
    const progressPct = ((currentIdx + 1) / questions.length) * 100;
    const isUserCorrect = selectedOption === q.correctOptionIndex;
    const currentSubjectName = getSubjectName(q.subjectId);

    return (
      <div className="min-h-screen bg-[#090a0f] py-8 px-4">
        <div className="max-w-3xl mx-auto space-y-4 animate-fadeIn">
          
          {/* BREADCRUMB: Subject > Topic with CHANGE button & GENERATE AGAIN */}
          <div className="flex items-center justify-between text-xs py-2 px-3.5 rounded-xl bg-white/[0.04] border border-white/10 backdrop-blur-md">
            <div className="flex items-center gap-2 text-gray-300 font-medium overflow-hidden">
              <span className="text-orange-400 font-bold">{currentSubjectName}</span>
              <span className="text-gray-500 font-bold">&gt;</span>
              <span className="text-amber-200 truncate">{selectedTopics.join(', ')}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleStart()}
                disabled={isGenerating}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-amber-300 hover:text-white bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all"
                title="Generate another set of questions"
              >
                <RefreshCw className={cn("h-3 w-3", isGenerating && "animate-spin")} />
                <span>Generate again</span>
              </button>
              <button
                onClick={() => setPageState('configure')}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-orange-300 hover:text-white bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 transition-all"
                title="Change subject or topic"
              >
                <ArrowLeft className="h-3 w-3" />
                <span>Change</span>
              </button>
            </div>
          </div>

          {/* Top Status Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="glow" className="text-xs">
                {MODE_CONFIG[selectedMode].label}
              </Badge>
              <span className="text-xs text-gray-400 font-medium">
                Question {currentIdx + 1} of {questions.length}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* XP Live Counter */}
              <div className={cn(
                'flex items-center gap-1.5 px-3 py-1 rounded-full border border-orange-500/30 bg-orange-500/10 transition-transform duration-300',
                xpAnimation && 'scale-110 border-orange-400 bg-orange-500/20'
              )}>
                <Zap className="h-3.5 w-3.5 text-orange-400" />
                <span className="text-xs font-bold text-orange-300">{xpEarned} XP</span>
              </div>

              {/* Timer for Exam Mode */}
              {selectedMode === 'exam' && (
                <div className={cn(
                  'flex items-center gap-1 text-xs font-mono px-2.5 py-1 rounded-full border',
                  timeLeft < 300
                    ? 'border-red-500/50 text-red-400 bg-red-500/10 animate-pulse'
                    : 'border-white/10 text-gray-300'
                )}>
                  <Clock className="h-3.5 w-3.5" />
                  {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                </div>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
            <div
              className="h-full bg-gradient-to-r from-orange-500 via-amber-400 to-yellow-400 transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          {/* Main Question Card */}
          <div key={q.id} className="glass-panel border border-white/10 rounded-2xl p-6 sm:p-7 space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span className="font-semibold text-orange-400 uppercase tracking-wide">
                  {q.chapter} · {q.topic}
                </span>
                <Badge variant="secondary" className="text-[10px]">
                  {q.difficulty}
                </Badge>
              </div>

              {/* Question Statement with LaTeX / Code support */}
              <div className="text-base sm:text-lg font-semibold text-white leading-relaxed">
                <FormattedContent text={q.question} />
              </div>
            </div>

            {/* MCQ Options List */}
            <div className="space-y-3">
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
                      'w-full text-left px-4 py-3.5 rounded-xl border text-sm font-medium transition-all duration-150 relative flex items-center justify-between',
                      !isAnswered && 'glass-panel border-white/10 text-gray-200 hover:border-orange-500/50 hover:bg-orange-500/10 cursor-pointer',
                      isAnswered && variant === 'correct' && 'bg-emerald-500/20 border-emerald-500/70 text-emerald-100 font-semibold shadow-glow-sm',
                      isAnswered && variant === 'wrong' && 'bg-red-500/20 border-red-500/70 text-red-200 font-semibold',
                      isAnswered && variant === 'default' && 'glass-panel border-white/5 text-gray-500 opacity-50 cursor-default'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className={cn(
                        'w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold border shrink-0',
                        variant === 'correct' ? 'bg-emerald-500 text-black border-emerald-400' :
                        variant === 'wrong' ? 'bg-red-500 text-white border-red-400' :
                        'bg-white/5 border-white/10 text-gray-400'
                      )}>
                        {String.fromCharCode(65 + i)}
                      </span>
                      <div className="leading-snug">
                        <FormattedContent text={opt} />
                      </div>
                    </div>

                    {isAnswered && variant === 'correct' && (
                      <span className="flex items-center gap-1 text-xs text-emerald-400 font-bold ml-2 shrink-0">
                        <CheckCircle2 className="h-4 w-4" /> Correct Answer
                      </span>
                    )}
                    {isAnswered && variant === 'wrong' && (
                      <span className="flex items-center gap-1 text-xs text-red-400 font-bold ml-2 shrink-0">
                        <XCircle className="h-4 w-4" /> Your Choice
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Hint Box (Before Answering) */}
            {!isAnswered && (
              <div className="space-y-2 pt-1 border-t border-white/5">
                {showHint && (
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3 text-xs sm:text-sm text-amber-200 flex items-start gap-2.5 animate-fadeIn">
                    <Lightbulb className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <FormattedContent text={showHint} />
                    </div>
                  </div>
                )}
                {hintsUsed < 3 && (
                  <button
                    onClick={handleHint}
                    className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-medium transition-colors"
                  >
                    <Lightbulb className="h-3.5 w-3.5" />
                    <span>
                      Need a hint? ({hintsUsed + 1}/3)
                      {hintsUsed > 0 ? ` [−${HINT_XP_COST[hintsUsed]} XP]` : ' (Free)'}
                    </span>
                  </button>
                )}
              </div>
            )}

            {/* ======================================================== */}
            {/* IN-DEPTH PEDAGOGICAL EXPLANATION WHEN ANSWER IS SELECTED */}
            {/* ======================================================== */}
            {isAnswered && selectedOption !== null && (
              <div className="space-y-4 pt-4 border-t border-white/10 animate-fadeIn">
                {/* STATUS HEADER */}
                <div className={cn(
                  'rounded-2xl p-4 sm:p-5 border space-y-3',
                  !isUserCorrect
                    ? 'bg-red-500/10 border-red-500/30'
                    : 'bg-emerald-500/10 border-emerald-500/30'
                )}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      {!isUserCorrect ? (
                        <>
                          <XCircle className="h-5 w-5 text-red-400 shrink-0" />
                          <h3 className="text-base font-bold text-red-200">
                            Incorrect Selection — Let's review the concept
                          </h3>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                          <h3 className="text-base font-bold text-emerald-200">
                            Excellent! You got it right! 🎉
                          </h3>
                        </>
                      )}
                    </div>
                  </div>

                  {/* SPECIFIC MISCONCEPTION ANALYSIS IF WRONG */}
                  {!isUserCorrect && (
                    <div className="bg-black/40 border border-red-500/20 rounded-xl p-3.5 space-y-2 text-xs sm:text-sm text-gray-200">
                      <div className="flex items-center gap-1.5 text-red-400 font-bold">
                        <AlertTriangle className="h-4 w-4" />
                        <span>Why Your Choice ({String.fromCharCode(65 + selectedOption)}) Was Incorrect:</span>
                      </div>
                      <div className="text-gray-300 leading-relaxed">
                        {q.wrongOptionExplanations?.[selectedOption] ? (
                          <FormattedContent text={q.wrongOptionExplanations[selectedOption]} />
                        ) : (
                          q.commonPitfall ? (
                            <FormattedContent text={`Common Pitfall: ${q.commonPitfall}`} />
                          ) : (
                            `You chose ${String.fromCharCode(65 + selectedOption)}. Review the correct theorem below to understand why option ${String.fromCharCode(65 + q.correctOptionIndex)} is the right answer.`
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* WHY THE RIGHT ANSWER IS CORRECT */}
                  <div className="bg-black/40 border border-emerald-500/20 rounded-xl p-3.5 space-y-2 text-xs sm:text-sm text-gray-200">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Why Option {String.fromCharCode(65 + q.correctOptionIndex)} is Correct:</span>
                    </div>
                    <div className="text-gray-300 leading-relaxed">
                      <FormattedContent text={q.whyCorrect || q.explanation} />
                    </div>
                  </div>

                  {/* KEY RULE TO REMEMBER */}
                  {(q.keyRule || q.solution?.keyTakeaway) && (
                    <div className="flex items-start gap-2 text-xs bg-amber-500/10 border border-amber-500/20 rounded-lg p-2.5 text-amber-200">
                      <Sparkles className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <strong>Key Rule to Remember: </strong>
                        <FormattedContent text={q.keyRule || q.solution.keyTakeaway} />
                      </div>
                    </div>
                  )}

                  {/* STEP-BY-STEP DERIVATION */}
                  {q.solution?.steps && q.solution.steps.length > 0 && (
                    <div className="pt-1">
                      <button
                        onClick={() => setShowStepDetails(!showStepDetails)}
                        className="text-xs text-orange-400 hover:text-orange-300 font-semibold flex items-center gap-1 transition-colors"
                      >
                        {showStepDetails ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                        <span>{showStepDetails ? 'Hide' : 'View'} Step-by-Step Derivation ({q.solution.steps.length} steps)</span>
                      </button>

                      {showStepDetails && (
                        <div className="mt-2.5 space-y-2 bg-black/50 border border-white/10 rounded-xl p-3 text-xs text-gray-300 animate-fadeIn">
                          {q.solution.steps.map((step, sIdx) => (
                            <div key={sIdx} className="space-y-1 border-b border-white/5 last:border-0 pb-2 last:pb-0">
                              <div className="font-bold text-orange-300">
                                Step {sIdx + 1}: {step.title}
                              </div>
                              <FormattedContent text={step.detail} />
                              {step.mathExpression && (
                                <div className="py-1 text-center font-mono text-amber-300">
                                  <FormattedContent text={`$$${step.mathExpression}$$`} />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* BOTTOM ACTION BUTTONS */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  {!isUserCorrect && onNavigateToTutor && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleAskTutorAboutMistake(q, selectedOption)}
                      className="w-full sm:w-auto text-xs font-semibold gap-1.5 border border-orange-500/30 text-orange-300 hover:bg-orange-500/10"
                    >
                      <Brain className="h-4 w-4 text-orange-400" />
                      <span>Ask AI Tutor: Explain My Mistake</span>
                    </Button>
                  )}

                  <Button
                    variant="gradient"
                    size="md"
                    onClick={handleNextQuestion}
                    className="w-full sm:w-auto sm:ml-auto font-bold text-xs gap-1.5 shadow-glow-amber px-6"
                  >
                    <span>{currentIdx < questions.length - 1 ? 'Next Question' : 'View Comprehensive Results'}</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // 3. COMPLETION SCREEN
  // ==========================================
  const totalHints = answers.reduce((sum, a) => sum + a.hintsUsed, 0);
  const avgTimeMs = answers.length > 0 ? answers.reduce((sum, a) => sum + a.timeMs, 0) / answers.length : 0;

  return (
    <div className="min-h-screen bg-[#090a0f] py-8 px-4 animate-fadeIn">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="text-5xl">{accuracy >= 80 ? '🏆' : accuracy >= 60 ? '⭐' : '📚'}</div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            {accuracy >= 80 ? 'Mastery Unlocked!' : accuracy >= 60 ? 'Good Effort!' : 'Practice Makes Perfect!'}
          </h1>
          <p className="text-gray-400 text-sm">
            {getSubjectName(selectedSubject)} ({selectedTopics.join(', ')}) Complete!
          </p>
        </div>

        {/* Score & Diagnostic Breakdown */}
        <div className="glass-panel border border-white/10 rounded-2xl p-6 sm:p-7 space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-around gap-6">
            {/* Circular Score Gauge */}
            <div className="relative w-28 h-28 shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                <circle
                  cx="50" cy="50" r="40" fill="none"
                  stroke={accuracy >= 80 ? '#10b981' : accuracy >= 60 ? '#f59e0b' : '#ef4444'}
                  strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={`${(accuracy / 100) * 251.2} 251.2`}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-extrabold text-white">{accuracy}%</span>
                <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Accuracy</span>
              </div>
            </div>

            {/* Stat Counters */}
            <div className="grid grid-cols-2 gap-3 w-full sm:w-auto">
              <div className="glass-panel border border-emerald-500/20 rounded-xl p-3 text-center">
                <div className="flex items-center justify-center gap-1 text-emerald-400 text-sm font-bold">
                  <CheckCircle2 className="h-4 w-4" /> {correctCount}
                </div>
                <div className="text-[11px] text-gray-400">Correct</div>
              </div>

              <div className="glass-panel border border-red-500/20 rounded-xl p-3 text-center">
                <div className="flex items-center justify-center gap-1 text-red-400 text-sm font-bold">
                  <XCircle className="h-4 w-4" /> {answers.length - correctCount}
                </div>
                <div className="text-[11px] text-gray-400">Incorrect</div>
              </div>

              <div className="glass-panel border border-amber-500/20 rounded-xl p-3 text-center">
                <div className="flex items-center justify-center gap-1 text-amber-400 text-sm font-bold">
                  <Lightbulb className="h-4 w-4" /> {totalHints}
                </div>
                <div className="text-[11px] text-gray-400">Hints Used</div>
              </div>

              <div className="glass-panel border border-blue-500/20 rounded-xl p-3 text-center">
                <div className="flex items-center justify-center gap-1 text-blue-400 text-sm font-bold">
                  <Clock className="h-4 w-4" /> {Math.round(avgTimeMs / 1000)}s
                </div>
                <div className="text-[11px] text-gray-400">Avg Pace</div>
              </div>
            </div>
          </div>

          {/* XP Rewards Banner */}
          <div className="bg-gradient-to-r from-orange-500/20 via-amber-500/20 to-yellow-500/10 border border-orange-500/40 rounded-xl px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-orange-400" />
              <div>
                <div className="font-bold text-white text-sm">Session XP Earned</div>
                <div className="text-[11px] text-gray-400">Recorded to your persistent profile</div>
              </div>
            </div>
            <span className="text-xl font-extrabold text-orange-400">+{xpEarned} XP</span>
          </div>

          {/* Diagnostic: Focus Topics */}
          {weakTopics.length > 0 && (
            <div className="space-y-2 border-t border-white/10 pt-4">
              <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold uppercase tracking-wider">
                <AlertTriangle className="h-4 w-4" />
                <span>Identified Focus Topics for Revision:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {weakTopics.map(t => (
                  <Badge key={t} variant="warning" className="text-xs py-1 px-2.5">
                    {t}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <Button
            variant="gradient"
            onClick={() => handleStart()}
            disabled={isGenerating}
            className="gap-2 text-xs font-bold shadow-glow-amber"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", isGenerating && "animate-spin")} />
            <span>Generate again</span>
          </Button>

          <Button
            variant="secondary"
            onClick={() => setPageState('configure')}
            className="gap-2 text-xs font-semibold"
          >
            <RotateCcw className="h-4 w-4" /> Configure New
          </Button>

          {weakTopics.length > 0 && (
            <Button
              variant="outline"
              onClick={() => {
                setSelectedMode('revision');
                handleStart('revision');
              }}
              className="gap-2 text-xs font-semibold text-orange-300 border-orange-500/40 hover:bg-orange-500/10"
            >
              <Target className="h-4 w-4" /> Revise Weak Topics
            </Button>
          )}

          {onNavigateToTutor && (
            <Button
              variant="secondary"
              onClick={() => onNavigateToTutor(`I just completed practice for ${getSubjectName(selectedSubject)} (${selectedTopics.join(', ')}). Help me review my mistakes.`)}
              className="gap-2 text-xs font-semibold border border-white/10 text-gray-200"
            >
              <Brain className="h-4 w-4 text-orange-400" /> Ask AI Tutor
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
