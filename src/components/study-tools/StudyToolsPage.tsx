import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog } from "@/components/ui/dialog";
import { FormattedContent } from "@/components/tutor/MathRenderer";
import { INITIAL_FLASHCARDS, INITIAL_STUDY_NOTES } from "@/services/mockData";
import { Flashcard, StudyNote } from "@/types";
import confetti from "canvas-confetti";
import {
  FileText,
  Sparkles,
  Layers,
  FileCheck2,
  HelpCircle,
  Timer,
  GraduationCap,
  Calendar,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCw,
  Copy,
  Printer,
  ChevronRight,
  BookOpen,
  Lightbulb,
  Zap,
  Check
} from "lucide-react";

export function StudyToolsPage({
  onLaunchTutor,
}: {
  onLaunchTutor: (query: string) => void;
}) {
  const [activeTool, setActiveTool] = useState<string | null>(null);

  // 1. AI Notes State
  const [notesTopic, setNotesTopic] = useState("");
  const [generatedNotes, setGeneratedNotes] = useState<StudyNote | null>(INITIAL_STUDY_NOTES[0]);
  const [isGeneratingNotes, setIsGeneratingNotes] = useState(false);
  const [copiedNote, setCopiedNote] = useState(false);

  // 2. AI Quiz Generator State
  const [quizTopic, setQuizTopic] = useState("Calculus Derivatives");
  const [quizQuestions, setQuizQuestions] = useState([
    {
      q: "What is the derivative of f(x) = x³ · sin(x)?",
      opts: ["3x²·cos(x)", "3x²·sin(x) + x³·cos(x)", "x³·cos(x) - 3x²·sin(x)", "3x² + cos(x)"],
      ans: 1,
      exp: "Using the Product Rule: (uv)' = u'v + uv'. Here u=x³ (u'=3x²) and v=sin(x) (v'=cos(x)).",
    },
    {
      q: "If f'(c) = 0 and f''(c) < 0, what does x = c represent?",
      opts: ["Local minimum", "Local maximum", "Inflection point", "Vertical asymptote"],
      ans: 1,
      exp: "By the Second Derivative Test, f''(c) < 0 indicates the curve is concave down, so x = c is a local maximum.",
    },
    {
      q: "What is the integral of e^(2x) dx?",
      opts: ["2e^(2x) + C", "(1/2)e^(2x) + C", "e^(2x) + C", "(1/4)e^(2x) + C"],
      ans: 1,
      exp: "Using substitution u = 2x, du = 2 dx. Thus ∫ e^(2x) dx = (1/2)e^(2x) + C.",
    },
  ]);
  const [currentQuizIdx, setCurrentQuizIdx] = useState(0);
  const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(null);
  const [isQuizSubmitted, setIsQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  // 3. Flashcards Deck State
  const [flashcards, setFlashcards] = useState<Flashcard[]>(INITIAL_FLASHCARDS);
  const [currentCardIdx, setCurrentCardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // 4. Summarizer State
  const [summaryInput, setSummaryInput] = useState("");
  const [summaryOutput, setSummaryOutput] = useState("");
  const [isSummarizing, setIsSummarizing] = useState(false);

  // 5. Explain Simply State
  const [explainConcept, setExplainConcept] = useState("");
  const [explainResult, setExplainResult] = useState("");
  const [isExplaining, setIsExplaining] = useState(false);

  // 6. Exam Mode Simulator State
  const [examTopic, setExamTopic] = useState("Physics Kinematics");
  const [examStarted, setExamStarted] = useState(false);
  const [examTimer, setExamTimer] = useState(600); // 10 minutes

  // 7. Homework Helper State
  const [hwProblem, setHwProblem] = useState("");
  const [hwHints, setHwHints] = useState<string[]>([]);
  const [isGeneratingHints, setIsGeneratingHints] = useState(false);

  // 8. Study Planner State
  const [studyPlanDays, setStudyPlanDays] = useState([
    { day: "Monday", focus: "Mathematics (Integration & Definite Bounds)", time: "60 mins", status: "Done" },
    { day: "Tuesday", focus: "Physics (Inclined planes & friction)", time: "75 mins", status: "Done" },
    { day: "Wednesday", focus: "Chemistry (SN1 vs SN2 reaction mechanisms)", time: "60 mins", status: "Today" },
    { day: "Thursday", focus: "Computer Science (Binary Trees & Recursion)", time: "90 mins", status: "Upcoming" },
    { day: "Friday", focus: "Full Mock Test Revision & Flashcards Review", time: "120 mins", status: "Upcoming" },
  ]);

  // Handlers
  const handleGenerateNotes = async () => {
    if (!notesTopic.trim()) return;
    setIsGeneratingNotes(true);
    await new Promise((res) => setTimeout(res, 1200));

    const newNote: StudyNote = {
      id: `note_${Date.now()}`,
      title: `Structured Master Notes: ${notesTopic}`,
      subject: "AI Generated",
      topic: notesTopic,
      summary: `Comprehensive summary and revision guide for ${notesTopic}.`,
      contentMarkdown: `## Core Principles of ${notesTopic}\n\n1. **Theoretical Foundation:** Understanding the primary balance of physical/mathematical parameters.\n2. **Governing Equation:**\n\n$$\\Delta E = mc^2 \\quad \\text{or} \\quad \\int f(x) dx = F(x) + C$$\n\n3. **High-Yield Exam Tips:**\n- Always double check boundary values.\n- Verify units before calculating.\n- Substitute final answers back into original conditions.`,
      keyPoints: [
        "Primary concept verified with standard curriculum definitions.",
        "Crucial formulas formatted in LaTeX for quick recall.",
        "Common exam pitfalls highlighted."
      ],
      formulas: ["\\text{Core Relation: } x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}"],
      createdAt: new Date().toISOString(),
    };

    setGeneratedNotes(newNote);
    setIsGeneratingNotes(false);
  };

  const handleSummarize = async () => {
    if (!summaryInput.trim()) return;
    setIsSummarizing(true);
    await new Promise((res) => setTimeout(res, 1000));
    setSummaryOutput(
      `### Executive Summary (TL;DR)\n\n* **Main Point:** The text focuses on the central mechanism of the topic, breaking it down into fundamental components.\n* **Key Takeaway 1:** All forces/values occur in reciprocal balance according to conservation laws.\n* **Key Takeaway 2:** Experimental results closely mirror theoretical mathematical predictions within 2% margin.\n* **Revision Cheat-Sheet:** Remember the core relationship before attempting calculation.`
    );
    setIsSummarizing(false);
  };

  const handleExplainSimply = async () => {
    if (!explainConcept.trim()) return;
    setIsExplaining(true);
    await new Promise((res) => setTimeout(res, 1100));
    setExplainResult(
      `### Explained Like You're 12 🧒💡\n\nThink of **${explainConcept}** like a team tug-of-war!\n\nWhen both sides pull with equal strength, nothing moves (equilibrium). But the moment one person joins side A (added force), the rope accelerates towards side A ($F = ma$)!\n\n**The Big Secret:** Big fancy equations are just simple common sense written in math language.`
    );
    setIsExplaining(false);
  };

  const handleGenerateHomeworkHints = async () => {
    if (!hwProblem.trim()) return;
    setIsGeneratingHints(true);
    await new Promise((res) => setTimeout(res, 900));
    setHwHints([
      "💡 Hint 1: What quantities are directly given in the question? Write down their units.",
      "💡 Hint 2: Is there a conservation law (Energy, Momentum, or Mass) that stays constant?",
      "💡 Hint 3: Try drawing a free-body diagram or setting up the algebraic ratio before plugging in numbers.",
      "💡 Hint 4: Check if any parameters cancel out when you equate the two sides."
    ]);
    setIsGeneratingHints(false);
  };

  const tools = [
    {
      id: "notes",
      title: "AI Notes",
      badge: "Smart Document",
      desc: "Convert any topic, uploaded text, or syllabus into structured master notes.",
      icon: <FileText className="h-6 w-6 text-orange-400" />,
      color: "from-orange-500/20 to-amber-500/10",
    },
    {
      id: "quiz",
      title: "AI Quiz Generator",
      badge: "Instant Evaluation",
      desc: "Generate interactive quizzes with timers, explanations, and instant score analysis.",
      icon: <Sparkles className="h-6 w-6 text-amber-400" />,
      color: "from-amber-500/20 to-yellow-500/10",
    },
    {
      id: "flashcards",
      title: "Flashcards Deck",
      badge: "Spaced Repetition",
      desc: "Interactive 3D flip card decks to memorize formulas, definitions, and theorems.",
      icon: <Layers className="h-6 w-6 text-yellow-400" />,
      color: "from-yellow-500/20 to-orange-500/10",
    },
    {
      id: "summarizer",
      title: "Summarizer",
      badge: "High-Yield",
      desc: "Distill lengthy textbook chapters and PDFs into concise revision cheat-sheets.",
      icon: <FileCheck2 className="h-6 w-6 text-emerald-400" />,
      color: "from-emerald-500/20 to-teal-500/10",
    },
    {
      id: "explain",
      title: "Explain Simply",
      badge: "Feynman Method",
      desc: "Break down complex concepts into intuitive everyday analogies.",
      icon: <HelpCircle className="h-6 w-6 text-cyan-400" />,
      color: "from-cyan-500/20 to-blue-500/10",
    },
    {
      id: "exam",
      title: "Exam Mode",
      badge: "Timed Test",
      desc: "Simulate real exam pressure with strict countdown timers and step-marking.",
      icon: <Timer className="h-6 w-6 text-purple-400" />,
      color: "from-purple-500/20 to-pink-500/10",
    },
    {
      id: "homework",
      title: "Homework Helper",
      badge: "Guided Reflection",
      desc: "Receive step-by-step guidance and hints without giving away the raw answer.",
      icon: <GraduationCap className="h-6 w-6 text-rose-400" />,
      color: "from-rose-500/20 to-orange-500/10",
    },
    {
      id: "planner",
      title: "Study Planner",
      badge: "Personalized Schedule",
      desc: "Create personalized weekly study timetables aligned with your upcoming exams.",
      icon: <Calendar className="h-6 w-6 text-blue-400" />,
      color: "from-blue-500/20 to-indigo-500/10",
    },
  ];

  return (
    <div className="min-h-screen bg-[#090a0f] text-gray-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="border-b border-white/10 pb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="p-2 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30">
              <Sparkles className="h-5 w-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              AI Study Tools Suite
            </h1>
          </div>
          <p className="text-sm text-gray-400">
            Intelligent learning utilities designed to accelerate retention, exam preparation, and conceptual clarity.
          </p>
        </div>

        {/* 8 Study Tools Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {tools.map((tool) => (
            <div
              key={tool.id}
              onClick={() => setActiveTool(tool.id)}
              className="glass-panel glass-panel-hover rounded-2xl p-5 cursor-pointer flex flex-col justify-between border border-white/10 group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-2xl bg-gradient-to-br ${tool.color} border border-white/10`}>
                    {tool.icon}
                  </div>
                  <Badge variant="secondary" className="text-[10px]">
                    {tool.badge}
                  </Badge>
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-orange-300 transition-colors mb-1.5">
                  {tool.title}
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed mb-4">
                  {tool.desc}
                </p>
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-orange-400 font-medium group-hover:translate-x-1 transition-transform">
                <span>Launch Tool</span>
                <ChevronRight className="h-4 w-4" />
              </div>
            </div>
          ))}
        </div>

        {/* ACTIVE TOOL WORKSPACE DIALOGS / PANELS */}

        {/* 1. AI Notes Tool Dialog */}
        <Dialog
          isOpen={activeTool === "notes"}
          onClose={() => setActiveTool(null)}
          title="AI Study Notes Generator"
          description="Enter any topic or paste study materials to generate structured notes with formulas and takeaways."
          maxWidth="2xl"
        >
          <div className="space-y-4 pt-2">
            <div className="flex gap-2">
              <Input
                value={notesTopic}
                onChange={(e) => setNotesTopic(e.target.value)}
                placeholder="e.g. Thermodynamics Laws, Photosynthesis, Quadratic Equations..."
                className="text-sm"
              />
              <Button
                variant="gradient"
                size="md"
                isLoading={isGeneratingNotes}
                onClick={handleGenerateNotes}
                className="shrink-0 text-xs font-semibold"
              >
                Generate Notes
              </Button>
            </div>

            {generatedNotes && (
              <div className="p-5 rounded-2xl bg-[#11131c] border border-white/10 space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h4 className="text-base font-bold text-white">{generatedNotes.title}</h4>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(generatedNotes.contentMarkdown);
                        setCopiedNote(true);
                        setTimeout(() => setCopiedNote(false), 2000);
                      }}
                      className="text-xs"
                    >
                      {copiedNote ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => window.print()} className="text-xs">
                      <Printer className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                <div className="text-sm text-gray-200 leading-relaxed">
                  <FormattedContent text={generatedNotes.contentMarkdown} />
                </div>

                <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-xs text-orange-200 space-y-1">
                  <strong className="block text-white font-semibold">Key Points to Memorize:</strong>
                  {generatedNotes.keyPoints.map((kp, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <span>•</span>
                      <span>{kp}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Dialog>

        {/* 2. AI Quiz Generator Dialog */}
        <Dialog
          isOpen={activeTool === "quiz"}
          onClose={() => {
            setActiveTool(null);
            setIsQuizSubmitted(false);
            setCurrentQuizIdx(0);
            setSelectedQuizOption(null);
          }}
          title="AI Quiz Generator"
          description="Test your conceptual understanding with real-time feedback."
          maxWidth="xl"
        >
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between text-xs text-gray-400 border-b border-white/10 pb-2">
              <span>Question {currentQuizIdx + 1} of {quizQuestions.length}</span>
              <span className="font-mono text-orange-400">Score: {quizScore}/{quizQuestions.length}</span>
            </div>

            {/* Current Question */}
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
              <h4 className="text-base font-bold text-white mb-4">
                {quizQuestions[currentQuizIdx].q}
              </h4>

              <div className="space-y-2">
                {quizQuestions[currentQuizIdx].opts.map((opt, idx) => {
                  const isSelected = selectedQuizOption === idx;
                  const isCorrect = isQuizSubmitted && idx === quizQuestions[currentQuizIdx].ans;
                  const isWrong = isQuizSubmitted && isSelected && !isCorrect;

                  return (
                    <button
                      key={idx}
                      onClick={() => !isQuizSubmitted && setSelectedQuizOption(idx)}
                      className={`w-full text-left p-3 rounded-xl text-xs sm:text-sm font-medium transition-all border ${
                        isCorrect
                          ? "bg-emerald-500/20 border-emerald-500 text-emerald-200"
                          : isWrong
                          ? "bg-red-500/20 border-red-500 text-red-200"
                          : isSelected
                          ? "bg-orange-500/20 border-orange-500 text-white"
                          : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Explanation box after submit */}
            {isQuizSubmitted && (
              <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-xs text-orange-200 animate-fadeIn">
                <strong className="block text-white mb-1">Explanation:</strong>
                {quizQuestions[currentQuizIdx].exp}
              </div>
            )}

            {/* Quiz Navigation Buttons */}
            <div className="flex justify-between items-center pt-2">
              {!isQuizSubmitted ? (
                <Button
                  variant="default"
                  size="sm"
                  disabled={selectedQuizOption === null}
                  onClick={() => {
                    setIsQuizSubmitted(true);
                    if (selectedQuizOption === quizQuestions[currentQuizIdx].ans) {
                      setQuizScore((prev) => prev + 1);
                      confetti({ particleCount: 30, spread: 60, origin: { y: 0.7 } });
                    }
                  }}
                  className="ml-auto"
                >
                  Submit Answer
                </Button>
              ) : (
                <Button
                  variant="gradient"
                  size="sm"
                  onClick={() => {
                    if (currentQuizIdx < quizQuestions.length - 1) {
                      setCurrentQuizIdx((prev) => prev + 1);
                      setSelectedQuizOption(null);
                      setIsQuizSubmitted(false);
                    } else {
                      alert(`Quiz Finished! Your final score: ${quizScore + 1}/${quizQuestions.length}`);
                      setActiveTool(null);
                    }
                  }}
                  className="ml-auto gap-1"
                >
                  <span>{currentQuizIdx < quizQuestions.length - 1 ? "Next Question" : "Finish Quiz"}</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </Dialog>

        {/* 3. Flashcards Tool Dialog */}
        <Dialog
          isOpen={activeTool === "flashcards"}
          onClose={() => setActiveTool(null)}
          title="Spaced Repetition Flashcards"
          description="Click the card to flip between Question and Answer."
          maxWidth="lg"
        >
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>Card {currentCardIdx + 1} of {flashcards.length}</span>
              <Badge variant="secondary" className="text-xs">
                {flashcards[currentCardIdx].topic}
              </Badge>
            </div>

            {/* 3D Flip Card Container */}
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className="relative aspect-[16/10] w-full rounded-2xl glass-panel border border-orange-500/30 p-6 flex flex-col justify-center items-center text-center cursor-pointer hover:border-orange-500/60 shadow-xl transition-all duration-300"
            >
              <span className="text-[11px] uppercase font-bold tracking-wider text-orange-400 mb-2 block">
                {isFlipped ? "Answer / Solution" : "Question / Concept (Click to flip)"}
              </span>

              <div className="text-base sm:text-lg font-medium text-white max-w-md">
                <FormattedContent
                  text={isFlipped ? flashcards[currentCardIdx].back : flashcards[currentCardIdx].front}
                />
              </div>

              {!isFlipped && flashcards[currentCardIdx].hint && (
                <span className="text-xs text-amber-300/80 mt-4 italic">
                  💡 Hint: {flashcards[currentCardIdx].hint}
                </span>
              )}
            </div>

            {/* Flashcard Action Buttons */}
            <div className="flex items-center justify-between pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsFlipped(false);
                  setCurrentCardIdx((prev) => (prev > 0 ? prev - 1 : flashcards.length - 1));
                }}
                className="text-xs"
              >
                Previous
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsFlipped(!isFlipped)}
                className="text-xs gap-1.5"
              >
                <RotateCw className="h-3.5 w-3.5" /> Flip Card
              </Button>

              <Button
                variant="gradient"
                size="sm"
                onClick={() => {
                  setIsFlipped(false);
                  setCurrentCardIdx((prev) => (prev < flashcards.length - 1 ? prev + 1 : 0));
                }}
                className="text-xs"
              >
                Next Card
              </Button>
            </div>
          </div>
        </Dialog>

        {/* 4. Summarizer Dialog */}
        <Dialog
          isOpen={activeTool === "summarizer"}
          onClose={() => setActiveTool(null)}
          title="AI Study Material Summarizer"
          description="Paste long textbook sections or study guides to extract key exam points."
          maxWidth="lg"
        >
          <div className="space-y-4 pt-2">
            <Textarea
              value={summaryInput}
              onChange={(e) => setSummaryInput(e.target.value)}
              placeholder="Paste article, textbook excerpt, or notes here..."
              rows={4}
            />

            <Button
              variant="default"
              size="sm"
              isLoading={isSummarizing}
              onClick={handleSummarize}
              className="w-full"
            >
              Summarize Material
            </Button>

            {summaryOutput && (
              <div className="p-4 rounded-xl bg-[#11131c] border border-white/10 text-xs sm:text-sm text-gray-200">
                <FormattedContent text={summaryOutput} />
              </div>
            )}
          </div>
        </Dialog>

        {/* 5. Explain Simply Dialog */}
        <Dialog
          isOpen={activeTool === "explain"}
          onClose={() => setActiveTool(null)}
          title="Explain Simply (Feynman Method)"
          description="Demystify tough concepts using relatable everyday analogies."
          maxWidth="md"
        >
          <div className="space-y-4 pt-2">
            <Input
              value={explainConcept}
              onChange={(e) => setExplainConcept(e.target.value)}
              placeholder="e.g. Quantum Superposition, Entropy, Polymerase Chain Reaction..."
            />

            <Button
              variant="gradient"
              size="sm"
              isLoading={isExplaining}
              onClick={handleExplainSimply}
              className="w-full"
            >
              Explain Like I'm 12
            </Button>

            {explainResult && (
              <div className="p-4 rounded-xl bg-orange-500/[0.08] border border-orange-500/25 text-xs sm:text-sm text-gray-200">
                <FormattedContent text={explainResult} />
              </div>
            )}
          </div>
        </Dialog>

        {/* 6. Exam Mode Dialog */}
        <Dialog
          isOpen={activeTool === "exam"}
          onClose={() => setActiveTool(null)}
          title="Exam Mode Simulator"
          description="Practice timed questions with exam conditions and mark breakdowns."
          maxWidth="md"
        >
          <div className="space-y-4 pt-2 text-center">
            <div className="p-6 rounded-2xl bg-black/40 border border-white/10 space-y-3">
              <Timer className="h-10 w-10 text-orange-400 mx-auto animate-pulse" />
              <h3 className="text-xl font-bold text-white">Full Exam Simulation</h3>
              <p className="text-xs text-gray-400">
                10-Minute Rapid Revision Exam • Negative Marking Enabled • Step Marking Scheme
              </p>
              <div className="text-2xl font-mono font-extrabold text-amber-400">
                10:00 Mins Remaining
              </div>
            </div>

            <Button
              variant="gradient"
              size="lg"
              onClick={() => {
                alert("Exam Mode Initiated! Good luck.");
                setActiveTool(null);
              }}
              className="w-full font-semibold shadow-glow-amber"
            >
              Start Simulated Exam
            </Button>
          </div>
        </Dialog>

        {/* 7. Homework Helper Dialog */}
        <Dialog
          isOpen={activeTool === "homework"}
          onClose={() => setActiveTool(null)}
          title="Homework Helper"
          description="Guided hints to help you deduce the answer yourself."
          maxWidth="md"
        >
          <div className="space-y-4 pt-2">
            <Input
              value={hwProblem}
              onChange={(e) => setHwProblem(e.target.value)}
              placeholder="Type the homework problem you are stuck on..."
            />

            <Button
              variant="default"
              size="sm"
              isLoading={isGeneratingHints}
              onClick={handleGenerateHomeworkHints}
              className="w-full"
            >
              Get Guided Hints
            </Button>

            {hwHints.length > 0 && (
              <div className="space-y-2 pt-2">
                {hwHints.map((hint, i) => (
                  <div key={i} className="p-3 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-gray-200">
                    {hint}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Dialog>

        {/* 8. Study Planner Dialog */}
        <Dialog
          isOpen={activeTool === "planner"}
          onClose={() => setActiveTool(null)}
          title="Personalized Study Planner"
          description="Your adaptive timetable aligned with weak topics."
          maxWidth="lg"
        >
          <div className="space-y-3 pt-2">
            {studyPlanDays.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs"
              >
                <div>
                  <span className="font-bold text-white block">{item.day}</span>
                  <span className="text-gray-400">{item.focus}</span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-orange-300 font-mono">{item.time}</span>
                  <Badge
                    variant={item.status === "Done" ? "success" : item.status === "Today" ? "glow" : "secondary"}
                    className="text-[10px]"
                  >
                    {item.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Dialog>
      </div>
    </div>
  );
}
