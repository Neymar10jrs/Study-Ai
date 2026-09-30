import React from 'react';
import { Flame, Zap } from 'lucide-react';
import { cn } from '../../lib/utils';

interface StreakDisplayProps {
  streakDays: number;
  longestStreak: number;
  compact?: boolean;
}

export function StreakDisplay({ streakDays, longestStreak, compact }: StreakDisplayProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-1 bg-orange-500/15 border border-orange-500/25 rounded-full px-2.5 py-1">
        <Flame className="h-3.5 w-3.5 text-orange-400" />
        <span className="text-xs font-bold text-orange-300">{streakDays}d</span>
      </div>
    );
  }

  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const today = new Date().getDay();

  return (
    <div className="glass-panel border border-orange-500/30 rounded-2xl p-4 space-y-3 bg-gradient-to-br from-orange-500/10 to-transparent">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame className={cn('h-5 w-5', streakDays > 0 ? 'text-orange-400' : 'text-gray-500')} />
          <span className="font-bold text-white">Study Streak</span>
        </div>
        <div className="text-right">
          <div className="text-2xl font-extrabold text-orange-400">{streakDays}</div>
          <div className="text-xs text-gray-400">days</div>
        </div>
      </div>

      {/* Week dots */}
      <div className="flex gap-1.5 justify-between">
        {dayLabels.map((day, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div className={cn(
              'w-7 h-7 rounded-full flex items-center justify-center text-xs border transition-all',
              i < today ? 'bg-orange-500/30 border-orange-500/50 text-orange-300' :
              i === today ? 'bg-orange-500 border-orange-400 text-white shadow-glow-sm font-bold' :
              'bg-white/5 border-white/10 text-gray-600'
            )}>
              {i === today ? '🔥' : i < today ? '✓' : day}
            </div>
            <span className="text-xs text-gray-500">{day}</span>
          </div>
        ))}
      </div>

      <div className="text-xs text-gray-400">
        Best streak: <span className="text-amber-400 font-bold">{longestStreak} days</span>
      </div>
    </div>
  );
}
