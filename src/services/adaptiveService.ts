import { AdaptiveQuestion, PracticeSession, SubjectId, LevelNumber } from '../types';
import { getLocalSubjectQuestions } from './questionApiService';

export function generateAdaptiveSession(
  subjectId: SubjectId,
  levelNumber: LevelNumber,
  topicId: string,
  mode: PracticeSession['mode']
): PracticeSession {
  const count = mode === 'exam' ? 30 : mode === 'daily' ? 10 : 15;
  const rawQuestions = getLocalSubjectQuestions(subjectId, topicId, 'Medium', count);

  const adaptiveQuestions: AdaptiveQuestion[] = rawQuestions.map((q, i) => ({
    ...q,
    levelNumber,
    topicId,
    hintLevel1: `Think about the core concept: ${q.conceptTested}`,
    hintLevel2: `Consider using the relevant formula for ${q.topic}. Review your notes on ${q.chapter}.`,
    hintLevel3: `Start by identifying the known quantities. Then apply ${q.conceptTested} step by step.`,
    hintsUsed: 0,
    timesAttempted: 0,
    timesCorrect: 0,
    adaptiveDifficulty: ((['Beginner', 'Elementary', 'Intermediate', 'Advanced', 'Expert'] as const)[Math.min(i, 4)]),
    concepts: [q.conceptTested],
    tags: [q.topic, q.chapter],
  }));

  return {
    id: Date.now().toString(),
    subjectId,
    topicId,
    levelNumber,
    mode,
    questions: adaptiveQuestions,
    currentIndex: 0,
    answers: [],
    startedAt: new Date().toISOString(),
    xpEarned: 0,
    score: 0,
    status: 'active',
    timerSeconds: mode === 'exam' ? 1800 : undefined,
  };
}

export function calculateNextQuestion(
  session: PracticeSession,
  wasCorrect: boolean
): number {
  const next = session.currentIndex + 1;
  return next;
}

export function calculateSessionXP(session: PracticeSession): number {
  const correctAnswers = session.answers.filter(a => a.isCorrect).length;
  const accuracy = session.answers.length > 0 ? correctAnswers / session.answers.length : 0;
  const baseXP = correctAnswers * 10;
  const accuracyBonus = accuracy >= 0.9 ? 50 : accuracy >= 0.7 ? 25 : 0;
  const streakBonus = correctAnswers >= 5 ? 30 : 0;
  return baseXP + accuracyBonus + streakBonus;
}
