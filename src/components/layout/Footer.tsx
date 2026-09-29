import React from "react";
import { Sparkles, Shield, Heart, Github, BookOpen } from "lucide-react";
import { NavTab } from "./Navbar";

interface FooterProps {
  onTabChange: (tab: NavTab) => void;
}

export function Footer({ onTabChange }: FooterProps) {
  return (
    <footer className="border-t border-white/10 bg-[#06070b] text-gray-400 py-12 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-400 p-0.5 shadow-glow-sm">
                <div className="h-full w-full bg-[#090a0f] rounded-[10px] flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-orange-400" />
                </div>
              </div>
              <span className="font-extrabold text-lg text-white">
                Study<span className="text-orange-400">AI</span>
              </span>
            </div>
            <p className="text-sm text-gray-400 max-w-sm leading-relaxed">
              "Learn Smarter. Understand Everything."
              <br />
              The complete AI-powered learning environment built specifically for students.
            </p>
            <div className="flex items-center gap-2 text-xs text-orange-300/90 font-medium">
              <Shield className="h-4 w-4 text-emerald-400" />
              <span>Pedagogical Integrity: Reasoned step solutions, never blind answers.</span>
            </div>
          </div>

          {/* Quick Platform Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Platform</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onTabChange("tutor")} className="hover:text-orange-300 transition-colors">
                  AI Study Tutor
                </button>
              </li>
              <li>
                <button onClick={() => onTabChange("solver")} className="hover:text-orange-300 transition-colors">
                  Image Question Scanner
                </button>
              </li>
              <li>
                <button onClick={() => onTabChange("subjects")} className="hover:text-orange-300 transition-colors">
                  Subjects Curriculum
                </button>
              </li>
              <li>
                <button onClick={() => onTabChange("practice")} className="hover:text-orange-300 transition-colors">
                  Practice & Exam Arena
                </button>
              </li>
              <li>
                <button onClick={() => onTabChange("tools")} className="hover:text-orange-300 transition-colors">
                  Study Tools Suite
                </button>
              </li>
            </ul>
          </div>

          {/* Core Subjects */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Subjects</h4>
            <ul className="space-y-2 text-xs">
              <li>Mathematics & Calculus</li>
              <li>Physics & Mechanics</li>
              <li>Chemistry & Mechanisms</li>
              <li>Computer Science & Algorithms</li>
              <li>Biology & Genetics</li>
              <li>Economics & Humanities</li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright & attribution */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} StudyAI Platform. Built for autonomous and guided student learning.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-gray-400">
              Made with <Heart className="h-3.5 w-3.5 text-orange-500 fill-orange-500" /> for students everywhere
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
