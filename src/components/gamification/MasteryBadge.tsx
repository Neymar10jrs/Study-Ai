import React from 'react';
import { MasteryTier } from '../../types';
import { cn } from '../../lib/utils';

interface MasteryBadgeProps {
  percent: number;
  tier: MasteryTier;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const tierConfig: Record<MasteryTier, { color: string; bg: string; border: string; icon: string }> = {
  Novice: { color: 'text-gray-400', bg: 'bg-gray-500/20', border: 'border-gray-500/30', icon: '🌱' },
  Beginner: { color: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/30', icon: '📘' },
  Intermediate: { color: 'text-purple-400', bg: 'bg-purple-500/20', border: 'border-purple-500/30', icon: '⚡' },
  Advanced: { color: 'text-orange-400', bg: 'bg-orange-500/20', border: 'border-orange-500/30', icon: '🔥' },
  Master: { color: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500/30', icon: '👑' },
};

export function MasteryBadge({ percent, tier, size = 'md', showLabel = true }: MasteryBadgeProps) {
  const cfg = tierConfig[tier];
  const sizeClasses = size === 'sm' ? 'text-xs px-1.5 py-0.5' : size === 'lg' ? 'text-sm px-3 py-1.5' : 'text-xs px-2 py-1';

  return (
    <div className={cn('inline-flex items-center gap-1.5 rounded-full border font-medium', cfg.bg, cfg.border, cfg.color, sizeClasses)}>
      <span>{cfg.icon}</span>
      {showLabel && <span>{tier}</span>}
      {showLabel && <span className="opacity-60">({percent}%)</span>}
    </div>
  );
}
