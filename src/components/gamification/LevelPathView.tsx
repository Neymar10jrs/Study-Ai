import React, { useState } from 'react';
import { Lock, CheckCircle2, ChevronRight, Zap, ArrowRight } from 'lucide-react';
import { LearningLevel, SubjectId } from '../../types';
import { LevelCard } from './LevelCard';
import { cn } from '../../lib/utils';

interface LevelPathViewProps {
  levels: LearningLevel[];
  subjectName: string;
  onSelectLevel: (level: LearningLevel) => void;
  currentLevelNumber: number;
}

export function LevelPathView({ levels, subjectName, onSelectLevel, currentLevelNumber }: LevelPathViewProps) {
  const [selectedLevel, setSelectedLevel] = useState<LearningLevel | null>(null);

  return (
    <div className="space-y-4">
      <div className="text-center space-y-1">
        <h3 className="text-lg font-bold text-white">Learning Path — {subjectName}</h3>
        <p className="text-xs text-gray-400">Complete each level to unlock the next. Your progress is saved securely.</p>
      </div>

      {/* Level path: vertical on mobile, horizontal on lg */}
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-start">
        {levels.map((level, i) => (
          <React.Fragment key={level.number}>
            <div className="flex-1">
              <LevelCard
                level={level}
                isActive={level.number === currentLevelNumber}
                onClick={() => {
                  setSelectedLevel(level);
                  onSelectLevel(level);
                }}
              />
            </div>
            {i < levels.length - 1 && (
              <div className="hidden lg:flex items-center text-gray-600">
                <ArrowRight className="h-5 w-5" />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Level unlock requirement notice */}
      <div className="glass-panel border border-white/5 rounded-xl p-3 flex items-start gap-2">
        <Lock className="h-4 w-4 text-gray-500 mt-0.5 shrink-0" />
        <p className="text-xs text-gray-400 leading-relaxed">
          <strong className="text-gray-300">Level locking is enforced by your XP score.</strong>{' '}
          You cannot skip levels by changing URLs or browser storage — each level requires the XP earned from the previous one.
        </p>
      </div>
    </div>
  );
}
