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
  category: 'STEM' | 'Humanities' | 'Commerce' | 'General';
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
