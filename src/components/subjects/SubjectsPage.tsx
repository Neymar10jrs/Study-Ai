import React, { useState } from "react";
import { INITIAL_SUBJECTS } from "@/services/mockData";
import { SubjectInfo } from "@/types";
import { SubjectDetailModal } from "./SubjectDetailModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  BookOpen,
  Search,
  Plus,
  BrainCircuit,
  FileText,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Calculator,
  Compass,
  FlaskConical,
  Dna,
  Code2,
  Landmark,
  Globe2,
  FileSpreadsheet,
  Briefcase
} from "lucide-react";

interface SubjectsPageProps {
  onLaunchTutor: (subjectName: string) => void;
  onLaunchPractice: (subjectId: string, topic?: string) => void;
  onLaunchNotes: (subjectName: string) => void;
  onLaunchQuiz: (subjectName: string) => void;
}

export function SubjectsPage({
  onLaunchTutor,
  onLaunchPractice,
  onLaunchNotes,
  onLaunchQuiz,
}: SubjectsPageProps) {
  const [subjects, setSubjects] = useState<SubjectInfo[]>(INITIAL_SUBJECTS);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSubject, setActiveSubject] = useState<SubjectInfo | null>(null);

  // Custom Subject Modal
  const [isAddCustomOpen, setIsAddCustomOpen] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [newSubjectCategory, setNewSubjectCategory] = useState<"STEM" | "Humanities" | "Commerce" | "General">("STEM");
  const [newSubjectDesc, setNewSubjectDesc] = useState("");

  const categories = ["All", "STEM", "Humanities", "Commerce", "General"];

  const filteredSubjects = subjects.filter((s) => {
    const matchesCat = selectedCategory === "All" || s.category === selectedCategory;
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.popularTopics.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const handleAddCustomSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName.trim()) return;

    const newSubject: SubjectInfo = {
      id: newSubjectName.toLowerCase().replace(/\s+/g, "-"),
      name: newSubjectName.trim(),
      icon: "BookOpen",
      category: newSubjectCategory,
      description: newSubjectDesc.trim() || `Custom study curriculum for ${newSubjectName.trim()}.`,
      topicsCount: 15,
      masteryPercent: 0,
      popularTopics: ["Unit 1: Fundamentals", "Unit 2: Core Concepts", "Unit 3: Exam Review"],
      color: "from-orange-500 to-amber-500",
    };

    setSubjects((prev) => [newSubject, ...prev]);
    setIsAddCustomOpen(false);
    setNewSubjectName("");
    setNewSubjectDesc("");
    setActiveSubject(newSubject);
  };

  const getSubjectIconComponent = (icon: string) => {
    switch (icon) {
      case "Calculator": return <Calculator className="h-6 w-6 text-orange-400" />;
      case "Compass": return <Compass className="h-6 w-6 text-amber-400" />;
      case "FlaskConical": return <FlaskConical className="h-6 w-6 text-emerald-400" />;
      case "Dna": return <Dna className="h-6 w-6 text-green-400" />;
      case "Code2": return <Code2 className="h-6 w-6 text-blue-400" />;
      case "Landmark": return <Landmark className="h-6 w-6 text-red-400" />;
      case "Globe2": return <Globe2 className="h-6 w-6 text-cyan-400" />;
      case "TrendingUp": return <TrendingUp className="h-6 w-6 text-amber-500" />;
      case "FileSpreadsheet": return <FileSpreadsheet className="h-6 w-6 text-teal-400" />;
      case "Briefcase": return <Briefcase className="h-6 w-6 text-blue-500" />;
      default: return <BookOpen className="h-6 w-6 text-orange-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-gray-100 py-10 px-4 sm:px-6 lg:px-8">
      {/* Subject Detail Hub Modal */}
      <SubjectDetailModal
        subject={activeSubject}
        isOpen={!!activeSubject}
        onClose={() => setActiveSubject(null)}
        onLaunchTutor={onLaunchTutor}
        onLaunchPractice={onLaunchPractice}
        onLaunchNotes={onLaunchNotes}
        onLaunchQuiz={onLaunchQuiz}
      />

      {/* Add Custom Subject Dialog */}
      <Dialog
        isOpen={isAddCustomOpen}
        onClose={() => setIsAddCustomOpen(false)}
        title="Add Custom Subject"
        description="Add a personalized subject to your curriculum to generate notes, practice sets, and AI tutoring."
        maxWidth="md"
      >
        <form onSubmit={handleAddCustomSubject} className="space-y-4 pt-2">
          <div>
            <label className="text-xs font-medium text-gray-300 block mb-1">Subject Name *</label>
            <Input
              value={newSubjectName}
              onChange={(e) => setNewSubjectName(e.target.value)}
              placeholder="e.g. Environmental Science, Psychology, Sociology..."
              required
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-300 block mb-1">Stream / Category</label>
            <select
              value={newSubjectCategory}
              onChange={(e) => setNewSubjectCategory(e.target.value as any)}
              className="w-full h-10 rounded-xl glass-input px-3 text-sm text-white"
            >
              <option value="STEM" className="bg-[#11131c]">STEM</option>
              <option value="Humanities" className="bg-[#11131c]">Humanities</option>
              <option value="Commerce" className="bg-[#11131c]">Commerce</option>
              <option value="General" className="bg-[#11131c]">General</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-300 block mb-1">Description / Syllabus Focus</label>
            <Input
              value={newSubjectDesc}
              onChange={(e) => setNewSubjectDesc(e.target.value)}
              placeholder="e.g. AP Syllabus, Semester 2 exam prep, research..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsAddCustomOpen(false)}>
              Cancel
            </Button>
            <Button variant="default" size="sm" type="submit">
              Add Subject
            </Button>
          </div>
        </form>
      </Dialog>

      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header & Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-2 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30">
                <BookOpen className="h-5 w-5" />
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Curriculum Subjects & Hubs
              </h1>
            </div>
            <p className="text-sm text-gray-400">
              Each subject includes an AI Tutor, interactive notes, practice questions, quizzes, and mastery tracking.
            </p>
          </div>

          <Button
            variant="default"
            size="md"
            onClick={() => setIsAddCustomOpen(true)}
            className="gap-2 shrink-0 font-semibold"
          >
            <Plus className="h-4 w-4" />
            <span>Add Custom Subject</span>
          </Button>
        </div>

        {/* Filter Bar: Categories & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.03] border border-white/10 overflow-x-auto w-full sm:w-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs px-3.5 py-1.5 rounded-lg font-medium transition-all ${
                  selectedCategory === cat
                    ? "bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-orange-300 border border-orange-500/40 shadow-sm"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search topics, equations, subjects..."
              className="pl-9 text-xs sm:text-sm"
            />
          </div>
        </div>

        {/* Subjects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSubjects.map((sub) => (
            <div
              key={sub.id}
              onClick={() => setActiveSubject(sub)}
              className="glass-panel glass-panel-hover rounded-2xl p-5 cursor-pointer flex flex-col justify-between border border-white/10 group"
            >
              <div>
                {/* Top Row: Icon & Category */}
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10 group-hover:border-orange-500/40 transition-colors">
                    {getSubjectIconComponent(sub.icon)}
                  </div>
                  <Badge variant="secondary" className="text-[11px]">
                    {sub.category}
                  </Badge>
                </div>

                {/* Subject Name & Description */}
                <h3 className="text-lg font-bold text-white group-hover:text-orange-300 transition-colors mb-2">
                  {sub.name}
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed line-clamp-2 mb-4">
                  {sub.description}
                </p>

                {/* Key Topics preview tags */}
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {sub.popularTopics.slice(0, 3).map((t, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] px-2 py-0.5 rounded-md bg-white/[0.04] text-gray-300 border border-white/5"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom: Mastery Bar & Action */}
              <div className="pt-4 border-t border-white/5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Mastery</span>
                  <span className="font-bold text-orange-400">{sub.masteryPercent}%</span>
                </div>
                <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full"
                    style={{ width: `${sub.masteryPercent}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1">
                  <span>{sub.topicsCount} Topics</span>
                  <span className="text-orange-400 group-hover:translate-x-1 transition-transform flex items-center gap-1 font-medium">
                    Open Hub <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
