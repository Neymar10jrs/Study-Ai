import React, { useState } from "react";
import { Navbar, NavTab } from "./components/layout/Navbar";
import { Footer } from "./components/layout/Footer";
import { ShaderHero } from "./components/hero/ShaderHero";
import { AIChat } from "./components/tutor/AIChat";
import { QuestionSolverPage } from "./components/solver/QuestionSolverPage";
import { SubjectsPage } from "./components/subjects/SubjectsPage";
import { StudyToolsPage } from "./components/study-tools/StudyToolsPage";
import { PracticePage } from "./components/practice/PracticePage";
import { DashboardPage } from "./components/dashboard/DashboardPage";
import { CameraScannerModal } from "./components/solver/CameraScannerModal";
import { GlobalSearchModal } from "./components/search/GlobalSearchModal";
import { AuthModal } from "./components/auth/AuthModal";
import { getStudentProfile } from "./services/storageService";
import { StudentProfile } from "./types";
import {
  Camera,
  BrainCircuit,
  Award,
  Sparkles,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  Zap,
  Layers,
  FileText
} from "lucide-react";
import { Button } from "./components/ui/button";
import { Badge } from "./components/ui/badge";

export function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>("home");
  const [profile, setProfile] = useState<StudentProfile>(getStudentProfile());

  // Global modals
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Cross-page navigation state
  const [incomingTutorQuery, setIncomingTutorQuery] = useState<string | undefined>();
  const [practiceTopic, setPracticeTopic] = useState<string | undefined>();
  const [practiceSubjectId, setPracticeSubjectId] = useState<string | undefined>();

  // Handlers for cross-component triggers
  const handleLaunchTutor = (query?: string) => {
    setIncomingTutorQuery(query);
    setCurrentTab("tutor");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLaunchPractice = (subjectId?: string, topic?: string) => {
    setPracticeSubjectId(subjectId);
    setPracticeTopic(topic);
    setCurrentTab("practice");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLaunchNotes = (subjectName: string) => {
    setCurrentTab("tools");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLaunchQuiz = (subjectName: string) => {
    setCurrentTab("tools");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCameraScanComplete = (images: string[]) => {
    // Navigate to solver page with images
    setCurrentTab("solver");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#090a0f] text-gray-100 selection:bg-orange-500/30 selection:text-orange-200">
      {/* Top Glass Navigation */}
      <Navbar
        currentTab={currentTab}
        onTabChange={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        onOpenSearch={() => setIsSearchModalOpen(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onAskAI={() => handleLaunchTutor()}
        profile={profile}
      />

      {/* Global Modals */}
      <CameraScannerModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onAnalyzeImages={handleCameraScanComplete}
      />

      <GlobalSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onSelectAction={(type, param) => {
          if (type === "solve") setCurrentTab("solver");
          else if (type === "tutor") handleLaunchTutor(param);
          else if (type === "subject") setCurrentTab("subjects");
          else if (type === "practice") handleLaunchPractice(param);
        }}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={(newProfile) => setProfile(newProfile)}
      />

      {/* MAIN VIEW SWITCHER */}
      <main className="flex-1">
        {currentTab === "home" && (
          <div className="space-y-16">
            {/* Cinematic Animated Shader Hero */}
            <ShaderHero
              onStartLearning={() => setCurrentTab("subjects")}
              onAskAI={() => handleLaunchTutor()}
              onScanQuestion={() => setIsCameraModalOpen(true)}
              onSampleClick={(prompt) => handleLaunchTutor(prompt)}
            />

            {/* Visual Workflow Steps: "How StudyAI Works" */}
            <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-2xl mx-auto mb-12">
                <Badge variant="glow" className="mb-3 text-xs">
                  Intelligent Student Workflow
                </Badge>
                <h2 className="text-3xl font-extrabold text-white tracking-tight">
                  From Photo to Total Understanding in 4 Steps
                </h2>
                <p className="text-sm text-gray-400 mt-2">
                  StudyAI does not merely provide dry answers — it acts as your patient 24/7 personal tutor.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Step 1 */}
                <div className="glass-panel glass-panel-hover rounded-2xl p-6 border border-white/10 space-y-3 relative group">
                  <div className="w-12 h-12 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center font-bold text-lg">
                    1
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-orange-300 transition-colors">
                    Snap or Upload
                  </h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Take a photo of any printed, handwritten, or textbook question. Even multi-page problems and diagrams are supported.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="glass-panel glass-panel-hover rounded-2xl p-6 border border-white/10 space-y-3 relative group">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-lg">
                    2
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                    OCR & Quality Verify
                  </h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    AI Vision reads formulas, chemical equations, and diagrams. You can edit the detected question with a math symbol bar.
                  </p>
                </div>

                {/* Step 3 */}
                <div className="glass-panel glass-panel-hover rounded-2xl p-6 border border-white/10 space-y-3 relative group">
                  <div className="w-12 h-12 rounded-xl bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 flex items-center justify-center font-bold text-lg">
                    3
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-yellow-300 transition-colors">
                    Step-by-Step Reason
                  </h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Receive clear breakdowns: Given parameters, required formulas, calculation steps, final answer, and key educational takeaways.
                  </p>
                </div>

                {/* Step 4 */}
                <div className="glass-panel glass-panel-hover rounded-2xl p-6 border border-white/10 space-y-3 relative group">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-lg">
                    4
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                    Follow-Up & Practice
                  </h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Ask "Why this formula?" or "Explain step 2". Practice similar problems to lock the concept in your memory.
                  </p>
                </div>
              </div>
            </section>

            {/* Core Feature Hub Banners */}
            <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* AI Tutor Card */}
                <div className="p-8 rounded-3xl glass-panel border border-orange-500/30 bg-gradient-to-br from-orange-500/10 via-[#0e101a] to-[#090a0f] space-y-4 flex flex-col justify-between">
                  <div>
                    <div className="p-3 w-fit rounded-2xl bg-orange-500/20 border border-orange-500/40 text-orange-400 mb-4 shadow-glow-sm">
                      <BrainCircuit className="h-6 w-6" />
                    </div>
                    <Badge variant="glow" className="mb-2 text-xs">
                      Conversational AI Tutor
                    </Badge>
                    <h3 className="text-2xl font-bold text-white">
                      Ask Anything. Learn Everything.
                    </h3>
                    <p className="text-sm text-gray-300 leading-relaxed mt-2">
                      Stuck on a tricky theorem or homework problem? Chat with an AI tutor that explains using LaTeX equations, diagrams, and personalized analogies.
                    </p>
                  </div>
                  <Button
                    variant="gradient"
                    size="md"
                    onClick={() => handleLaunchTutor()}
                    className="self-start font-semibold text-xs gap-1.5 shadow-glow-amber mt-4"
                  >
                    <span>Open AI Tutor</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>

                {/* Dedicated Image Question Solver */}
                <div className="p-8 rounded-3xl glass-panel border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-[#0e101a] to-[#090a0f] space-y-4 flex flex-col justify-between">
                  <div>
                    <div className="p-3 w-fit rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 mb-4 shadow-glow-sm">
                      <Camera className="h-6 w-6" />
                    </div>
                    <Badge variant="amber" className="mb-2 text-xs">
                      Camera & Image Vision Solver
                    </Badge>
                    <h3 className="text-2xl font-bold text-white">
                      Camera Question Scanner
                    </h3>
                    <p className="text-sm text-gray-300 leading-relaxed mt-2">
                      Point your phone or webcam at the textbook. Our specialized OCR extracts formulas, validates image readability, and guides you through the full derivation.
                    </p>
                  </div>
                  <Button
                    variant="default"
                    size="md"
                    onClick={() => setCurrentTab("solver")}
                    className="self-start font-semibold text-xs gap-1.5 shadow-glow-sm mt-4"
                  >
                    <span>Launch Question Solver</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </section>

            {/* Quick Call to Action Banner */}
            <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
              <div className="rounded-3xl p-8 sm:p-12 glass-panel border border-orange-500/40 text-center bg-gradient-to-r from-orange-500/20 via-amber-500/15 to-yellow-500/10 shadow-glow-md space-y-6">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight max-w-xl mx-auto">
                  Ready to Understand Any Subject Faster?
                </h2>
                <p className="text-sm sm:text-base text-gray-300 max-w-lg mx-auto">
                  Join 85,000+ students mastering calculus, mechanics, chemistry reactions, and exam preparation.
                </p>
                <div className="flex flex-wrap justify-center gap-3 pt-2">
                  <Button
                    size="lg"
                    variant="gradient"
                    onClick={() => setCurrentTab("solver")}
                    className="font-semibold shadow-glow-amber text-sm px-8"
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Scan a Question Now
                  </Button>
                  <Button
                    size="lg"
                    variant="secondary"
                    onClick={() => setCurrentTab("dashboard")}
                    className="text-sm px-6 bg-white/10"
                  >
                    View Student Dashboard
                  </Button>
                </div>
              </div>
            </section>
          </div>
        )}

        {currentTab === "tutor" && (
          <AIChat
            onLaunchCamera={() => setIsCameraModalOpen(true)}
            onNavigateToPractice={handleLaunchPractice}
            initialQuery={incomingTutorQuery}
          />
        )}

        {currentTab === "solver" && (
          <QuestionSolverPage
            onNavigateToPractice={handleLaunchPractice}
            onNavigateToChat={handleLaunchTutor}
          />
        )}

        {currentTab === "subjects" && (
          <SubjectsPage
            onLaunchTutor={handleLaunchTutor}
            onLaunchPractice={handleLaunchPractice}
            onLaunchNotes={handleLaunchNotes}
            onLaunchQuiz={handleLaunchQuiz}
          />
        )}

        {currentTab === "tools" && (
          <StudyToolsPage onLaunchTutor={handleLaunchTutor} />
        )}

        {currentTab === "practice" && (
          <PracticePage
            initialSubjectId={practiceSubjectId}
            initialTopic={practiceTopic}
            onNavigateToTutor={handleLaunchTutor}
          />
        )}

        {currentTab === "dashboard" && (
          <DashboardPage
            onNavigateToSolve={() => setCurrentTab("solver")}
            onNavigateToTutor={handleLaunchTutor}
            onNavigateToPractice={handleLaunchPractice}
          />
        )}
      </main>

      {/* Modern Footer */}
      <Footer onTabChange={(tab) => {
        setCurrentTab(tab);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }} />
    </div>
  );
}
export default App;
