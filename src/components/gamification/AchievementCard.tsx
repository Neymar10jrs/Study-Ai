import React from 'react';
import { Lock } from 'lucide-react';
import { Achievement } from '../../types';
import { cn } from '../../lib/utils';

interface AchievementCardProps {
  achievement: Achievement;
  onClick?: () => void;
}

const rarityConfig = {
  common: { border: 'border-gray-500/30', bg: 'from-gray-500/10', glow: '', label: 'Common', text: 'text-gray-400' },
  rare: { border: 'border-blue-500/40', bg: 'from-blue-500/15', glow: 'shadow-blue-500/20', label: 'Rare', text: 'text-blue-400' },
  epic: { border: 'border-purple-500/40', bg: 'from-purple-500/15', glow: 'shadow-purple-500/20', label: 'Epic', text: 'text-purple-400' },
  legendary: { border: 'border-amber-500/50', bg: 'from-amber-500/20', glow: 'shadow-amber-500/30', label: 'Legendary', text: 'text-amber-400' },
};

export function AchievementCard({ achievement, onClick }: AchievementCardProps) {
  const rarity = rarityConfig[achievement.rarity];
  const isLocked = !achievement.isUnlocked;

  return (
    <div
      onClick={onClick}
      className={cn(
        'glass-panel rounded-xl p-4 border cursor-pointer transition-all duration-200 hover:scale-[1.02] space-y-2',
        rarity.border,
        `bg-gradient-to-br ${rarity.bg} to-transparent`,
        isLocked && 'opacity-60 grayscale-[40%]',
        onClick && 'cursor-pointer'
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn('text-3xl relative', isLocked && 'blur-sm')}>
          {isLocked ? '❓' : achievement.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={cn('text-xs font-bold uppercase tracking-wider', rarity.text)}>{rarity.label}</span>
            {achievement.isUnlocked && (
              <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded px-1.5 py-0.5">✓ Earned</span>
            )}
          </div>
          <div className="text-sm font-bold text-white mt-0.5">{isLocked ? '???' : achievement.name}</div>
          <div className="text-xs text-gray-400 mt-0.5 line-clamp-2">{isLocked ? achievement.condition : achievement.description}</div>
        </div>
      </div>

      {/* Progress bar */}
      {!achievement.isUnlocked && achievement.progress > 0 && (
        <div className="space-y-1">
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400"
              style={{ width: `${achievement.progress}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 text-right">{Math.round(achievement.progress)}%</div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">{achievement.xpReward} XP reward</span>
        {isLocked && <Lock className="h-3 w-3 text-gray-500" />}
      </div>
    </div>
  );
}
