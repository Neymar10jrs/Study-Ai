import { StudentProfile, SolvedQuestion, ChatMessage, StudyNote, Flashcard, QuizResult } from "@/types";

const CURRENT_STUDENT_KEY = "studyai_current_student_id";

export function getCurrentStudentId(): string {
  let id = localStorage.getItem(CURRENT_STUDENT_KEY);
  if (!id) {
    id = "student_alex_901";
    localStorage.setItem(CURRENT_STUDENT_KEY, id);
  }
  return id;
}

export function setCurrentStudentId(studentId: string): void {
  localStorage.setItem(CURRENT_STUDENT_KEY, studentId);
}

// Student profile management
export function getStudentProfile(studentId: string = getCurrentStudentId()): StudentProfile {
  const key = `studyai_${studentId}_profile`;
  const saved = localStorage.getItem(key);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
  }

  // Default initial profile
  const defaultProfile: StudentProfile = {
    id: studentId,
    name: "Alex Morgan",
    email: "alex.morgan@student.edu",
    gradeLevel: "Grade 11 / High School Senior",
    targetExam: "AP / SAT / State Board 2026",
    avatarSeed: "alex",
    studyStreakDays: 7,
    questionsSolvedToday: 8,
    totalQuestionsSolved: 142,
    accuracyRate: 94.2,
    totalStudyMinutes: 420,
    strongTopics: ["Definite Integrals", "Newtonian Kinematics", "Stoichiometry", "Binary Search"],
    weakTopics: ["Quadratic Equations", "Electrostatics", "Aldehydes & Ketones"],
    weeklyActivity: [
      { day: "Mon", questions: 14, minutes: 65 },
      { day: "Tue", questions: 18, minutes: 80 },
      { day: "Wed", questions: 10, minutes: 45 },
      { day: "Thu", questions: 22, minutes: 95 },
      { day: "Fri", questions: 16, minutes: 60 },
      { day: "Sat", questions: 25, minutes: 110 },
      { day: "Sun", questions: 19, minutes: 85 },
    ],
    aiRecommendations: [
      "You made 2 mistakes in Quadratic Equations this week. Practice 5 recommended problems today.",
      "Review Electrostatics Gauss Law derivations before your upcoming physics quiz.",
      "Great job on Calculus! Your integration accuracy reached 96% this week."
    ],
    joinedDate: "2026-08-15",
  };

  saveStudentProfile(defaultProfile);
  return defaultProfile;
}

export function saveStudentProfile(profile: StudentProfile): void {
  localStorage.setItem(`studyai_${profile.id}_profile`, JSON.stringify(profile));
}

// Solved Image Questions History (Section 25)
export function getSolvedQuestions(studentId: string = getCurrentStudentId()): SolvedQuestion[] {
  const key = `studyai_${studentId}_solved_questions`;
  const saved = localStorage.getItem(key);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
  }
  return [];
}

export function saveSolvedQuestion(question: SolvedQuestion, studentId: string = getCurrentStudentId()): void {
  const list = getSolvedQuestions(studentId);
  const existingIdx = list.findIndex((q) => q.id === question.id);
  if (existingIdx >= 0) {
    list[existingIdx] = question;
  } else {
    list.unshift(question);
  }
  localStorage.setItem(`studyai_${studentId}_solved_questions`, JSON.stringify(list));

  // Update profile metrics
  const profile = getStudentProfile(studentId);
  profile.questionsSolvedToday += 1;
  profile.totalQuestionsSolved += 1;
  saveStudentProfile(profile);
}

export function deleteSolvedQuestion(questionId: string, studentId: string = getCurrentStudentId()): void {
  const list = getSolvedQuestions(studentId).filter((q) => q.id !== questionId);
  localStorage.setItem(`studyai_${studentId}_solved_questions`, JSON.stringify(list));
}

// AI Chat messages
export function getChatHistory(studentId: string = getCurrentStudentId()): ChatMessage[] {
  const key = `studyai_${studentId}_chats`;
  const saved = localStorage.getItem(key);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
  }
  return [];
}

export function saveChatHistory(messages: ChatMessage[], studentId: string = getCurrentStudentId()): void {
  localStorage.setItem(`studyai_${studentId}_chats`, JSON.stringify(messages));
}

// Study Notes
export function getSavedNotes(studentId: string = getCurrentStudentId()): StudyNote[] {
  const key = `studyai_${studentId}_notes`;
  const saved = localStorage.getItem(key);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
  }
  return [];
}

export function saveStudyNote(note: StudyNote, studentId: string = getCurrentStudentId()): void {
  const list = getSavedNotes(studentId);
  list.unshift(note);
  localStorage.setItem(`studyai_${studentId}_notes`, JSON.stringify(list));
}

// Flashcards
export function getFlashcards(studentId: string = getCurrentStudentId()): Flashcard[] {
  const key = `studyai_${studentId}_flashcards`;
  const saved = localStorage.getItem(key);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
  }
  return [];
}

export function saveFlashcards(cards: Flashcard[], studentId: string = getCurrentStudentId()): void {
  localStorage.setItem(`studyai_${studentId}_flashcards`, JSON.stringify(cards));
}
