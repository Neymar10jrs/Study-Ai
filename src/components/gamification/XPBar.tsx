import React from 'react';
import { Zap, Star } from 'lucide-react';

interface XPBarProps {
  totalXP: number;
  currentLevel: number;
  currentLevelXP: number;
  xpToNextLevel: number;
  rank: string;
  compact?: boolean; // if true, show minimal version for navbar
}

export function XPBar({ totalXP, currentLevel, currentLevelXP, xpToNextLevel, rank, compact = false }: XPBarProps) {
  const levelXPTotal = currentLevelXP + xpToNextLevel;
  const progressPct = levelXPTotal > 0 ? Math.min(100, (currentLevelXP / levelXPTotal) * 100) : 0;

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 bg-orange-500/20 border border-orange-500/30 rounded-full px-2 py-0.5">
          <Zap className="h-3 w-3 text-orange-400" />
          <span className="text-xs font-bold text-orange-300">{totalXP} XP</span>
        </div>
        <div className="text-xs text-gray-400">Lv.{currentLevel}</div>
      </div>
    );
  }

  return (
    <div className="glass-panel border border-white/10 rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center font-extrabold text-white text-lg shadow-lg">
            {currentLevel}
          </div>
          <div>
            <div className="text-sm font-bold text-white">Level {currentLevel}</div>
            <div className="text-xs text-orange-400 font-medium">{rank}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 justify-end">
            <Zap className="h-4 w-4 text-orange-400" />
            <span className="text-base font-extrabold text-white">{totalXP.toLocaleString()}</span>
          </div>
          <div className="text-xs text-gray-400">Total XP</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-gray-400">{currentLevelXP} XP this level</span>
          <span className="text-gray-400">{xpToNextLevel > 0 ? `${xpToNextLevel} XP to Level ${currentLevel + 1}` : 'MAX LEVEL'}</span>
        </div>
        <div className="h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-orange-500 via-amber-400 to-yellow-400 transition-all duration-700 ease-out shadow-glow-sm"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
