import React from 'react';
import { Lock, CheckCircle2, ChevronRight, Star } from 'lucide-react';
import { LearningLevel } from '../../types';
import { cn } from '../../lib/utils';

interface LevelCardProps {
  level: LearningLevel;
  isActive?: boolean;
  onClick?: () => void;
}

const levelColorMap: Record<string, { ring: string; bg: string; text: string; progress: string }> = {
  emerald: { ring: 'border-emerald-500/50', bg: 'from-emerald-500/15', text: 'text-emerald-400', progress: 'from-emerald-500 to-teal-400' },
  blue: { ring: 'border-blue-500/50', bg: 'from-blue-500/15', text: 'text-blue-400', progress: 'from-blue-500 to-cyan-400' },
  purple: { ring: 'border-purple-500/50', bg: 'from-purple-500/15', text: 'text-purple-400', progress: 'from-purple-500 to-violet-400' },
  orange: { ring: 'border-orange-500/50', bg: 'from-orange-500/15', text: 'text-orange-400', progress: 'from-orange-500 to-amber-400' },
  amber: { ring: 'border-amber-500/60', bg: 'from-amber-500/20', text: 'text-amber-400', progress: 'from-amber-500 to-yellow-400' },
};

export function LevelCard({ level, isActive, onClick }: LevelCardProps) {
  const colors = levelColorMap[level.color] || levelColorMap['orange'];
  const isLocked = level.status === 'locked';
  const isCompleted = level.status === 'completed';
  const progressPct = level.topicsCount > 0 ? (level.completedTopics / level.topicsCount) * 100 : 0;
  const xpProgressPct = level.xpRequired > 0 ? Math.min(100, (level.xpEarned / level.xpRequired) * 100) : 100;

  return (
    <div
      onClick={!isLocked ? onClick : undefined}
      className={cn(
        'glass-panel border rounded-2xl p-5 transition-all duration-200 relative',
        colors.ring,
        `bg-gradient-to-br ${colors.bg} to-transparent`,
        isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-[1.01] hover:shadow-lg',
        isActive && 'ring-2 ring-offset-1 ring-offset-transparent ring-orange-500/60',
      )}
    >
      {/* Level number badge */}
      <div className="flex items-start justify-between mb-3">
        <div className={cn('flex items-center gap-2')}>
          <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center text-xl font-extrabold border', colors.ring,
            isLocked ? 'bg-white/5 text-gray-500' : `bg-gradient-to-br ${colors.bg} ${colors.text}`
          )}>
            {isLocked ? <Lock className="h-4 w-4" /> : isCompleted ? <CheckCircle2 className="h-5 w-5" /> : level.icon}
          </div>
          <div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Level {level.number}</div>
            <div className={cn('text-base font-extrabold', isLocked ? 'text-gray-500' : 'text-white')}>{level.name}</div>
          </div>
        </div>
        {!isLocked && <ChevronRight className={cn('h-4 w-4 mt-1', colors.text)} />}
      </div>

      <p className="text-xs text-gray-400 mb-3 leading-relaxed">{level.description}</p>

      {/* Progress bar */}
      {!isLocked && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-400">
            <span>{level.completedTopics}/{level.topicsCount} topics</span>
            <span className={colors.text}>{Math.round(progressPct)}%</span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
            <div
              className={cn('h-full rounded-full bg-gradient-to-r transition-all duration-500', colors.progress)}
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      )}

      {isLocked && (
        <div className="text-xs text-gray-500 flex items-center gap-1 mt-2">
          <Lock className="h-3 w-3" />
          <span>Requires {level.xpRequired} XP to unlock</span>
        </div>
      )}
    </div>
  );
}
