import React, { useState } from 'react';
import {
  Brain, Wand2, Calendar, ChevronRight, RotateCcw, X, CheckCircle2,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { cn } from '../../lib/utils';

interface Tool {
  id: string;
  icon: string;
  name: string;
  desc: string;
  color: string;
  tag: string;
  action: string;
}

const TOOLS: Tool[] = [
  { id: 'notes', icon: '📝', name: 'AI Notes Generator', desc: 'Generate structured, comprehensive notes on any topic in seconds. Includes key points, formulas, and examples.', color: 'orange', tag: 'Popular', action: 'notes' },
  { id: 'quiz', icon: '🎯', name: 'AI Quiz Generator', desc: 'Create custom MCQ quizzes on any topic, chapter, or difficulty level. Instant feedback.', color: 'blue', tag: '', action: 'quiz' },
  { id: 'flashcards', icon: '🃏', name: 'Smart Flashcards', desc: 'Spaced repetition flashcards for formulas, definitions, reactions, and concepts.', color: 'purple', tag: 'Trending', action: 'flashcards' },
  { id: 'summarizer', icon: '✨', name: 'AI Summarizer', desc: 'Paste any chapter or text. Get a clear, concise summary with key concepts highlighted.', color: 'emerald', tag: '', action: 'summarize' },
  { id: 'eli5', icon: '🧒', name: 'Explain Simply', desc: "Complex topics explained like you're 12. Perfect for first-time understanding of hard concepts.", color: 'amber', tag: '', action: 'eli5' },
  { id: 'exam', icon: '📋', name: 'Exam Mode Simulator', desc: 'Timed exam simulation with 30 questions. Mimics real exam pressure and navigation.', color: 'red', tag: '', action: 'exam' },
  { id: 'homework', icon: '🏠', name: 'Homework Helper', desc: 'Upload or type your homework. Get step-by-step guidance without just giving you the answer.', color: 'teal', tag: '', action: 'homework' },
  { id: 'code', icon: '💻', name: 'Code Practice', desc: 'Interactive coding challenges with syntax-highlighted editor. Supports Python, JS, Java, C++.', color: 'cyan', tag: 'New', action: 'code' },
  { id: 'mindmap', icon: '🗺️', name: 'Mind Map Creator', desc: 'Turn any topic into a visual mind map. Great for memorization and understanding connections.', color: 'pink', tag: 'New', action: 'mindmap' },
];

interface Flashcard {
  front: string;
  back: string;
  subject: string;
}

const SAMPLE_FLASHCARDS: Flashcard[] = [
  { front: "What is Newton's Second Law?", back: "F = ma\n\nForce = Mass × Acceleration. The acceleration of an object is directly proportional to the net force acting on it.", subject: 'Physics' },
  { front: "What is the quadratic formula?", back: "x = (−b ± √(b²−4ac)) / 2a\n\nUsed to solve ax² + bx + c = 0 when factoring is not possible.", subject: 'Mathematics' },
  { front: "What is DNA?", back: "Deoxyribonucleic Acid — a double helix molecule that carries genetic information. Made of nucleotides (A, T, G, C).", subject: 'Biology' },
  { front: "What is Ohm's Law?", back: "V = IR\n\nVoltage = Current × Resistance. The current through a conductor is proportional to the voltage across it.", subject: 'Physics' },
  { front: "What is the Ideal Gas Law?", back: "PV = nRT\n\nP = Pressure, V = Volume, n = moles, R = gas constant, T = Temperature (Kelvin)", subject: 'Chemistry' },
];

interface PlanDay {
  day: string;
  tasks: string[];
}

const SAMPLE_PLAN: PlanDay[] = [
  { day: 'Monday', tasks: ['Calculus — Integration by Parts (30 min)', 'Physics — Electromagnetic Induction (20 min)', 'Practice: 10 Mixed Questions (15 min)'] },
  { day: 'Tuesday', tasks: ['Chemistry — Organic Reactions (25 min)', 'Revision: Physics Weak Topics (20 min)', 'Quiz: Chemistry Chapter 4 (15 min)'] },
  { day: 'Wednesday', tasks: ['Mathematics — Complex Numbers (30 min)', 'Flashcards Review — All Subjects (15 min)', 'Practice: 10 Math Problems (15 min)'] },
  { day: 'Thursday', tasks: ['Physics — Optics (30 min)', 'Chemistry — Thermodynamics (25 min)', 'Mock Test: 30 Questions (45 min)'] },
  { day: 'Friday', tasks: ['Full Revision: Weak Topics (40 min)', 'Practice: 20 Mixed Questions (30 min)', 'AI Tutor: Ask Doubts (20 min)'] },
];

const COLOR_MAP: Record<string, { bg: string; ring: string; text: string }> = {
  orange: { bg: 'from-orange-500/15', ring: 'border-orange-500/40', text: 'text-orange-400' },
  blue: { bg: 'from-blue-500/15', ring: 'border-blue-500/40', text: 'text-blue-400' },
  purple: { bg: 'from-purple-500/15', ring: 'border-purple-500/40', text: 'text-purple-400' },
  emerald: { bg: 'from-emerald-500/15', ring: 'border-emerald-500/40', text: 'text-emerald-400' },
  amber: { bg: 'from-amber-500/15', ring: 'border-amber-500/40', text: 'text-amber-400' },
  red: { bg: 'from-red-500/15', ring: 'border-red-500/40', text: 'text-red-400' },
  teal: { bg: 'from-teal-500/15', ring: 'border-teal-500/40', text: 'text-teal-400' },
  cyan: { bg: 'from-cyan-500/15', ring: 'border-cyan-500/40', text: 'text-cyan-400' },
  pink: { bg: 'from-pink-500/15', ring: 'border-pink-500/40', text: 'text-pink-400' },
};

interface StudyToolsPageProps {
  onLaunchTutor?: (query?: string) => void;
}

export function StudyToolsPage({ onLaunchTutor }: StudyToolsPageProps) {
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [flashcardIdx, setFlashcardIdx] = useState(0);
  const [showFlashcardBack, setShowFlashcardBack] = useState(false);
  const [planGenerated, setPlanGenerated] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [notesInput, setNotesInput] = useState('');
  const [notesOutput, setNotesOutput] = useState('');
  const [generatingNotes, setGeneratingNotes] = useState(false);

  const handleToolClick = (action: string) => {
    setActiveTool(action);
    setFlashcardIdx(0);
    setShowFlashcardBack(false);
  };

  const handleGeneratePlan = async () => {
    setGenerating(true);
    await new Promise<void>(r => setTimeout(r, 1800));
    setPlanGenerated(true);
    setGenerating(false);
  };

  const handleGenerateNotes = async () => {
    if (!notesInput.trim()) return;
    setGeneratingNotes(true);
    await new Promise<void>(r => setTimeout(r, 1500));
    setNotesOutput(
      `# ${notesInput}\n\n## Key Concepts\n- Core definition and principles of ${notesInput}\n- Historical context and development\n- Mathematical/scientific foundations\n\n## Important Formulas\n- Primary formula with derivation steps\n- Common variations and special cases\n\n## Applications\n1. Real-world application 1\n2. Real-world application 2\n3. Exam-focused application\n\n## Common Mistakes\n- Confusing related concepts\n- Unit conversion errors\n- Sign convention issues\n\n## Memory Tips\n- Mnemonic device for key formula\n- Visual association technique`
    );
    setGeneratingNotes(false);
  };

  const activeToolDef = TOOLS.find(t => t.action === activeTool);

  return (
    <div className="min-h-screen bg-[#090a0f] py-8 px-4">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header */}
        <div className="text-center space-y-2">
          <Badge variant="glow" className="text-xs">10 AI Tools</Badge>
          <h1 className="text-3xl font-extrabold text-white">Study Tools</h1>
          <p className="text-gray-400 text-sm">AI-powered tools to help you learn faster, remember longer, and practice smarter.</p>
        </div>

        {/* Featured: AI Study Plan */}
        <div className="glass-panel border border-orange-500/30 rounded-3xl p-6 bg-gradient-to-br from-orange-500/10 via-[#0e101a] to-transparent space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-orange-500/20 border border-orange-500/30">
              <Calendar className="h-5 w-5 text-orange-400" />
            </div>
            <div>
              <Badge variant="glow" className="text-xs mb-1">Featured Tool</Badge>
              <h2 className="text-lg font-extrabold text-white">AI Personalized Study Plan</h2>
            </div>
          </div>
          <p className="text-sm text-gray-300">
            Get a week-by-week study plan tailored to your weak areas, exam date, and daily availability. Updated based on your performance.
          </p>

          {!planGenerated ? (
            <Button
              variant="gradient"
              onClick={handleGeneratePlan}
              disabled={generating}
              className="gap-2 font-semibold"
            >
              {generating ? (
                <><span className="animate-spin inline-block">⚙️</span> Generating your plan...</>
              ) : (
                <><Wand2 className="h-4 w-4" /> Generate My Study Plan</>
              )}
            </Button>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span className="text-sm font-semibold text-emerald-400">Your 5-day plan is ready!</span>
              </div>
              <div className="space-y-2">
                {SAMPLE_PLAN.map(day => (
                  <div key={day.day} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 space-y-1.5">
                    <div className="text-xs font-bold text-orange-400 uppercase tracking-wider">{day.day}</div>
                    {day.tasks.map((t, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-gray-300">
                        <div className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />
                        {t}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPlanGenerated(false)}
                className="gap-1.5 text-xs"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Regenerate Plan
              </Button>
            </div>
          )}
        </div>

        {/* Tool Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TOOLS.map(tool => {
            const colors = COLOR_MAP[tool.color] ?? COLOR_MAP['orange'];
            return (
              <button
                key={tool.id}
                onClick={() => handleToolClick(tool.action)}
                className={cn(
                  'glass-panel border rounded-2xl p-5 text-left transition-all duration-200 hover:scale-[1.02] space-y-3 group',
                  colors.ring,
                  `bg-gradient-to-br ${colors.bg} to-transparent`
                )}
              >
                <div className="flex items-start justify-between">
                  <span className="text-3xl">{tool.icon}</span>
                  {tool.tag && (
                    <span className={cn('text-xs font-bold px-2 py-0.5 rounded-full border bg-white/5', colors.ring, colors.text)}>
                      {tool.tag}
                    </span>
                  )}
                </div>
                <div>
                  <div className="font-extrabold text-white group-hover:text-orange-200 transition-colors text-base">{tool.name}</div>
                  <div className="text-xs text-gray-400 mt-1 leading-relaxed">{tool.desc}</div>
                </div>
                <div className={cn('flex items-center gap-1 text-xs font-semibold', colors.text)}>
                  Open Tool <ChevronRight className="h-3 w-3" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tool Modal */}
      {activeTool && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setActiveTool(null)} />
          <div className="relative w-full max-w-2xl glass-panel border border-white/15 rounded-3xl p-6 z-10 max-h-[85vh] overflow-y-auto space-y-5">

            {/* Modal header */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-white">
                {activeToolDef?.name ?? 'Tool'}
              </h2>
              <button
                onClick={() => setActiveTool(null)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Flashcard panel */}
            {activeTool === 'flashcards' && (
              <div className="space-y-4">
                <div
                  onClick={() => setShowFlashcardBack(v => !v)}
                  className="glass-panel border border-white/15 rounded-2xl p-8 min-h-[200px] flex flex-col items-center justify-center text-center cursor-pointer hover:border-orange-500/40 transition-all space-y-3"
                >
                  <Badge variant="secondary" className="text-xs">{SAMPLE_FLASHCARDS[flashcardIdx].subject}</Badge>
                  {!showFlashcardBack ? (
                    <>
                      <p className="text-white font-bold text-lg">{SAMPLE_FLASHCARDS[flashcardIdx].front}</p>
                      <p className="text-xs text-gray-500">Tap to reveal answer</p>
                    </>
                  ) : (
                    <p className="text-gray-200 text-sm whitespace-pre-line">{SAMPLE_FLASHCARDS[flashcardIdx].back}</p>
                  )}
                </div>
                <div className="flex gap-2 justify-center">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setFlashcardIdx(i => (i - 1 + SAMPLE_FLASHCARDS.length) % SAMPLE_FLASHCARDS.length);
                      setShowFlashcardBack(false);
                    }}
                  >
                    ← Prev
                  </Button>
                  <span className="text-xs text-gray-400 self-center">
                    {flashcardIdx + 1} / {SAMPLE_FLASHCARDS.length}
                  </span>
                  <Button
                    variant="gradient"
                    size="sm"
                    onClick={() => {
                      setFlashcardIdx(i => (i + 1) % SAMPLE_FLASHCARDS.length);
                      setShowFlashcardBack(false);
                    }}
                  >
                    Next →
                  </Button>
                </div>
              </div>
            )}

            {/* Notes panel */}
            {activeTool === 'notes' && (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    value={notesInput}
                    onChange={e => setNotesInput(e.target.value)}
                    placeholder="Enter topic, e.g. 'Integration by Parts'"
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50"
                  />
                  <Button variant="gradient" size="sm" onClick={handleGenerateNotes} disabled={generatingNotes}>
                    {generatingNotes ? '...' : 'Generate'}
                  </Button>
                </div>
                {notesOutput && (
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-xs text-gray-300 whitespace-pre-wrap font-mono leading-relaxed">
                    {notesOutput}
                  </div>
                )}
              </div>
            )}

            {/* Default: redirect to AI tutor */}
            {activeTool !== 'flashcards' && activeTool !== 'notes' && (
              <div className="space-y-3">
                <p className="text-sm text-gray-300">
                  This tool uses your AI Tutor. Ask anything related to{' '}
                  <span className="text-white font-semibold">{activeToolDef?.name ?? 'this tool'}</span>.
                </p>
                <Button
                  variant="gradient"
                  onClick={() => {
                    setActiveTool(null);
                    onLaunchTutor?.(`Help me with: ${activeToolDef?.name ?? ''}`);
                  }}
                  className="gap-2 font-semibold"
                >
                  <Brain className="h-4 w-4" /> Open AI Tutor
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
