import React, { useState } from "react";
import { DetailedSolution } from "@/types";
import { MathRenderer, FormattedContent } from "@/components/tutor/MathRenderer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  CheckCircle2,
  Copy,
  Bookmark,
  Share2,
  Sparkles,
  ArrowRight,
  Code2,
  FlaskConical,
  Calculator,
  Compass,
  FileText,
  Lightbulb,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp
} from "lucide-react";

interface StepByStepSolutionProps {
  solution: DetailedSolution;
  onFollowUpAction?: (actionText: string) => void;
  onSave?: () => void;
  isSaved?: boolean;
}

export function StepByStepSolution({
  solution,
  onFollowUpAction,
  onSave,
  isSaved = false,
}: StepByStepSolutionProps) {
  const [copied, setCopied] = useState(false);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  const handleCopy = () => {
    let textToCopy = `Question Solution (${solution.subject} - ${solution.topic})\n\n`;
    if (solution.directAnswer) textToCopy += `Direct Answer: ${solution.directAnswer}\n\n`;
    if (solution.given?.length) textToCopy += `Given:\n${solution.given.map((g) => `- ${g}`).join("\n")}\n\n`;
    if (solution.formula?.length) textToCopy += `Formulas:\n${solution.formula.map((f) => `- ${f}`).join("\n")}\n\n`;
    textToCopy += `Steps:\n${solution.steps.map((s, i) => `${i + 1}. ${s.title}: ${s.detail}`).join("\n")}\n\n`;
    textToCopy += `Final Answer: ${solution.finalAnswer}\n`;
    textToCopy += `Key Takeaway: ${solution.keyTakeaway}\n`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getSubjectIcon = () => {
    switch (solution.type) {
      case "math":
        return <Calculator className="h-5 w-5 text-orange-400" />;
      case "physics":
        return <Compass className="h-5 w-5 text-amber-400" />;
      case "chemistry":
        return <FlaskConical className="h-5 w-5 text-emerald-400" />;
      case "programming":
        return <Code2 className="h-5 w-5 text-blue-400" />;
      default:
        return <FileText className="h-5 w-5 text-purple-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Solution Header Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent border border-orange-500/20">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-orange-500/20 border border-orange-500/30">
            {getSubjectIcon()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold tracking-wider text-orange-400">
                {solution.subject}
              </span>
              <span className="text-gray-500">•</span>
              <span className="text-xs text-gray-300">{solution.topic}</span>
            </div>
            <h3 className="text-lg font-bold text-white">Step-by-Step Educational Solution</h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleCopy}
            className="text-xs gap-1.5"
          >
            <Copy className="h-3.5 w-3.5" />
            {copied ? "Copied!" : "Copy Solution"}
          </Button>

          {onSave && (
            <Button
              variant={isSaved ? "outline" : "secondary"}
              size="sm"
              onClick={onSave}
              className={`text-xs gap-1.5 ${isSaved ? "border-orange-500 text-orange-300" : ""}`}
            >
              <Bookmark className={`h-3.5 w-3.5 ${isSaved ? "fill-orange-400" : ""}`} />
              {isSaved ? "Saved" : "Save"}
            </Button>
          )}
        </div>
      </div>

      {/* 1. Direct Answer if present */}
      {solution.directAnswer && (
        <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/30">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="h-5 w-5 text-orange-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-semibold uppercase text-orange-300 tracking-wider">
                Direct Answer
              </span>
              <p className="text-base font-medium text-white mt-1">
                <FormattedContent text={solution.directAnswer} />
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2. Math / Physics: Given & Required */}
      {(solution.given?.length || solution.required?.length) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {solution.given && solution.given.length > 0 && (
            <Card className="p-4 bg-white/[0.03] border-white/10">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                Given Information
              </h4>
              <ul className="space-y-1.5 text-sm text-gray-200">
                {solution.given.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-orange-400 font-mono text-xs">▸</span>
                    <div>
                      <FormattedContent text={item} />
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {solution.required && solution.required.length > 0 && (
            <Card className="p-4 bg-white/[0.03] border-white/10">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                Required to Find / Prove
              </h4>
              <ul className="space-y-1.5 text-sm text-gray-200">
                {solution.required.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-400 font-mono text-xs">▸</span>
                    <div>
                      <FormattedContent text={item} />
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      )}

      {/* 3. Formulas & Principles Used */}
      {solution.formula && solution.formula.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-500/[0.07] border border-amber-500/25">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="h-4 w-4 text-amber-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
              Formulas & Principles
            </span>
          </div>
          <div className="space-y-2">
            {solution.formula.map((f, idx) => (
              <div key={idx} className="p-2.5 rounded-lg bg-black/40 border border-white/5">
                <FormattedContent text={f} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Chemistry Specific: Reactants, Products, Reaction */}
      {solution.type === "chemistry" && (
        <div className="space-y-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25">
          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-2">
            <FlaskConical className="h-4 w-4" />
            Chemical Reaction Analysis
          </h4>

          {solution.chemicalEquation && (
            <div className="p-3 bg-black/50 rounded-xl border border-emerald-500/30 text-center font-mono text-emerald-200">
              <FormattedContent text={solution.chemicalEquation} />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {solution.reactants && (
              <div className="p-2.5 rounded-lg bg-black/30 border border-white/5">
                <span className="text-gray-400 font-semibold block mb-1">Reactants:</span>
                <span className="text-gray-200">{solution.reactants.join(", ")}</span>
              </div>
            )}
            {solution.products && (
              <div className="p-2.5 rounded-lg bg-black/30 border border-white/5">
                <span className="text-gray-400 font-semibold block mb-1">Products:</span>
                <span className="text-gray-200">{solution.products.join(", ")}</span>
              </div>
            )}
          </div>

          {solution.reactionConditions && (
            <div className="text-xs text-gray-300">
              <strong className="text-emerald-300">Conditions:</strong> {solution.reactionConditions}
            </div>
          )}

          {solution.reasoning && (
            <div className="text-sm text-gray-300 leading-relaxed border-t border-white/10 pt-2">
              <strong className="text-white block mb-1">Chemical Reasoning:</strong>
              <FormattedContent text={solution.reasoning} />
            </div>
          )}
        </div>
      )}

      {/* 5. Programming Specific: Problem, Logic & Code */}
      {solution.type === "programming" && (
        <div className="space-y-4">
          {solution.problemStatement && (
            <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-sm text-blue-200">
              <strong className="text-white block mb-1">Problem Specification:</strong>
              {solution.problemStatement}
            </div>
          )}

          {solution.logicExplanation && (
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
              <h4 className="text-xs font-bold uppercase tracking-wider text-blue-300 mb-2">
                Algorithm & Logic Breakdown
              </h4>
              <ul className="space-y-1.5 text-sm text-gray-300">
                {solution.logicExplanation.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-blue-400 text-xs">▸</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {solution.code && (
            <div className="rounded-xl overflow-hidden border border-white/10 bg-[#0d0f18]">
              <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  <span className="text-xs text-gray-400 ml-2 font-mono">
                    {solution.programmingLanguage || "Solution.cpp"}
                  </span>
                </div>
                <button
                  onClick={() => navigator.clipboard.writeText(solution.code!)}
                  className="text-xs text-gray-400 hover:text-white flex items-center gap-1"
                >
                  <Copy className="h-3 w-3" /> Copy Code
                </button>
              </div>
              <pre className="p-4 text-xs sm:text-sm font-mono text-orange-200 overflow-x-auto leading-relaxed">
                <code>{solution.code}</code>
              </pre>
            </div>
          )}

          {solution.lineByLineExplanation && solution.lineByLineExplanation.length > 0 && (
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                Line-by-Line Code Walkthrough
              </h4>
              {solution.lineByLineExplanation.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm pb-2 border-b border-white/5 last:border-0">
                  <span className="px-2 py-0.5 rounded bg-white/10 text-orange-300 font-mono shrink-0">
                    Line {item.line}
                  </span>
                  <span className="text-gray-300">{item.explanation}</span>
                </div>
              ))}
            </div>
          )}

          {solution.expectedOutput && (
            <div className="p-3 rounded-xl bg-black/60 border border-white/10 font-mono text-xs text-emerald-400">
              <span className="text-gray-500 block mb-1 text-[10px] uppercase tracking-wider">Output</span>
              {solution.expectedOutput}
            </div>
          )}
        </div>
      )}

      {/* 6. Step-by-Step Educational Solution Sequence */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold uppercase tracking-wider text-gray-300 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-orange-400" />
          Step-by-Step Walkthrough
        </h4>

        <div className="space-y-3">
          {solution.steps.map((step, idx) => {
            const isStepExpanded = expandedStep === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-200 overflow-hidden"
              >
                <div
                  className="flex items-center justify-between p-4 cursor-pointer"
                  onClick={() => setExpandedStep(isStepExpanded ? null : idx)}
                >
                  <div className="flex items-start gap-3">
                    <span className="flex items-center justify-center h-6 w-6 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 text-white text-xs font-bold shrink-0 mt-0.5 shadow-sm">
                      {idx + 1}
                    </span>
                    <div>
                      <h5 className="text-sm font-semibold text-white">
                        {step.title}
                      </h5>
                      <div className="text-xs sm:text-sm text-gray-300 mt-1">
                        <FormattedContent text={step.detail} />
                      </div>
                    </div>
                  </div>

                  <button
                    className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
                    aria-label="Toggle step details"
                  >
                    {isStepExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                </div>

                {/* Substeps or Extra formula */}
                {(isStepExpanded || step.mathExpression || step.substeps) && (
                  <div className="px-4 pb-4 pt-1 border-t border-white/5 space-y-2 text-xs sm:text-sm">
                    {step.mathExpression && (
                      <div className="p-2.5 rounded-lg bg-black/40 border border-white/5 text-center">
                        <MathRenderer content={step.mathExpression} block={true} />
                      </div>
                    )}

                    {step.substeps && (
                      <div className="space-y-1.5 pl-4 border-l-2 border-orange-500/30">
                        {step.substeps.map((sub, sIdx) => (
                          <div key={sIdx} className="text-gray-300">
                            <span className="text-orange-400 mr-1.5">•</span>
                            <FormattedContent text={sub} />
                          </div>
                        ))}
                      </div>
                    )}

                    {step.note && (
                      <div className="flex items-center gap-1.5 text-xs text-amber-300/90 italic pt-1">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        <span>{step.note}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 7. Final Answer Highlight Box */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-orange-500/20 via-amber-500/15 to-orange-500/10 border-2 border-orange-500/40 shadow-glow-sm">
        <span className="text-xs font-bold uppercase tracking-wider text-orange-300 block mb-1">
          Final Answer
        </span>
        <div className="text-lg sm:text-xl font-bold text-white">
          <FormattedContent text={solution.finalAnswer} />
        </div>
      </div>

      {/* 8. Concept Used & Key Takeaway */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-1">
            Concept Tested
          </span>
          <p className="text-sm font-semibold text-orange-200">
            {solution.conceptUsed}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-1">
            Key Educational Takeaway
          </span>
          <p className="text-sm text-gray-300 leading-relaxed">
            {solution.keyTakeaway}
          </p>
        </div>
      </div>

      {/* Common Mistakes Warning if available */}
      {solution.commonMistakes && solution.commonMistakes.length > 0 && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-red-300">
              Common Mistakes to Avoid
            </span>
          </div>
          <ul className="space-y-1 text-xs sm:text-sm text-red-200/90 list-disc list-inside">
            {solution.commonMistakes.map((mistake, idx) => (
              <li key={idx}>{mistake}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Section 18: Interactive AI Follow-Up Quick Buttons */}
      {onFollowUpAction && (
        <div className="pt-4 border-t border-white/10">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-3 flex items-center gap-1.5">
            <HelpCircle className="h-4 w-4 text-orange-400" />
            Have questions about this solution?
          </span>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onFollowUpAction("Why did you use this formula?")}
              className="text-xs"
            >
              Why this formula?
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onFollowUpAction("Can you explain step 2 in more detail?")}
              className="text-xs"
            >
              Explain Step 2
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onFollowUpAction("Explain this concept simply like I am 12 years old")}
              className="text-xs"
            >
              Explain Simpler
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onFollowUpAction("Give me a similar practice problem with solution")}
              className="text-xs text-amber-300 border-amber-500/30"
            >
              Practice Similar Question
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => onFollowUpAction("What is the real-world application of this concept?")}
              className="text-xs"
            >
              Real-World Example
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
