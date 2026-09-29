import React, { useState, useEffect } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { INITIAL_SUBJECTS } from "@/services/mockData";
import { Search, BookOpen, Sparkles, ArrowRight, Camera } from "lucide-react";

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (type: "tutor" | "solve" | "subject" | "practice", param?: string) => void;
}

export function GlobalSearchModal({ isOpen, onClose, onSelectAction }: GlobalSearchModalProps) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        // toggle if handled by caller or state
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const results = [
    { type: "action" as const, title: "📷 Scan or Photograph Question", desc: "Open vision camera solver", action: () => onSelectAction("solve") },
    { type: "tutor" as const, title: "Ask AI Tutor: 'Explain Newton's Laws'", desc: "Physics Mechanics", action: () => onSelectAction("tutor", "Explain Newton's Laws") },
    { type: "tutor" as const, title: "Ask AI Tutor: 'Integration by Parts derivation'", desc: "Calculus", action: () => onSelectAction("tutor", "Integration by Parts derivation") },
    { type: "subject" as const, title: "Mathematics Hub", desc: "Calculus, Algebra & Trigonometry", action: () => onSelectAction("subject", "mathematics") },
    { type: "subject" as const, title: "Physics Hub", desc: "Mechanics, Optics & Thermodynamics", action: () => onSelectAction("subject", "physics") },
    { type: "subject" as const, title: "Chemistry Hub", desc: "Organic mechanisms & chemical bonding", action: () => onSelectAction("subject", "chemistry") },
  ].filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.desc.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Search className="h-5 w-5 text-orange-400" />
          <span>Quick Search</span>
        </div>
      }
      description="Jump straight to any subject, topic, formula, or tool."
      maxWidth="md"
    >
      <div className="space-y-4 pt-2">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a subject, question, or formula..."
            className="pl-9"
            autoFocus
          />
        </div>

        <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
          {results.length === 0 ? (
            <div className="py-6 text-center text-xs text-gray-500">
              No matching subjects or tools found.
            </div>
          ) : (
            results.map((item, idx) => (
              <div
                key={idx}
                onClick={() => {
                  item.action();
                  onClose();
                }}
                className="p-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-orange-500/30 cursor-pointer transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-white/5 text-orange-400">
                    {item.type === "action" ? <Camera className="h-4 w-4" /> : <BookOpen className="h-4 w-4" />}
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-white group-hover:text-orange-300">
                      {item.title}
                    </h5>
                    <p className="text-xs text-gray-400">{item.desc}</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-500 group-hover:text-orange-400 group-hover:translate-x-1 transition-all" />
              </div>
            ))
          )}
        </div>
      </div>
    </Dialog>
  );
}
