export interface SyllabusSubject {
  id: string;
  name: string;
  icon: string;
  category: "STEM" | "Humanities" | "Commerce" | "Technical" | "General";
  topics: string[];
}

export const SYLLABUS: Record<string, SyllabusSubject> = {
  physics: {
    id: "physics",
    name: "Physics",
    icon: "Compass",
    category: "STEM",
    topics: [
      "Motion",
      "Laws of Motion",
      "Work & Energy",
      "Light",
      "Electricity",
      "Thermodynamics",
      "Gravitation",
      "Magnetism"
    ]
  },
  chemistry: {
    id: "chemistry",
    name: "Chemistry",
    icon: "FlaskConical",
    category: "STEM",
    topics: [
      "Atoms & Molecules",
      "Chemical Reactions",
      "Acids & Bases",
      "Periodic Table",
      "Chemical Bonding",
      "Organic Chemistry",
      "Electrochemistry"
    ]
  },
  mathematics: {
    id: "mathematics",
    name: "Mathematics",
    icon: "Calculator",
    category: "STEM",
    topics: [
      "Algebra",
      "Quadratic Equations",
      "Trigonometry",
      "Geometry",
      "Probability",
      "Calculus",
      "Coordinate Geometry",
      "Statistics"
    ]
  },
  biology: {
    id: "biology",
    name: "Biology",
    icon: "Dna",
    category: "STEM",
    topics: [
      "Cell Structure & Function",
      "Genetics & Heredity",
      "Human Physiology",
      "Photosynthesis & Plant Biology",
      "Ecology & Environment"
    ]
  },
  "computer-science": {
    id: "computer-science",
    name: "Computer Science",
    icon: "Code2",
    category: "STEM",
    topics: [
      "Data Structures",
      "Algorithms & Complexity",
      "Object-Oriented Programming",
      "Databases & SQL",
      "Computer Networks"
    ]
  },
  python: {
    id: "python",
    name: "Python",
    icon: "Code",
    category: "Technical",
    topics: [
      "Variables & Data Types",
      "Control Flow & Loops",
      "Functions & Lambdas",
      "Lists, Tuples & Dictionaries",
      "Object-Oriented Programming",
      "File Handling & Exceptions"
    ]
  },
  javascript: {
    id: "javascript",
    name: "JavaScript",
    icon: "Code",
    category: "Technical",
    topics: [
      "Variables & ES6+ Syntax",
      "Functions & Closures",
      "Async JavaScript & Promises",
      "DOM Manipulation",
      "Event Loop & Microtasks"
    ]
  },
  "web-development": {
    id: "web-development",
    name: "Web Development",
    icon: "Globe",
    category: "Technical",
    topics: [
      "HTML5 & Semantic Structure",
      "CSS & Responsive Layouts",
      "React Components & Hooks",
      "REST APIs & Fetching",
      "State Management"
    ]
  },
  "data-science": {
    id: "data-science",
    name: "Data Science",
    icon: "Database",
    category: "Technical",
    topics: [
      "NumPy & Vectorized Math",
      "Pandas & DataFrames",
      "Data Visualization",
      "Statistical Analysis",
      "Data Cleaning"
    ]
  },
  "machine-learning": {
    id: "machine-learning",
    name: "Machine Learning",
    icon: "Brain",
    category: "Technical",
    topics: [
      "Supervised Learning",
      "Unsupervised Learning",
      "Neural Networks & Deep Learning",
      "Model Evaluation & Metrics",
      "Feature Engineering"
    ]
  },
  cybersecurity: {
    id: "cybersecurity",
    name: "Cybersecurity",
    icon: "Shield",
    category: "Technical",
    topics: [
      "Network Security",
      "Cryptography Basics",
      "Web Security & Vulnerabilities",
      "Malware & Threat Defense"
    ]
  },
  english: {
    id: "english",
    name: "English",
    icon: "BookOpen",
    category: "Humanities",
    topics: [
      "Reading Comprehension",
      "Grammar & Syntax",
      "Vocabulary & Word Power",
      "Sentence Correction & Idioms",
      "Essay & Writing Skills"
    ]
  },
  history: {
    id: "history",
    name: "History",
    icon: "Landmark",
    category: "Humanities",
    topics: [
      "Ancient Civilizations",
      "Medieval Era",
      "Industrial Revolution",
      "World War I & II",
      "Cold War & Modern World"
    ]
  },
  geography: {
    id: "geography",
    name: "Geography",
    icon: "Globe2",
    category: "Humanities",
    topics: [
      "Physical Geography & Landforms",
      "Climate & Weather Systems",
      "Natural Resources & Energy",
      "Human & Economic Geography"
    ]
  },
  economics: {
    id: "economics",
    name: "Economics",
    icon: "TrendingUp",
    category: "Commerce",
    topics: [
      "Supply & Demand",
      "Market Structures & Elasticity",
      "National Income & GDP",
      "Money, Banking & Inflation",
      "Fiscal & Monetary Policy"
    ]
  },
  accountancy: {
    id: "accountancy",
    name: "Accountancy",
    icon: "FileSpreadsheet",
    category: "Commerce",
    topics: [
      "Double-Entry Bookkeeping",
      "Journal Entries & Ledger",
      "Balance Sheet & Financial Statements",
      "Depreciation & Provisions",
      "Accounting Ratios & Cash Flow"
    ]
  },
  "business-studies": {
    id: "business-studies",
    name: "Business Studies",
    icon: "Briefcase",
    category: "Commerce",
    topics: [
      "Principles of Management",
      "Business Environment",
      "Marketing Mix (4 Ps)",
      "Financial Management & Planning",
      "Entrepreneurship"
    ]
  },
  "general-knowledge": {
    id: "general-knowledge",
    name: "General Knowledge",
    icon: "Sparkles",
    category: "General",
    topics: [
      "World Geography & Capitals",
      "Scientific Discoveries & Inventions",
      "Global Organizations",
      "Current Affairs & Science"
    ]
  }
};

export function getSubjectTopics(subjectId: string): string[] {
  const normalized = subjectId.toLowerCase().trim();
  if (SYLLABUS[normalized]) {
    return SYLLABUS[normalized].topics;
  }
  return ["Fundamentals", "Core Concepts", "Advanced Applications"];
}

export function getSubjectName(subjectId: string): string {
  const normalized = subjectId.toLowerCase().trim();
  return SYLLABUS[normalized]?.name || subjectId.charAt(0).toUpperCase() + subjectId.slice(1);
}

export function getAllSubjects(): SyllabusSubject[] {
  return Object.values(SYLLABUS);
}
