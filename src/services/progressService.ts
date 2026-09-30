import { StudentXPProfile, LevelNumber, XPEvent, Achievement, MasteryTier, LearningLevel, LearningPath, TopicNode, SubjectId, WeeklyProgress } from '../types';

const XP_STORAGE_KEY = 'studyai_xp_profile';

const LEVEL_XP_REQUIREMENTS: Record<LevelNumber, number> = {
  1: 0,
  2: 500,
  3: 1500,
  4: 3500,
  5: 7000,
};

const RANK_THRESHOLDS = [
  { minXP: 7000, rank: 'Legend' },
  { minXP: 3500, rank: 'Expert' },
  { minXP: 1500, rank: 'Scholar' },
  { minXP: 500, rank: 'Apprentice' },
  { minXP: 0, rank: 'Newcomer' },
];

export function getMasteryTier(percent: number): MasteryTier {
  if (percent >= 90) return 'Master';
  if (percent >= 70) return 'Advanced';
  if (percent >= 50) return 'Intermediate';
  if (percent >= 25) return 'Beginner';
  return 'Novice';
}

export function getRank(totalXP: number): string {
  return RANK_THRESHOLDS.find(t => totalXP >= t.minXP)?.rank || 'Newcomer';
}

export function getXPToNextLevel(currentLevel: LevelNumber, totalXP: number): number {
  const nextLevel = (currentLevel + 1) as LevelNumber;
  if (nextLevel > 5) return 0;
  return Math.max(0, LEVEL_XP_REQUIREMENTS[nextLevel] - totalXP);
}

export function getCurrentLevelXP(currentLevel: LevelNumber, totalXP: number): number {
  const levelStart = LEVEL_XP_REQUIREMENTS[currentLevel];
  return Math.max(0, totalXP - levelStart);
}

export function getLevelFromXP(totalXP: number): LevelNumber {
  if (totalXP >= LEVEL_XP_REQUIREMENTS[5]) return 5;
  if (totalXP >= LEVEL_XP_REQUIREMENTS[4]) return 4;
  if (totalXP >= LEVEL_XP_REQUIREMENTS[3]) return 3;
  if (totalXP >= LEVEL_XP_REQUIREMENTS[2]) return 2;
  return 1;
}

export function getDefaultXPProfile(): StudentXPProfile {
  const defaultAchievements: Achievement[] = [
    { id: 'first_question', name: 'First Step', description: 'Answer your first question', icon: '🎯', category: 'exploration', isUnlocked: false, progress: 0, condition: 'Answer 1 question', xpReward: 50, rarity: 'common' },
    { id: 'streak_3', name: 'On Fire', description: '3-day study streak', icon: '🔥', category: 'streak', isUnlocked: false, progress: 0, condition: 'Study 3 days in a row', xpReward: 100, rarity: 'common' },
    { id: 'streak_7', name: 'Week Warrior', description: '7-day study streak', icon: '⚡', category: 'streak', isUnlocked: false, progress: 0, condition: 'Study 7 days in a row', xpReward: 250, rarity: 'rare' },
    { id: 'streak_30', name: 'Unstoppable', description: '30-day study streak', icon: '🌟', category: 'streak', isUnlocked: false, progress: 0, condition: 'Study 30 days in a row', xpReward: 1000, rarity: 'legendary' },
    { id: 'questions_10', name: 'Getting Started', description: 'Answer 10 questions', icon: '📚', category: 'exploration', isUnlocked: false, progress: 0, condition: 'Answer 10 questions', xpReward: 75, rarity: 'common' },
    { id: 'questions_100', name: 'Century Club', description: 'Answer 100 questions', icon: '💯', category: 'exploration', isUnlocked: false, progress: 0, condition: 'Answer 100 questions', xpReward: 500, rarity: 'rare' },
    { id: 'accuracy_90', name: 'Sharpshooter', description: '90% accuracy over 20 questions', icon: '🎯', category: 'accuracy', isUnlocked: false, progress: 0, condition: '90% accuracy over 20 questions', xpReward: 300, rarity: 'epic' },
    { id: 'topic_master', name: 'Topic Master', description: 'Reach 100% mastery on any topic', icon: '👑', category: 'mastery', isUnlocked: false, progress: 0, condition: 'Reach Master tier on a topic', xpReward: 400, rarity: 'epic' },
    { id: 'level_2', name: 'Rising Scholar', description: 'Reach Level 2', icon: '🚀', category: 'exploration', isUnlocked: false, progress: 0, condition: 'Earn 500 XP', xpReward: 100, rarity: 'common' },
    { id: 'level_5', name: 'Grand Master', description: 'Reach Level 5', icon: '🏆', category: 'mastery', isUnlocked: false, progress: 0, condition: 'Earn 7000 XP', xpReward: 2000, rarity: 'legendary' },
  ];
  
  return {
    studentId: 'default',
    totalXP: 320,
    currentLevel: 1,
    currentLevelXP: 320,
    xpToNextLevel: 180,
    rank: 'Newcomer',
    streakDays: 3,
    longestStreak: 7,
    lastActiveDate: new Date().toISOString().split('T')[0],
    achievements: defaultAchievements,
    badges: [
      { id: 'b1', name: 'Early Adopter', icon: '🌟', color: 'amber', earnedAt: new Date().toISOString() },
    ],
    xpHistory: [
      { id: 'x1', type: 'daily_login', amount: 20, description: 'Daily login bonus', timestamp: new Date().toISOString() },
    ],
  };
}

export function loadXPProfile(): StudentXPProfile {
  try {
    const stored = localStorage.getItem(XP_STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  const profile = getDefaultXPProfile();
  saveXPProfile(profile);
  return profile;
}

export function saveXPProfile(profile: StudentXPProfile): void {
  localStorage.setItem(XP_STORAGE_KEY, JSON.stringify(profile));
}

export function addXP(amount: number, type: XPEvent['type'], description: string): StudentXPProfile {
  const profile = loadXPProfile();
  const event: XPEvent = {
    id: Date.now().toString(),
    type,
    amount,
    description,
    timestamp: new Date().toISOString(),
  };
  profile.totalXP += amount;
  profile.xpHistory = [event, ...profile.xpHistory.slice(0, 49)];
  profile.currentLevel = getLevelFromXP(profile.totalXP);
  profile.currentLevelXP = getCurrentLevelXP(profile.currentLevel, profile.totalXP);
  profile.xpToNextLevel = getXPToNextLevel(profile.currentLevel, profile.totalXP);
  profile.rank = getRank(profile.totalXP);
  saveXPProfile(profile);
  return profile;
}

export function getWeeklyProgress(): WeeklyProgress {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date().getDay();
  const profile = loadXPProfile();
  // Simulate some weekly data
  const weekDays = days.map((day, i) => ({
    day,
    xp: i < today ? Math.floor(Math.random() * 150 + 50) : i === today ? 80 : 0,
    questionsAnswered: i < today ? Math.floor(Math.random() * 15 + 5) : i === today ? 6 : 0,
    minutesStudied: i < today ? Math.floor(Math.random() * 45 + 15) : i === today ? 20 : 0,
    isToday: i === today,
  }));
  const totalXP = weekDays.reduce((sum, d) => sum + d.xp, 0);
  const totalQuestions = weekDays.reduce((sum, d) => sum + d.questionsAnswered, 0);
  const totalMinutes = weekDays.reduce((sum, d) => sum + d.minutesStudied, 0);
  return {
    weekLabel: 'This Week',
    days: weekDays,
    totalXP,
    totalQuestions,
    totalMinutes,
    goalXP: 1000,
  };
}

export function getLearningLevels(subjectId: SubjectId, userTotalXP: number): LearningLevel[] {
  const unlockedLevel = getLevelFromXP(userTotalXP);
  const levels: LearningLevel[] = [
    { number: 1, name: 'Foundations', description: 'Core definitions, basic vocabulary, fundamental rules', status: 'in_progress', xpRequired: 0, xpEarned: Math.min(userTotalXP, 500), topicsCount: 8, completedTopics: 3, color: 'emerald', icon: '🌱', prerequisiteLevelNumber: null },
    { number: 2, name: 'Core Concepts', description: 'Standard formulas, principal theorems, essential methods', status: userTotalXP >= 500 ? (unlockedLevel >= 2 ? 'in_progress' : 'unlocked') : 'locked', xpRequired: 500, xpEarned: Math.max(0, Math.min(userTotalXP - 500, 1000)), topicsCount: 10, completedTopics: unlockedLevel >= 2 ? 2 : 0, color: 'blue', icon: '📘', prerequisiteLevelNumber: 1 },
    { number: 3, name: 'Applied Skills', description: 'Multi-step problems, real-world applications, derivations', status: userTotalXP >= 1500 ? 'in_progress' : 'locked', xpRequired: 1500, xpEarned: Math.max(0, Math.min(userTotalXP - 1500, 2000)), topicsCount: 12, completedTopics: unlockedLevel >= 3 ? 1 : 0, color: 'purple', icon: '⚗️', prerequisiteLevelNumber: 2 },
    { number: 4, name: 'Problem Solving', description: 'Complex derivations, proof-based, competitive problems', status: userTotalXP >= 3500 ? 'in_progress' : 'locked', xpRequired: 3500, xpEarned: Math.max(0, Math.min(userTotalXP - 3500, 3500)), topicsCount: 10, completedTopics: 0, color: 'orange', icon: '🧩', prerequisiteLevelNumber: 3 },
    { number: 5, name: 'Mastery', description: 'Olympiad level, research-grade, original problem creation', status: userTotalXP >= 7000 ? 'in_progress' : 'locked', xpRequired: 7000, xpEarned: Math.max(0, userTotalXP - 7000), topicsCount: 8, completedTopics: 0, color: 'amber', icon: '👑', prerequisiteLevelNumber: 4 },
  ];
  return levels;
}
