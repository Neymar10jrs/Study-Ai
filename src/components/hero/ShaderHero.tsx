import React from "react";
import { ShaderCanvas } from "./ShaderCanvas";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Camera,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  BrainCircuit,
  Zap,
  UploadCloud,
  FileQuestion,
  Star,
  Users
} from "lucide-react";

interface ShaderHeroProps {
  onStartLearning: () => void;
  onAskAI: () => void;
  onScanQuestion: () => void;
  onSampleClick: (text: string) => void;
}

export function ShaderHero({
  onStartLearning,
  onAskAI,
  onScanQuestion,
  onSampleClick,
}: ShaderHeroProps) {
  const samplePrompts = [
    "Find derivative of f(x) = x³·sin(x)",
    "Explain Newton's Second Law with real examples",
    "Balance MnO₄⁻ + Fe²⁺ in acidic solution",
    "How does binary search work with code?",
  ];

  return (
    <section className="relative min-h-[92vh] flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 pt-24 pb-16 overflow-hidden">
      {/* Dynamic Animated WebGL Shader Canvas Background */}
      <ShaderCanvas />

      {/* Subtle overlay gradients for depth & contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#090a0f]/40 via-transparent to-[#090a0f] pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-orange-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Hero Container */}
      <div className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center">
        {/* Trust / Category Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.06] border border-orange-500/30 backdrop-blur-xl shadow-glow-sm mb-6 animate-fadeIn">
          <Sparkles className="h-4 w-4 text-amber-400 animate-pulse" />
          <span className="text-xs sm:text-sm font-medium tracking-wide text-orange-200">
            ✨ AI-Powered Learning Assistant
          </span>
        </div>

        {/* Cinematic Headline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white mb-4 leading-[1.1]">
          <span>Learn Smarter.</span>
          <br />
          <span className="gradient-text-warm drop-shadow-sm">
            Understand Everything.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-2xl sm:text-lg md:text-xl text-gray-300 font-normal leading-relaxed mb-8">
          Ask questions, scan problems, understand concepts, create notes, practice, and prepare for exams with your personal AI study assistant.
        </p>

        {/* Interactive Quick Scan & Ask Input Box */}
        <div className="w-full max-w-2xl bg-white/[0.07] border border-white/15 hover:border-orange-500/50 backdrop-blur-2xl rounded-2xl p-2.5 mb-6 shadow-2xl transition-all duration-300">
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <div className="flex items-center gap-2 w-full px-3 py-1">
              <Camera className="h-5 w-5 text-orange-400 shrink-0" />
              <input
                type="text"
                placeholder="Ask any question, formula, or concept..."
                className="w-full bg-transparent text-sm sm:text-base text-white placeholder:text-gray-400 focus:outline-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.target as HTMLInputElement).value.trim()) {
                    onSampleClick((e.target as HTMLInputElement).value);
                  }
                }}
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={onScanQuestion}
                className="w-full sm:w-auto border-orange-500/30 hover:bg-orange-500/20 text-orange-300 gap-1.5"
              >
                <Camera className="h-4 w-4" />
                <span>Scan</span>
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={onAskAI}
                className="w-full sm:w-auto gap-1.5"
              >
                <span>Ask AI</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Sample Prompts */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10 max-w-3xl">
          <span className="text-xs text-gray-400 mr-1 flex items-center gap-1">
            <Zap className="h-3 w-3 text-amber-400" /> Try:
          </span>
          {samplePrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => onSampleClick(prompt)}
              className="text-xs text-gray-300 hover:text-white bg-white/5 hover:bg-orange-500/15 border border-white/10 hover:border-orange-500/40 rounded-lg px-2.5 py-1 transition-all duration-150 text-left"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
          <Button
            size="lg"
            variant="gradient"
            onClick={onStartLearning}
            className="w-full sm:w-auto text-base font-semibold shadow-glow-amber px-8"
          >
            Start Learning Free
            <ArrowRight className="h-5 w-5 ml-1" />
          </Button>

          <Button
            size="lg"
            variant="secondary"
            onClick={onAskAI}
            className="w-full sm:w-auto text-base bg-white/10 hover:bg-white/15 border-white/15 px-8"
          >
            <BrainCircuit className="h-5 w-5 text-orange-400 mr-2" />
            Ask AI
          </Button>
        </div>

        {/* Small feature line */}
        <p className="text-xs sm:text-sm font-medium text-orange-300/80 tracking-wide uppercase">
          AI Tutor • Image Question Solver • Study Tools • Personalized Learning
        </p>

        {/* Live Social Proof / Stats Strip */}
        <div className="mt-14 w-full grid grid-cols-2 md:grid-cols-4 gap-4 pt-8 border-t border-white/10">
          <div className="flex flex-col items-center">
            <span className="text-2xl sm:text-3xl font-extrabold text-white">1.2M+</span>
            <span className="text-xs sm:text-sm text-gray-400 flex items-center gap-1 mt-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Questions Solved
            </span>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-400">98.4%</span>
            <span className="text-xs sm:text-sm text-gray-400 flex items-center gap-1 mt-1">
              <Zap className="h-3.5 w-3.5 text-amber-400" /> Step Accuracy
            </span>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-2xl sm:text-3xl font-extrabold text-white">12+</span>
            <span className="text-xs sm:text-sm text-gray-400 flex items-center gap-1 mt-1">
              <BookOpen className="h-3.5 w-3.5 text-orange-400" /> Core Subjects
            </span>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-400 flex items-center">
              4.9 <Star className="h-5 w-5 fill-amber-400 text-amber-400 ml-1" />
            </span>
            <span className="text-xs sm:text-sm text-gray-400 flex items-center gap-1 mt-1">
              <Users className="h-3.5 w-3.5 text-blue-400" /> 85,000+ Students
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
