import { AdaptiveQuestion, PracticeSession, SubjectId, LevelNumber } from '../types';
import { getPracticeQuestions } from './mockData';

export function generateAdaptiveSession(
  subjectId: SubjectId,
  levelNumber: LevelNumber,
  topicId: string,
  mode: PracticeSession['mode']
): PracticeSession {
  const allQuestions = getPracticeQuestions(subjectId);
  const adaptiveQuestions: AdaptiveQuestion[] = allQuestions.slice(0, 10).map((q, i) => ({
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

  while (adaptiveQuestions.length < 5) {
    adaptiveQuestions.push(generateSyntheticQuestion(subjectId, levelNumber, topicId, adaptiveQuestions.length));
  }

  return {
    id: Date.now().toString(),
    subjectId,
    topicId,
    levelNumber,
    mode,
    questions: adaptiveQuestions.slice(0, mode === 'exam' ? 30 : mode === 'daily' ? 10 : 15),
    currentIndex: 0,
    answers: [],
    startedAt: new Date().toISOString(),
    xpEarned: 0,
    score: 0,
    status: 'active',
    timerSeconds: mode === 'exam' ? 1800 : undefined,
  };
}

function generateSyntheticQuestion(subjectId: SubjectId, level: LevelNumber, topicId: string, index: number): AdaptiveQuestion {
  const mathQuestions = [
    'What is the derivative of sin(x)?',
    'Solve: 2x² + 5x - 3 = 0',
    'Find the integral of x²dx',
    'What is the limit of (sin x)/x as x approaches 0?',
    'Calculate: log base 2 of 64',
  ];
  const mathOptions = [
    ['cos(x)', '-cos(x)', 'sin(x)', '-sin(x)'],
    ['x = 0.5, x = -3', 'x = 1, x = -3', 'x = -0.5, x = 3', 'x = 2, x = -3'],
    ['x³/3 + C', 'x²/2 + C', '2x + C', 'x³ + C'],
    ['0', 'Infinity', '1', 'Pi'],
    ['4', '6', '8', '16'],
  ];

  const physicsQuestions = [
    'What is the SI unit of force?',
    'A body travels 100m in 5s. What is its average speed?',
    "State Newton's Second Law of Motion.",
    'What type of wave is sound?',
    'What is the unit of electrical resistance?',
  ];
  const physicsOptions = [
    ['Newton', 'Joule', 'Watt', 'Pascal'],
    ['20 m/s', '15 m/s', '25 m/s', '500 m/s'],
    ['F = ma', 'F = mv', 'F = mg', 'F = m/a'],
    ['Transverse wave', 'Longitudinal wave', 'Electromagnetic wave', 'Surface wave'],
    ['Ohm', 'Ampere', 'Volt', 'Farad'],
  ];

  const isPhysics = subjectId === 'physics';
  const questions = isPhysics ? physicsQuestions : mathQuestions;
  const options = isPhysics ? physicsOptions : mathOptions;
  const qIndex = index % questions.length;

  return {
    id: `synthetic_${subjectId}_${level}_${index}_${Date.now()}`,
    subjectId,
    chapter: 'Core Concepts',
    topic: topicId,
    difficulty: level <= 2 ? 'Easy' : level <= 3 ? 'Medium' : level <= 4 ? 'Hard' : 'Exam Level',
    question: questions[qIndex],
    options: options[qIndex],
    correctOptionIndex: 0,
    solution: {
      type: 'theory',
      subject: subjectId,
      topic: topicId,
      steps: [{ title: 'Analysis', detail: 'Apply the relevant concept directly.' }],
      finalAnswer: options[qIndex][0],
      conceptUsed: topicId,
      keyTakeaway: 'Understanding fundamental definitions is critical.',
    },
    explanation: `The correct answer is ${options[qIndex][0]}. This is a fundamental concept in ${subjectId}.`,
    conceptTested: topicId,
    levelNumber: level,
    topicId,
    hintLevel1: 'Think about the definition and core principle.',
    hintLevel2: 'Review your notes on this topic carefully.',
    hintLevel3: 'The answer relates directly to the formula or rule you learned.',
    hintsUsed: 0,
    timesAttempted: 0,
    timesCorrect: 0,
    adaptiveDifficulty: 'Beginner',
    concepts: [topicId],
    tags: [topicId],
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
