export type SubjectId =
  | 'mathematics'
  | 'physics'
  | 'chemistry'
  | 'biology'
  | 'computer-science'
  | 'english'
  | 'history'
  | 'geography'
  | 'economics'
  | 'accountancy'
  | 'business-studies'
  | 'general-knowledge'
  | string;

export interface SubjectInfo {
  id: SubjectId;
  name: string;
  icon: string;
  category: 'STEM' | 'Humanities' | 'Commerce' | 'General' | 'Technical Programming' | string;
  description: string;
  topicsCount: number;
  masteryPercent: number;
  popularTopics: string[];
  color: string;
}

export type SolutionType = 'math' | 'physics' | 'chemistry' | 'programming' | 'theory';

export interface StepItem {
  title: string;
  detail: string;
  mathExpression?: string;
  substeps?: string[];
  note?: string;
}

export interface DetailedSolution {
  type: SolutionType;
  subject: string;
  topic: string;
  directAnswer?: string;
  given?: string[];
  required?: string[];
  formula?: string[];
  steps: StepItem[];
  finalAnswer: string;
  conceptUsed: string;
  keyTakeaway: string;
  // Chemistry specific
  reactants?: string[];
  products?: string[];
  chemicalEquation?: string;
  reactionConditions?: string;
  reasoning?: string;
  // Programming specific
  programmingLanguage?: string;
  problemStatement?: string;
  logicExplanation?: string[];
  code?: string;
  lineByLineExplanation?: { line: number | string; explanation: string }[];
  expectedOutput?: string;
  // Theory specific
  simpleExplanation?: string;
  detailedExplanation?: string;
  realWorldExample?: string;
  commonMistakes?: string[];
}

export interface ImageQualityReport {
  isReadable: boolean;
  score: number; // 0 - 100
  issues: string[];
  warningMessage?: string;
  detectionTypes: {
    hasHandwriting: boolean;
    hasEquations: boolean;
    hasDiagrams: boolean;
    hasPrintedText: boolean;
    hasCode: boolean;
  };
}

export interface SolvedQuestion {
  id: string;
  createdAt: string;
  imageUrls: string[];
  extractedText: string;
  editedText?: string;
  subject: string;
  topic: string;
  qualityReport: ImageQualityReport;
  solution: DetailedSolution;
  status: 'analyzed' | 'solved' | 'needs_clarification';
  followUpChats: { role: 'user' | 'assistant'; text: string; timestamp: string }[];
  isSaved?: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  subject?: string;
  imageAttachments?: string[];
  fileAttachments?: { name: string; size: string; type: string }[];
  solution?: DetailedSolution;
  actionType?: 'explain_simply' | 'step_by_step' | 'example' | 'practice' | 'summarize';
  audioVoice?: boolean;
}

export interface PracticeQuestion {
  id: string;
  subjectId: SubjectId;
  chapter: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Exam Level';
  question: string;
  image?: string;
  options: string[];
  correctOptionIndex: number;
  solution: DetailedSolution;
  explanation: string;
  conceptTested: string;
  similarQuestionPrompt?: string;
  whyCorrect?: string;
  wrongOptionExplanations?: Record<number, string>;
  commonPitfall?: string;
  keyRule?: string;
}

export interface Flashcard {
  id: string;
  subject: string;
  topic: string;
  front: string;
  back: string;
  hint?: string;
  mastered: boolean;
  intervalDays?: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface QuizResult {
  id: string;
  title: string;
  subject: string;
  totalQuestions: number;
  correctAnswers: number;
  scorePercentage: number;
  timeSpentSeconds: number;
  weakTopics: string[];
  createdAt: string;
}

export interface StudyNote {
  id: string;
  title: string;
  subject: string;
  topic: string;
  summary: string;
  contentMarkdown: string;
  keyPoints: string[];
  formulas?: string[];
  createdAt: string;
}

export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  gradeLevel: string;
  targetExam?: string;
  avatarSeed: string;
  studyStreakDays: number;
  questionsSolvedToday: number;
  totalQuestionsSolved: number;
  accuracyRate: number; // e.g. 91.5
  totalStudyMinutes: number;
  strongTopics: string[];
  weakTopics: string[];
  weeklyActivity: { day: string; questions: number; minutes: number }[];
  aiRecommendations: string[];
  joinedDate: string;
}

// Learning Level (1-5, enforced by data)
export type LevelNumber = 1 | 2 | 3 | 4 | 5;
export type LevelStatus = 'locked' | 'unlocked' | 'in_progress' | 'completed';
export type MasteryTier = 'Novice' | 'Beginner' | 'Intermediate' | 'Advanced' | 'Master';
export type DifficultyLevel = 'Beginner' | 'Elementary' | 'Intermediate' | 'Advanced' | 'Expert';

export interface LearningLevel {
  number: LevelNumber;
  name: string; // e.g. 'Foundations', 'Core Concepts', 'Applied Skills', 'Problem Solving', 'Mastery'
  description: string;
  status: LevelStatus;
  xpRequired: number; // XP needed to unlock this level
  xpEarned: number;
  topicsCount: number;
  completedTopics: number;
  color: string; // tailwind color name e.g. 'orange'
  icon: string; // emoji or icon name
  prerequisiteLevelNumber: LevelNumber | null;
}

export interface TopicNode {
  id: string;
  subjectId: SubjectId;
  levelNumber: LevelNumber;
  name: string;
  description: string;
  masteryPercent: number; // 0-100
  masteryTier: MasteryTier;
  isUnlocked: boolean;
  isCompleted: boolean;
  prerequisiteTopicIds: string[];
  xpValue: number;
  questionsAvailable: number;
  questionsAttempted: number;
  estimatedMinutes: number;
  tags: string[];
}

export interface XPEvent {
  id: string;
  type: 'question_correct' | 'streak_bonus' | 'level_complete' | 'topic_mastered' | 'daily_login' | 'achievement';
  amount: number;
  description: string;
  timestamp: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string; // emoji
  category: 'streak' | 'accuracy' | 'speed' | 'mastery' | 'exploration' | 'social';
  isUnlocked: boolean;
  unlockedAt?: string;
  progress: number; // 0-100
  condition: string; // human readable e.g. 'Answer 100 questions correctly'
  xpReward: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  color: string;
  earnedAt: string;
}

export interface StudentXPProfile {
  studentId: string;
  totalXP: number;
  currentLevel: LevelNumber;
  currentLevelXP: number; // XP within current level
  xpToNextLevel: number;
  rank: string; // e.g. 'Scholar', 'Expert', 'Legend'
  streakDays: number;
  longestStreak: number;
  lastActiveDate: string;
  achievements: Achievement[];
  badges: Badge[];
  xpHistory: XPEvent[];
}

export interface AdaptiveQuestion extends PracticeQuestion {
  levelNumber: LevelNumber;
  topicId: string;
  hintLevel1: string; // gentle nudge
  hintLevel2: string; // formula/approach hint
  hintLevel3: string; // step-by-step starter
  hintsUsed: number;
  timesAttempted: number;
  timesCorrect: number;
  adaptiveDifficulty: DifficultyLevel;
  nextQuestionIfCorrect?: string; // question id
  nextQuestionIfWrong?: string; // question id
  concepts: string[];
  tags: string[];
}

export interface PracticeSession {
  id: string;
  subjectId: SubjectId;
  topicId: string;
  levelNumber: LevelNumber;
  mode: 'adaptive' | 'exam' | 'revision' | 'daily' | 'challenge';
  questions: AdaptiveQuestion[];
  currentIndex: number;
  answers: { questionId: string; selectedIndex: number; isCorrect: boolean; hintsUsed: number; timeSpentMs: number }[];
  startedAt: string;
  completedAt?: string;
  xpEarned: number;
  score: number; // percentage
  status: 'active' | 'completed' | 'abandoned';
  timerSeconds?: number; // for exam mode
}

export interface StudyPlan {
  id: string;
  studentId: string;
  generatedAt: string;
  targetExam?: string;
  targetDate?: string;
  dailyMinutes: number;
  days: StudyPlanDay[];
  weeklyGoal: string;
  currentStreak: number;
}

export interface StudyPlanDay {
  date: string;
  dayLabel: string; // 'Monday', 'Today', etc.
  tasks: StudyPlanTask[];
  isCompleted: boolean;
  isToday: boolean;
}

export interface StudyPlanTask {
  id: string;
  type: 'topic_study' | 'practice' | 'revision' | 'exam_prep';
  subject: string;
  topic: string;
  estimatedMinutes: number;
  isCompleted: boolean;
  xpReward: number;
}

export interface LearningPath {
  subjectId: SubjectId;
  levels: LearningLevel[];
  topics: TopicNode[];
  currentLevelNumber: LevelNumber;
  overallMastery: number; // 0-100
}

export interface WeeklyProgress {
  weekLabel: string;
  days: { day: string; xp: number; questionsAnswered: number; minutesStudied: number; isToday: boolean }[];
  totalXP: number;
  totalQuestions: number;
  totalMinutes: number;
  goalXP: number;
}
