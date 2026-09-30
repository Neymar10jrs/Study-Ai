import React, { useState, useEffect } from 'react';
import {
  Zap, Flame, Trophy, Target, BarChart2, BookOpen, Brain,
  Camera, Lightbulb, TrendingUp, TrendingDown, ArrowRight,
  CheckCircle2, Clock, Star, Calendar, Award
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { cn } from '../../lib/utils';
import { getStudentProfile } from '../../services/storageService';

interface DashboardPageProps {
  onNavigateToSolve?: () => void;
  onNavigateToTutor?: (query?: string) => void;
  onNavigateToPractice?: (subjectId?: string, topic?: string) => void;
}

// Minimal inline XP logic to avoid dependency issues
function getLevelFromXP(xp: number): number {
  if (xp >= 7000) return 5;
  if (xp >= 3500) return 4;
  if (xp >= 1500) return 3;
  if (xp >= 500) return 2;
  return 1;
}

function getRank(xp: number): string {
  if (xp >= 7000) return 'Legend';
  if (xp >= 3500) return 'Expert';
  if (xp >= 1500) return 'Scholar';
  if (xp >= 500) return 'Apprentice';
  return 'Newcomer';
}

const LEVEL_XP: Record<number, number> = { 1: 0, 2: 500, 3: 1500, 4: 3500, 5: 7000 };

function getWeekData() {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date().getDay();
  return days.map((day, i) => ({
    day,
    xp: i < today ? Math.floor(Math.random() * 120 + 40) : i === today ? 75 : 0,
    questions: i < today ? Math.floor(Math.random() * 12 + 3) : i === today ? 5 : 0,
    isToday: i === today,
  }));
}

const RECOMMENDATIONS = [
  { icon: '🧮', text: 'Practice Integration by Parts — you\'ve missed 3 of 5 recently', action: 'practice', subject: 'mathematics', topic: 'Integration' },
  { icon: '⚡', text: 'Review Kirchhoff\'s Laws — weak area detected this week', action: 'practice', subject: 'physics', topic: 'Circuits' },
  { icon: '📖', text: 'You haven\'t studied Chemistry in 4 days — try a quick revision', action: 'practice', subject: 'chemistry', topic: 'Organic' },
];

export function DashboardPage({ onNavigateToSolve, onNavigateToTutor, onNavigateToPractice }: DashboardPageProps) {
  const profile = getStudentProfile();
  const [weekData] = useState(getWeekData);
  
  // Load/simulate XP from localStorage
  const [totalXP, setTotalXP] = useState(() => {
    try {
      const stored = localStorage.getItem('studyai_xp_profile');
      if (stored) return JSON.parse(stored).totalXP || 320;
    } catch {}
    return 320;
  });
  
  const [streakDays, setStreakDays] = useState(() => {
    try {
      const stored = localStorage.getItem('studyai_xp_profile');
      if (stored) return JSON.parse(stored).streakDays || 3;
    } catch {}
    return 3;
  });

  const currentLevel = getLevelFromXP(totalXP);
  const rank = getRank(totalXP);
  const levelStart = LEVEL_XP[currentLevel];
  const levelEnd = LEVEL_XP[Math.min(5, currentLevel + 1)] || 7000;
  const levelProgress = Math.round(((totalXP - levelStart) / (levelEnd - levelStart)) * 100);
  const xpToNext = Math.max(0, levelEnd - totalXP);
  const maxWeekXP = Math.max(1, ...weekData.map(d => d.xp));
  const totalWeekXP = weekData.reduce((s, d) => s + d.xp, 0);
  const totalWeekQ = weekData.reduce((s, d) => s + d.questions, 0);

  return (
    <div className="min-h-screen bg-[#090a0f] py-8 px-4">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-white">My Learning Hub</h1>
            <p className="text-sm text-gray-400">Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {profile.name.split(' ')[0]}! Keep the streak going 🔥</p>
          </div>
          <Badge variant="glow" className="text-xs">{rank}</Badge>
        </div>

        {/* XP Level Card */}
        <div className="glass-panel border border-orange-500/30 rounded-2xl p-5 bg-gradient-to-br from-orange-500/10 via-[#0e101a] to-transparent">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center font-extrabold text-white text-xl shadow-glow-sm">
                {currentLevel}
              </div>
              <div>
                <div className="text-xs text-orange-400 font-semibold uppercase tracking-wider">Level {currentLevel} · {rank}</div>
                <div className="text-base font-bold text-white">
                  {['', 'Foundations', 'Core Concepts', 'Applied Skills', 'Problem Solving', 'Mastery'][currentLevel]}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-orange-400" />
              <span className="text-xl font-extrabold text-white">{totalXP.toLocaleString()} XP</span>
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-gray-400">
              <span>Level {currentLevel} Progress</span>
              <span>{currentLevel < 5 ? `${xpToNext} XP to Level ${currentLevel + 1}` : 'MAX LEVEL'}</span>
            </div>
            <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-orange-500 via-amber-400 to-yellow-400 transition-all duration-700"
                style={{ width: `${Math.min(100, levelProgress)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Questions Today', value: profile.questionsSolvedToday, icon: <Target className="h-4 w-4" />, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
            { label: 'Study Streak', value: `${streakDays}d`, icon: <Flame className="h-4 w-4" />, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
            { label: 'Accuracy', value: `${profile.accuracyRate}%`, icon: <CheckCircle2 className="h-4 w-4" />, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
            { label: 'Week XP', value: totalWeekXP, icon: <Zap className="h-4 w-4" />, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
          ].map(stat => (
            <div key={stat.label} className={cn('glass-panel border rounded-xl p-4 text-center space-y-1', stat.bg)}>
              <div className={cn('flex justify-center', stat.color)}>{stat.icon}</div>
              <div className={cn('text-xl font-extrabold', stat.color)}>{stat.value}</div>
              <div className="text-xs text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Two-column: Weekly Chart + Streak */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Weekly XP Chart */}
          <div className="glass-panel border border-white/10 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-sm">Weekly XP Activity</h3>
              <span className="text-xs text-orange-400 font-semibold">{totalWeekXP} XP this week</span>
            </div>
            <div className="flex items-end gap-1.5 h-20">
              {weekData.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className={cn(
                      'w-full rounded-t-sm transition-all duration-500',
                      d.isToday ? 'bg-gradient-to-t from-orange-500 to-amber-400' :
                      d.xp > 0 ? 'bg-white/20' : 'bg-white/5'
                    )}
                    style={{ height: `${d.xp > 0 ? Math.max(8, (d.xp / maxWeekXP) * 68) : 4}px` }}
                  />
                  <span className="text-xs text-gray-500">{d.day[0]}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>{totalWeekQ} questions answered</span>
              <span>Goal: 1000 XP</span>
            </div>
          </div>

          {/* Streak widget */}
          <div className="glass-panel border border-orange-500/20 rounded-2xl p-5 bg-gradient-to-br from-orange-500/5 to-transparent space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-orange-400" />
                <h3 className="font-bold text-white text-sm">Study Streak</h3>
              </div>
              <div className="text-2xl font-extrabold text-orange-400">{streakDays} 🔥</div>
            </div>
            <div className="flex gap-1.5 justify-between">
              {['S','M','T','W','T','F','S'].map((day, i) => {
                const today = new Date().getDay();
                return (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div className={cn(
                      'w-7 h-7 rounded-full flex items-center justify-center text-xs border',
                      i < today ? 'bg-orange-500/30 border-orange-500/40 text-orange-300' :
                      i === today ? 'bg-orange-500 border-orange-400 text-white font-bold shadow-glow-sm' :
                      'bg-white/5 border-white/10 text-gray-600'
                    )}>
                      {i < today ? '✓' : i === today ? '🔥' : day}
                    </div>
                    <span className="text-xs text-gray-500">{day}</span>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-gray-400">Longest streak: <span className="text-amber-400 font-bold">7 days</span></p>
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="space-y-3">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <Brain className="h-4 w-4 text-orange-400" /> AI Recommendations
          </h3>
          <div className="space-y-2">
            {RECOMMENDATIONS.map((rec, i) => (
              <div key={i} className="glass-panel border border-white/10 rounded-xl px-4 py-3 flex items-center gap-3 hover:border-orange-500/30 transition-all group">
                <span className="text-xl">{rec.icon}</span>
                <p className="text-sm text-gray-300 flex-1">{rec.text}</p>
                <button
                  onClick={() => onNavigateToPractice?.(rec.subject, rec.topic)}
                  className="text-xs text-orange-400 font-semibold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                >
                  Practice <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Strong / Weak Topics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="glass-panel border border-emerald-500/20 rounded-2xl p-4 space-y-3">
            <h3 className="font-bold text-emerald-400 text-sm flex items-center gap-1.5"><TrendingUp className="h-4 w-4" /> Strong Topics</h3>
            <div className="space-y-2">
              {(profile.strongTopics.slice(0, 4) || ['Calculus', 'Mechanics', 'Organic Chemistry']).map(t => (
                <div key={t} className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">{t}</span>
                  <div className="flex items-center gap-1">
                    <div className="w-20 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.floor(Math.random() * 25 + 75)}%` }} />
                    </div>
                    <span className="text-xs text-emerald-400">✓</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="glass-panel border border-red-500/20 rounded-2xl p-4 space-y-3">
            <h3 className="font-bold text-red-400 text-sm flex items-center gap-1.5"><TrendingDown className="h-4 w-4" /> Weak Topics</h3>
            <div className="space-y-2">
              {(profile.weakTopics.slice(0, 4) || ['Integration', 'Thermodynamics', 'Electrochemistry']).map(t => (
                <div key={t} className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">{t}</span>
                  <button
                    onClick={() => onNavigateToPractice?.(undefined, t)}
                    className="text-xs text-orange-400 hover:text-orange-300 flex items-center gap-0.5"
                  >
                    Revise <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Start Practice', icon: <Target className="h-5 w-5" />, color: 'text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10', action: () => onNavigateToPractice?.() },
            { label: 'Ask AI Tutor', icon: <Brain className="h-5 w-5" />, color: 'text-orange-400 border-orange-500/30 hover:bg-orange-500/10', action: () => onNavigateToTutor?.() },
            { label: 'Scan Question', icon: <Camera className="h-5 w-5" />, color: 'text-amber-400 border-amber-500/30 hover:bg-amber-500/10', action: onNavigateToSolve },
            { label: 'View Subjects', icon: <BookOpen className="h-5 w-5" />, color: 'text-blue-400 border-blue-500/30 hover:bg-blue-500/10', action: () => {} },
          ].map(a => (
            <button
              key={a.label}
              onClick={a.action}
              className={cn('glass-panel border rounded-xl p-4 flex flex-col items-center gap-2 text-center transition-all duration-200 hover:scale-[1.02]', a.color)}
            >
              {a.icon}
              <span className="text-xs font-semibold text-white">{a.label}</span>
            </button>
          ))}
        </div>

      </div>
    </div>
  );
}
