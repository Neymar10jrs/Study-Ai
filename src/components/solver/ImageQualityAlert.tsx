import React from "react";
import { ImageQualityReport } from "@/types";
import { AlertCircle, CheckCircle2, ShieldCheck, PenTool, Code, Binary, Image as ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ImageQualityAlertProps {
  report: ImageQualityReport;
  onRetake?: () => void;
}

export function ImageQualityAlert({ report, onRetake }: ImageQualityAlertProps) {
  const { isReadable, score, issues, warningMessage, detectionTypes } = report;

  return (
    <div className="space-y-3">
      {/* Readability & Quality Status Card */}
      <div
        className={`p-4 rounded-xl border transition-all ${
          isReadable
            ? "bg-emerald-500/[0.08] border-emerald-500/25"
            : "bg-amber-500/[0.12] border-amber-500/35"
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            {isReadable ? (
              <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
            )}
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-sm font-bold ${
                    isReadable ? "text-emerald-300" : "text-amber-300"
                  }`}
                >
                  {isReadable ? "Image Quality Verified" : "Image Readability Warning"}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-black/40 text-gray-300 border border-white/10 font-mono">
                  Readability Score: {score}%
                </span>
              </div>

              {warningMessage && (
                <p className="text-xs sm:text-sm text-gray-300 mt-1 leading-relaxed">
                  {warningMessage}
                </p>
              )}

              {issues.length > 0 && (
                <ul className="mt-2 space-y-1 text-xs text-amber-200/90 list-disc list-inside">
                  {issues.map((issue, idx) => (
                    <li key={idx}>{issue}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {onRetake && !isReadable && (
            <button
              onClick={onRetake}
              className="text-xs text-amber-300 hover:text-white underline shrink-0 font-medium"
            >
              Re-scan / Retake
            </button>
          )}
        </div>
      </div>

      {/* Detected Content Features Chips */}
      <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
        <span className="text-gray-400 mr-1">AI Detected Elements:</span>
        {detectionTypes.hasHandwriting && (
          <Badge variant="warning" className="gap-1">
            <PenTool className="h-3 w-3" /> Handwritten Text
          </Badge>
        )}
        {detectionTypes.hasEquations && (
          <Badge variant="glow" className="gap-1">
            <Binary className="h-3 w-3" /> Math Equations
          </Badge>
        )}
        {detectionTypes.hasDiagrams && (
          <Badge variant="amber" className="gap-1">
            <ImageIcon className="h-3 w-3" /> Educational Diagram / Graph
          </Badge>
        )}
        {detectionTypes.hasPrintedText && (
          <Badge variant="secondary" className="gap-1">
            <CheckCircle2 className="h-3 w-3 text-emerald-400" /> Printed Text
          </Badge>
        )}
        {detectionTypes.hasCode && (
          <Badge variant="secondary" className="gap-1">
            <Code className="h-3 w-3 text-blue-400" /> Programming Code
          </Badge>
        )}
      </div>
    </div>
  );
}
