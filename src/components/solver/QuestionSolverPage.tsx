import React, { useState } from "react";
import { ImageUploader } from "./ImageUploader";
import { CameraScannerModal } from "./CameraScannerModal";
import { QuestionDetector } from "./QuestionDetector";
import { ImageQualityAlert } from "./ImageQualityAlert";
import { StepByStepSolution } from "./StepByStepSolution";
import { FollowUpChat } from "./FollowUpChat";
import { analyzeQuestionImages } from "@/services/visionService";
import { solveQuestionText, answerFollowUpQuestion } from "@/services/solverService";
import { saveSolvedQuestion } from "@/services/storageService";
import { SolvedQuestion, ImageQualityReport, DetailedSolution } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Camera,
  UploadCloud,
  CheckCircle2,
  ArrowLeft,
  Bookmark,
  RefreshCw,
  HelpCircle,
  BookOpen,
  Layers
} from "lucide-react";

interface QuestionSolverPageProps {
  onNavigateToPractice?: (topic: string) => void;
  onNavigateToChat?: (query: string) => void;
}

export function QuestionSolverPage({
  onNavigateToPractice,
  onNavigateToChat,
}: QuestionSolverPageProps) {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSolving, setIsSolving] = useState(false);

  // Workflow state
  const [currentStep, setCurrentStep] = useState<"upload" | "confirm" | "solved">("upload");
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [extractedQuestion, setExtractedQuestion] = useState("");
  const [detectedSubject, setDetectedSubject] = useState("");
  const [detectedTopic, setDetectedTopic] = useState("");
  const [qualityReport, setQualityReport] = useState<ImageQualityReport | null>(null);
  const [activeSolution, setActiveSolution] = useState<DetailedSolution | null>(null);
  const [followUpChats, setFollowUpChats] = useState<{ role: "user" | "assistant"; text: string; timestamp: string }[]>([]);
  const [isSaved, setIsSaved] = useState(false);

  // Step 1 -> Step 2: Images uploaded/scanned, perform Vision OCR & Quality Check
  const handleAnalyzeImages = async (images: string[]) => {
    setSelectedImages(images);
    setIsAnalyzing(true);

    try {
      const result = await analyzeQuestionImages(images);
      setExtractedQuestion(result.extractedText);
      setDetectedSubject(result.subject);
      setDetectedTopic(result.topic);
      setQualityReport(result.qualityReport);
      setCurrentStep("confirm");
    } catch (e: any) {
      alert("Failed to analyze image: " + e.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Step 2 -> Step 3: Question confirmed/edited, generate educational step-by-step solution
  const handleSolveQuestion = async (finalQuestionText: string) => {
    setIsSolving(true);
    setExtractedQuestion(finalQuestionText);

    try {
      const solution = await solveQuestionText(finalQuestionText, detectedSubject, detectedTopic);
      setActiveSolution(solution);
      setCurrentStep("solved");

      // Save to student's history
      const solvedRecord: SolvedQuestion = {
        id: `solved_${Date.now()}`,
        createdAt: new Date().toISOString(),
        imageUrls: selectedImages,
        extractedText: finalQuestionText,
        subject: detectedSubject || solution.subject,
        topic: detectedTopic || solution.topic,
        qualityReport: qualityReport || {
          isReadable: true,
          score: 95,
          issues: [],
          detectionTypes: { hasHandwriting: true, hasEquations: true, hasDiagrams: false, hasPrintedText: true, hasCode: false },
        },
        solution: solution,
        status: "solved",
        followUpChats: [],
        isSaved: true,
      };

      saveSolvedQuestion(solvedRecord);
      setIsSaved(true);
    } catch (e: any) {
      alert("Error solving question: " + e.message);
    } finally {
      setIsSolving(false);
    }
  };

  // Step 3: Student asks follow-up question
  const handleFollowUpMessage = async (query: string) => {
    if (!activeSolution) return;

    const userEntry = {
      role: "user" as const,
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setFollowUpChats((prev) => [...prev, userEntry]);

    try {
      const aiResponseText = await answerFollowUpQuestion(extractedQuestion, activeSolution, query);
      const aiEntry = {
        role: "assistant" as const,
        text: aiResponseText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setFollowUpChats((prev) => [...prev, aiEntry]);
    } catch (e) {
      console.error(e);
    }
  };

  const handleReset = () => {
    setCurrentStep("upload");
    setSelectedImages([]);
    setExtractedQuestion("");
    setActiveSolution(null);
    setQualityReport(null);
    setFollowUpChats([]);
    setIsSaved(false);
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-gray-100 py-10 px-4 sm:px-6 lg:px-8">
      {/* Camera Scanner Modal */}
      <CameraScannerModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onAnalyzeImages={handleAnalyzeImages}
      />

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-2 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30">
                <Camera className="h-5 w-5" />
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                AI Question Solver & Scanner
              </h1>
            </div>
            <p className="text-sm text-gray-400">
              Upload or snap a photo of any question, math formula, handwritten note, or diagram.
            </p>
          </div>

          {currentStep !== "upload" && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleReset}
              className="self-start sm:self-auto text-xs gap-1.5"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Solve Another Question</span>
            </Button>
          )}
        </div>

        {/* Workflow Progress Breadcrumb */}
        <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs">
          <div className="flex items-center gap-2">
            <span
              className={`flex items-center justify-center w-5 h-5 rounded-full font-bold ${
                currentStep === "upload" ? "bg-orange-500 text-white" : "bg-white/10 text-gray-400"
              }`}
            >
              1
            </span>
            <span className={currentStep === "upload" ? "text-white font-medium" : "text-gray-400"}>
              Upload / Scan Image
            </span>
          </div>

          <span className="text-gray-600">→</span>

          <div className="flex items-center gap-2">
            <span
              className={`flex items-center justify-center w-5 h-5 rounded-full font-bold ${
                currentStep === "confirm" ? "bg-orange-500 text-white" : "bg-white/10 text-gray-400"
              }`}
            >
              2
            </span>
            <span className={currentStep === "confirm" ? "text-white font-medium" : "text-gray-400"}>
              Verify & Edit OCR
            </span>
          </div>

          <span className="text-gray-600">→</span>

          <div className="flex items-center gap-2">
            <span
              className={`flex items-center justify-center w-5 h-5 rounded-full font-bold ${
                currentStep === "solved" ? "bg-orange-500 text-white" : "bg-white/10 text-gray-400"
              }`}
            >
              3
            </span>
            <span className={currentStep === "solved" ? "text-white font-medium" : "text-gray-400"}>
              Step-by-Step Solution
            </span>
          </div>
        </div>

        {/* STEP 1: Uploader View */}
        {currentStep === "upload" && (
          <div className="space-y-6">
            <ImageUploader
              onImagesSelected={handleAnalyzeImages}
              onLaunchCamera={() => setIsCameraOpen(true)}
              isAnalyzing={isAnalyzing}
            />

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5">
                <div className="flex items-center gap-2 text-orange-400 font-semibold text-sm">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Handwritten Equations</span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Advanced vision recognizes hand-drawn math, chemistry notation, fractions, and Greek symbols.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5">
                <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
                  <Layers className="h-4 w-4" />
                  <span>Multi-Page Support</span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Add page 1, page 2, and diagram images together. The AI solves them as a unified problem.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                  <Sparkles className="h-4 w-4" />
                  <span>Educational Explanations</span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Never gives unexplained answers. Breaks down Given, Formulas, Sub-steps, and Key Takeaways.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Question Confirmation & Quality Check */}
        {currentStep === "confirm" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Display scanned image preview */}
            <div className="p-4 rounded-2xl glass-panel border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Source Image ({selectedImages.length})
                </span>
                <button
                  onClick={() => setCurrentStep("upload")}
                  className="text-xs text-orange-400 hover:text-orange-300 font-medium"
                >
                  Change Image
                </button>
              </div>

              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {selectedImages.map((img, i) => (
                  <div
                    key={i}
                    className="relative w-40 h-28 rounded-xl overflow-hidden border border-white/20 bg-black shrink-0"
                  >
                    <img src={img} alt={`Source ${i}`} className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 left-1 text-[10px] bg-black/80 px-1.5 py-0.5 rounded text-white">
                      Page {i + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quality Report Alert (Section 13) */}
            {qualityReport && (
              <ImageQualityAlert
                report={qualityReport}
                onRetake={() => setIsCameraOpen(true)}
              />
            )}

            {/* Question Confirmation & Editable OCR (Section 12) */}
            <QuestionDetector
              extractedText={extractedQuestion}
              subject={detectedSubject}
              topic={detectedTopic}
              onSolve={handleSolveQuestion}
              isSolving={isSolving}
            />
          </div>
        )}

        {/* STEP 3: Educational Step-by-Step Solution & Follow-up */}
        {currentStep === "solved" && activeSolution && (
          <div className="space-y-8 animate-fadeIn">
            {/* Display Question Reminder Bar */}
            <div className="p-4 rounded-2xl glass-panel border border-white/10 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-orange-400">
                  Solved Question
                </span>
                <p className="text-sm font-medium text-white italic">
                  "{extractedQuestion}"
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Badge variant="glow" className="text-xs">
                  Solved
                </Badge>
              </div>
            </div>

            {/* Full Step-by-Step Educational Solution */}
            <StepByStepSolution
              solution={activeSolution}
              onFollowUpAction={handleFollowUpMessage}
              onSave={() => setIsSaved(!isSaved)}
              isSaved={isSaved}
            />

            {/* Follow-Up Chat Area */}
            <FollowUpChat
              initialChats={followUpChats}
              onSendMessage={handleFollowUpMessage}
            />

            {/* Practice Similar & Next Actions Footer */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-orange-500/15 via-amber-500/10 to-transparent border border-orange-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-base font-bold text-white">
                  Ready to master {activeSolution.topic}?
                </h4>
                <p className="text-xs text-gray-300">
                  Practice 5 curated problems testing this exact concept to reinforce your learning.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {onNavigateToPractice && (
                  <Button
                    variant="gradient"
                    size="md"
                    onClick={() => onNavigateToPractice(activeSolution.topic)}
                    className="font-semibold shadow-glow-amber text-xs"
                  >
                    Practice This Topic
                  </Button>
                )}
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleReset}
                  className="text-xs"
                >
                  Solve Another
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
