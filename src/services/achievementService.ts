import { Achievement, StudentXPProfile } from '../types';
import { loadXPProfile, saveXPProfile } from './progressService';

export function checkAndUnlockAchievements(
  questionsTotal: number,
  questionsCorrect: number,
  streakDays: number,
  topicMastered: boolean,
  totalXP: number
): Achievement[] {
  const profile = loadXPProfile();
  const newlyUnlocked: Achievement[] = [];
  
  profile.achievements = profile.achievements.map(ach => {
    if (ach.isUnlocked) return ach;
    let shouldUnlock = false;
    let progress = ach.progress;
    
    switch (ach.id) {
      case 'first_question': progress = Math.min(100, questionsTotal * 100); shouldUnlock = questionsTotal >= 1; break;
      case 'streak_3': progress = Math.min(100, (streakDays / 3) * 100); shouldUnlock = streakDays >= 3; break;
      case 'streak_7': progress = Math.min(100, (streakDays / 7) * 100); shouldUnlock = streakDays >= 7; break;
      case 'streak_30': progress = Math.min(100, (streakDays / 30) * 100); shouldUnlock = streakDays >= 30; break;
      case 'questions_10': progress = Math.min(100, (questionsTotal / 10) * 100); shouldUnlock = questionsTotal >= 10; break;
      case 'questions_100': progress = Math.min(100, (questionsTotal / 100) * 100); shouldUnlock = questionsTotal >= 100; break;
      case 'accuracy_90': 
        const acc = questionsTotal >= 20 ? (questionsCorrect / questionsTotal) * 100 : 0;
        progress = Math.min(100, acc); 
        shouldUnlock = questionsTotal >= 20 && acc >= 90; 
        break;
      case 'topic_master': progress = topicMastered ? 100 : 0; shouldUnlock = topicMastered; break;
      case 'level_2': progress = Math.min(100, (totalXP / 500) * 100); shouldUnlock = totalXP >= 500; break;
      case 'level_5': progress = Math.min(100, (totalXP / 7000) * 100); shouldUnlock = totalXP >= 7000; break;
    }
    
    if (shouldUnlock && !ach.isUnlocked) {
      const unlocked = { ...ach, isUnlocked: true, unlockedAt: new Date().toISOString(), progress: 100 };
      newlyUnlocked.push(unlocked);
      return unlocked;
    }
    return { ...ach, progress };
  });
  
  saveXPProfile(profile);
  return newlyUnlocked;
}

export function getAchievementsByCategory(category?: Achievement['category']): Achievement[] {
  const profile = loadXPProfile();
  if (!category) return profile.achievements;
  return profile.achievements.filter(a => a.category === category);
}
