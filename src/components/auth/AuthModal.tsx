import React, { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { setCurrentStudentId, getStudentProfile, saveStudentProfile } from "@/services/storageService";
import { StudentProfile } from "@/types";
import { User, Lock, Mail, GraduationCap, Sparkles, Check, ArrowRight } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (profile: StudentProfile) => void;
}

export function AuthModal({ isOpen, onClose, onAuthSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [gradeLevel, setGradeLevel] = useState("High School (Grade 11-12)");
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (mode === "forgot") {
      setSuccessMsg(`Password reset instructions sent to ${email}. Check your inbox!`);
      return;
    }

    if (!email || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    // Generate isolated student ID from email
    const studentId = `student_${email.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
    setCurrentStudentId(studentId);

    let profile: StudentProfile;

    if (mode === "signup") {
      profile = {
        id: studentId,
        name: name.trim() || email.split("@")[0],
        email: email.trim(),
        gradeLevel: gradeLevel,
        avatarSeed: name || "student",
        studyStreakDays: 1,
        questionsSolvedToday: 0,
        totalQuestionsSolved: 0,
        accuracyRate: 100,
        totalStudyMinutes: 0,
        strongTopics: ["Algebra Fundamentals"],
        weakTopics: [],
        weeklyActivity: [
          { day: "Mon", questions: 0, minutes: 0 },
          { day: "Tue", questions: 0, minutes: 0 },
          { day: "Wed", questions: 0, minutes: 0 },
          { day: "Thu", questions: 0, minutes: 0 },
          { day: "Fri", questions: 0, minutes: 0 },
          { day: "Sat", questions: 0, minutes: 0 },
          { day: "Sun", questions: 0, minutes: 0 },
        ],
        aiRecommendations: ["Welcome! Scan your first textbook or homework question to get started."],
        joinedDate: new Date().toISOString(),
      };
      saveStudentProfile(profile);
    } else {
      // Existing student load
      profile = getStudentProfile(studentId);
    }

    onAuthSuccess(profile);
    onClose();
  };

  // Quick switch demo accounts
  const handleQuickDemoSwitch = (demoName: string, demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("password123");
    setName(demoName);
    const sId = `student_${demoEmail.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
    setCurrentStudentId(sId);
    const profile = getStudentProfile(sId);
    onAuthSuccess(profile);
    onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30">
            <User className="h-5 w-5" />
          </div>
          <span>
            {mode === "login" && "Student Login"}
            {mode === "signup" && "Create Student Account"}
            {mode === "forgot" && "Reset Password"}
          </span>
        </div>
      }
      description="Isolated, secure workspace for your chats, questions, notes, and progress."
      maxWidth="md"
    >
      <div className="space-y-5 pt-2">
        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <div>
              <label className="text-xs font-medium text-gray-300 block mb-1">Full Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Morgan"
                required
              />
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-gray-300 block mb-1">Student Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex.morgan@school.edu"
                className="pl-9"
                required
              />
            </div>
          </div>

          {mode !== "forgot" && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-medium text-gray-300">Password</label>
                {mode === "login" && (
                  <button
                    type="button"
                    onClick={() => setMode("forgot")}
                    className="text-[11px] text-orange-400 hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-9"
                  required
                />
              </div>
            </div>
          )}

          {mode === "signup" && (
            <div>
              <label className="text-xs font-medium text-gray-300 block mb-1">Grade / Level</label>
              <select
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value)}
                className="w-full h-10 rounded-xl glass-input px-3 text-sm text-white"
              >
                <option value="Middle School (Grade 6-8)" className="bg-[#11131c]">Middle School (Grade 6-8)</option>
                <option value="High School (Grade 9-10)" className="bg-[#11131c]">High School (Grade 9-10)</option>
                <option value="Senior High (Grade 11-12)" className="bg-[#11131c]">Senior High (Grade 11-12)</option>
                <option value="Undergraduate College" className="bg-[#11131c]">Undergraduate College</option>
                <option value="Competitive Exams (AP/SAT/JEE/NEET)" className="bg-[#11131c]">Competitive Exams (AP/SAT/JEE/NEET)</option>
              </select>
            </div>
          )}

          <Button variant="gradient" size="md" type="submit" className="w-full font-semibold shadow-glow-amber">
            {mode === "login" && "Sign In to StudyAI"}
            {mode === "signup" && "Create Free Student Account"}
            {mode === "forgot" && "Send Reset Link"}
          </Button>
        </form>

        {/* Switch Mode Links */}
        <div className="text-center text-xs text-gray-400 pt-2 border-t border-white/5">
          {mode === "login" ? (
            <p>
              Don't have an account?{" "}
              <button
                onClick={() => setMode("signup")}
                className="text-orange-400 hover:underline font-semibold ml-1"
              >
                Sign up free
              </button>
            </p>
          ) : (
            <p>
              Already registered?{" "}
              <button
                onClick={() => setMode("login")}
                className="text-orange-400 hover:underline font-semibold ml-1"
              >
                Sign in
              </button>
            </p>
          )}
        </div>

        {/* Demo profiles quick switch */}
        <div className="pt-2 border-t border-white/5 text-center">
          <span className="text-[11px] text-gray-500 block mb-2">Or switch to a demo profile:</span>
          <div className="flex justify-center gap-2">
            <button
              onClick={() => handleQuickDemoSwitch("Alex Morgan", "alex.morgan@student.edu")}
              className="text-xs px-2.5 py-1 rounded-lg bg-white/5 hover:bg-orange-500/20 text-gray-300 hover:text-white border border-white/10"
            >
              Demo: Alex (Grade 12)
            </button>
            <button
              onClick={() => handleQuickDemoSwitch("Sophia Chen", "sophia.chen@school.org")}
              className="text-xs px-2.5 py-1 rounded-lg bg-white/5 hover:bg-orange-500/20 text-gray-300 hover:text-white border border-white/10"
            >
              Demo: Sophia (Grade 10)
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
