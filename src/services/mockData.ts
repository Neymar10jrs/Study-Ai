import { SubjectInfo, PracticeQuestion, Flashcard, StudyNote } from "@/types";

export const INITIAL_SUBJECTS: SubjectInfo[] = [
  {
    id: "mathematics",
    name: "Mathematics",
    icon: "Calculator",
    category: "STEM",
    description: "Calculus, Algebra, Trigonometry, Coordinate Geometry, Probability & Statistics.",
    topicsCount: 42,
    masteryPercent: 88,
    popularTopics: ["Integration by Parts", "Quadratic Equations", "Matrices & Determinants", "Trigonometric Identities", "Limits & Continuity"],
    color: "from-orange-500 to-amber-500",
  },
  {
    id: "physics",
    name: "Physics",
    icon: "Compass",
    category: "STEM",
    description: "Mechanics, Electromagnetism, Optics, Thermodynamics, Modern Physics & Waves.",
    topicsCount: 36,
    masteryPercent: 82,
    popularTopics: ["Newton's Laws", "Electrostatics & Gauss Law", "Ray Optics & Lenses", "Electromagnetic Induction", "Kinematics in 2D"],
    color: "from-amber-500 to-yellow-500",
  },
  {
    id: "chemistry",
    name: "Chemistry",
    icon: "FlaskConical",
    category: "STEM",
    description: "Organic Mechanisms, Periodic Trends, Chemical Bonding, Equilibrium & Stoichiometry.",
    topicsCount: 38,
    masteryPercent: 79,
    popularTopics: ["SN1 vs SN2 Reactions", "Redox Balancing", "Thermodynamics", "Coordination Compounds", "Periodic Properties"],
    color: "from-emerald-500 to-teal-500",
  },
  {
    id: "biology",
    name: "Biology",
    icon: "Dna",
    category: "STEM",
    description: "Genetics, Cell Biology, Human Physiology, Ecology, Evolution & Molecular Biology.",
    topicsCount: 45,
    masteryPercent: 91,
    popularTopics: ["Mendelian Genetics", "Photosynthesis & Respiration", "DNA Replication", "Nervous System", "Human Circulatory System"],
    color: "from-green-500 to-emerald-600",
  },
  {
    id: "computer-science",
    name: "Computer Science",
    icon: "Code2",
    category: "STEM",
    description: "Algorithms, Data Structures, Python, C++, OOP, Databases & Web Architecture.",
    topicsCount: 32,
    masteryPercent: 95,
    popularTopics: ["Binary Search & Sorting", "Recursion & Trees", "Dynamic Programming", "SQL Queries", "Object-Oriented Design"],
    color: "from-blue-500 to-indigo-500",
  },
  {
    id: "english",
    name: "English",
    icon: "BookOpen",
    category: "Humanities",
    description: "Grammar, Literature, Essay Writing, Reading Comprehension & Vocabulary.",
    topicsCount: 28,
    masteryPercent: 87,
    popularTopics: ["Shakespearean Analysis", "Essay Structure", "Active vs Passive Voice", "Poetic Devices", "Critical Reading"],
    color: "from-purple-500 to-pink-500",
  },
  {
    id: "history",
    name: "History",
    icon: "Landmark",
    category: "Humanities",
    description: "World History, Ancient Civilizations, Industrial Revolution, World Wars & Modern Era.",
    topicsCount: 34,
    masteryPercent: 76,
    popularTopics: ["French Revolution", "World War I & II Causes", "Cold War Dynamics", "Renaissance Era", "Decolonization"],
    color: "from-red-500 to-rose-600",
  },
  {
    id: "geography",
    name: "Geography",
    icon: "Globe2",
    category: "Humanities",
    description: "Physical Geography, Climate Systems, Plate Tectonics, Cartography & Human Settlements.",
    topicsCount: 26,
    masteryPercent: 84,
    popularTopics: ["Plate Tectonics", "Atmospheric Circulation", "River Landforms", "Population Demographics", "Biomes"],
    color: "from-cyan-500 to-blue-600",
  },
  {
    id: "economics",
    name: "Economics",
    icon: "TrendingUp",
    category: "Commerce",
    description: "Microeconomics, Macroeconomics, Supply & Demand, Fiscal Policy & Trade.",
    topicsCount: 30,
    masteryPercent: 89,
    popularTopics: ["Supply & Demand Elasticity", "GDP & Inflation", "Monetary vs Fiscal Policy", "Market Structures", "Consumer Surplus"],
    color: "from-amber-600 to-orange-600",
  },
  {
    id: "accountancy",
    name: "Accountancy",
    icon: "FileSpreadsheet",
    category: "Commerce",
    description: "Financial Statements, Journal Entries, Balance Sheets, Cash Flow & Depreciation.",
    topicsCount: 25,
    masteryPercent: 80,
    popularTopics: ["Double-Entry Bookkeeping", "Cash Flow Statements", "Depreciation Methods", "Partnership Accounts", "Ratio Analysis"],
    color: "from-teal-500 to-emerald-600",
  },
  {
    id: "business-studies",
    name: "Business Studies",
    icon: "Briefcase",
    category: "Commerce",
    description: "Management Principles, Marketing Mix, Financial Management & Business Ethics.",
    topicsCount: 24,
    masteryPercent: 85,
    popularTopics: ["4 Ps of Marketing", "Organizational Hierarchy", "Leadership Styles", "Sources of Finance", "Business Environment"],
    color: "from-blue-600 to-cyan-600",
  },
  {
    id: "general-knowledge",
    name: "General Knowledge",
    icon: "Sparkles",
    category: "General",
    description: "Current Affairs, Science Discoveries, World Capitals, Inventions & Global Organizations.",
    topicsCount: 40,
    masteryPercent: 92,
    popularTopics: ["Nobel Prize Winners", "UN Bodies", "Space Missions", "World Geography Records", "Constitutional Law Basics"],
    color: "from-yellow-500 to-amber-600",
  },
  {
    id: "python",
    name: "Python",
    icon: "Code",
    category: "Technical Programming",
    description: "Core Python, Data Structures, OOP, and popular libraries.",
    topicsCount: 20,
    masteryPercent: 0,
    popularTopics: ["Lists & Dictionaries", "Decorators", "Generators"],
    color: "from-blue-500 to-yellow-500",
  },
  {
    id: "javascript",
    name: "JavaScript",
    icon: "Code",
    category: "Technical Programming",
    description: "ES6+, Async programming, DOM manipulation.",
    topicsCount: 25,
    masteryPercent: 0,
    popularTopics: ["Promises", "Closures", "Array Methods"],
    color: "from-yellow-400 to-yellow-600",
  },
  {
    id: "data-science",
    name: "Data Science",
    icon: "Database",
    category: "Technical Programming",
    description: "Pandas, NumPy, Data Visualization, and Statistics.",
    topicsCount: 18,
    masteryPercent: 0,
    popularTopics: ["Data Cleaning", "Matplotlib", "Statistical Testing"],
    color: "from-green-500 to-blue-500",
  },
  {
    id: "web-development",
    name: "Web Development",
    icon: "Globe",
    category: "Technical Programming",
    description: "HTML, CSS, React, Node.js and Full Stack architecture.",
    topicsCount: 30,
    masteryPercent: 0,
    popularTopics: ["React Hooks", "CSS Grid", "REST APIs"],
    color: "from-purple-500 to-pink-500",
  },
  {
    id: "machine-learning",
    name: "Machine Learning",
    icon: "Brain",
    category: "Technical Programming",
    description: "Supervised/Unsupervised Learning, Neural Networks, Scikit-learn.",
    topicsCount: 22,
    masteryPercent: 0,
    popularTopics: ["Linear Regression", "Decision Trees", "Deep Learning basics"],
    color: "from-red-500 to-orange-500",
  },
  {
    id: "cybersecurity",
    name: "Cybersecurity",
    icon: "Shield",
    category: "Technical Programming",
    description: "Network security, Cryptography, Ethical Hacking basics.",
    topicsCount: 15,
    masteryPercent: 0,
    popularTopics: ["Encryption", "Vulnerability Scanning", "Firewalls"],
    color: "from-gray-700 to-gray-900",
  }
];

export const INITIAL_FLASHCARDS: Flashcard[] = [
  {
    id: "fc_1",
    subject: "Mathematics",
    topic: "Calculus",
    front: "What is the derivative of $f(x) = \\ln(x)$?",
    back: "$f'(x) = \\frac{1}{x}$, defined for $x > 0$.",
    hint: "Recall the natural logarithmic differentiation rule.",
    mastered: true,
  },
  {
    id: "fc_2",
    subject: "Physics",
    topic: "Electrostatics",
    front: "State Gauss's Law in electrostatics.",
    back: "The total electric flux through any closed surface is equal to $\\frac{1}{\\varepsilon_0}$ times the net charge enclosed: $\\oint \\mathbf{E} \\cdot d\\mathbf{A} = \\frac{Q_{\\text{enc}}}{\\varepsilon_0}$.",
    hint: "Think about electric flux through a Gaussian surface.",
    mastered: false,
  },
  {
    id: "fc_3",
    subject: "Chemistry",
    topic: "Organic Chemistry",
    front: "What conditions favor an $S_N2$ reaction mechanism over $S_N1$?",
    back: "Primary ($1^\\circ$) or secondary ($2^\\circ$) unhindered substrate, strong nucleophile, and polar aprotic solvent (e.g., acetone, DMSO).",
    hint: "Think about backside attack and steric hindrance.",
    mastered: false,
  },
  {
    id: "fc_4",
    subject: "Computer Science",
    topic: "Algorithms",
    front: "What is the average and worst-case time complexity of QuickSort?",
    back: "Average case: $O(n \\log n)$. Worst case: $O(n^2)$ when pivot is repeatedly the smallest or largest element.",
    hint: "Partitioning efficiency depends on pivot selection.",
    mastered: true,
  },
];

export const PRACTICE_QUESTIONS_BANK: PracticeQuestion[] = [
  {
    id: "pq_1",
    subjectId: "mathematics",
    chapter: "Quadratic Equations",
    topic: "Roots & Discriminant",
    difficulty: "Medium",
    question: "Find the nature of the roots and the exact solutions for $2x^2 - 7x + 3 = 0$.",
    options: [
      "Real, rational, and distinct: x = 3, x = 1/2",
      "Real, irrational: x = (7 ± √13)/4",
      "Equal and real: x = 7/4",
      "Complex conjugates: x = (7 ± 5i)/4"
    ],
    correctOptionIndex: 0,
    solution: {
      type: "math",
      subject: "Mathematics",
      topic: "Quadratic Equations",
      directAnswer: "Roots are real, distinct, and rational: $x = 3$ and $x = \\frac{1}{2}$.",
      given: ["Equation: $2x^2 - 7x + 3 = 0$", "$a = 2$, $b = -7$, $c = 3$"],
      formula: ["Discriminant $\\Delta = b^2 - 4ac$", "Quadratic Formula $x = \\frac{-b \\pm \\sqrt{\\Delta}}{2a}$"],
      steps: [
        {
          title: "Compute Discriminant",
          detail: "Calculate $\\Delta = (-7)^2 - 4(2)(3) = 49 - 24 = 25$. Since $\\Delta = 25 > 0$ and is a perfect square, roots are real, distinct, and rational.",
          mathExpression: "\\Delta = 25 = 5^2",
        },
        {
          title: "Apply Quadratic Formula",
          detail: "Substitute $a, b, \\Delta$ into the quadratic formula:",
          mathExpression: "x = \\frac{-(-7) \\pm \\sqrt{25}}{2(2)} = \\frac{7 \\pm 5}{4}",
          substeps: ["Root 1: $(7 + 5)/4 = 12/4 = 3$", "Root 2: $(7 - 5)/4 = 2/4 = 1/2$"],
        }
      ],
      finalAnswer: "x = 3 \\quad \\text{or} \\quad x = \\frac{1}{2}",
      conceptUsed: "Quadratic Formula & Nature of Roots via Discriminant",
      keyTakeaway: "A positive perfect-square discriminant guarantees two distinct rational roots.",
    },
    explanation: "Using $\\Delta = b^2 - 4ac = 49 - 24 = 25$. Since $\\Delta > 0$, the roots are real and distinct. Solving gives $x = (7+5)/4 = 3$ and $x = (7-5)/4 = 1/2$.",
    conceptTested: "Discriminant Analysis & Quadratic Formula",
    similarQuestionPrompt: "Solve $3x^2 - 10x + 3 = 0$ using the quadratic formula."
  },
  {
    id: "pq_2",
    subjectId: "physics",
    chapter: "Mechanics",
    topic: "Conservation of Energy",
    difficulty: "Medium",
    question: "A ball of mass 0.5 kg is dropped from a height of 20 meters. Neglecting air resistance, what is its velocity just before hitting the ground? (Take g = 9.8 m/s²)",
    options: [
      "14.0 m/s",
      "19.8 m/s",
      "9.8 m/s",
      "24.5 m/s"
    ],
    correctOptionIndex: 1,
    solution: {
      type: "physics",
      subject: "Physics",
      topic: "Conservation of Mechanical Energy",
      directAnswer: "Velocity $v = 19.8 \\text{ m/s}$ (or $\\approx 20 \\text{ m/s}$ with $g = 10$).",
      given: ["Mass $m = 0.5 \\text{ kg}$", "Height $h = 20.0 \\text{ m}$", "$g = 9.8 \\text{ m/s}^2$"],
      formula: ["$mgh = \\frac{1}{2}mv^2 \\implies v = \\sqrt{2gh}$"],
      steps: [
        {
          title: "Energy Conservation Principle",
          detail: "Initial gravitational potential energy completely converts into kinetic energy at ground level.",
          mathExpression: "v = \\sqrt{2gh} = \\sqrt{2 \\times 9.8 \\times 20} = \\sqrt{392} \\approx 19.80 \\text{ m/s}",
        }
      ],
      finalAnswer: "v \\approx 19.80 \\text{ m/s}",
      conceptUsed: "Work-Energy Theorem & Free Fall Kinematics",
      keyTakeaway: "In free fall with no resistance, final speed depends solely on the vertical drop height and gravitational acceleration, completely independent of the mass.",
    },
    explanation: "By conservation of mechanical energy, potential energy lost equals kinetic energy gained: $mgh = \\frac{1}{2}mv^2 \\implies v = \\sqrt{2gh} = \\sqrt{2 \\times 9.8 \\times 20} = \\sqrt{392} \\approx 19.8 \\text{ m/s}$.",
    conceptTested: "Conservation of Mechanical Energy",
  },
  {
    id: "pq_3",
    subjectId: "chemistry",
    chapter: "Chemical Bonding",
    topic: "Molecular Geometry & VSEPR",
    difficulty: "Hard",
    question: "According to VSEPR theory, what is the molecular shape and bond angle of sulfur tetrafluoride (SF₄)?",
    options: [
      "Tetrahedral, 109.5°",
      "See-saw shape, < 120° equatorial and < 90° axial",
      "Square planar, 90°",
      "Trigonal bipyramidal, 120° and 90°"
    ],
    correctOptionIndex: 1,
    solution: {
      type: "theory",
      subject: "Chemistry",
      topic: "VSEPR Theory & Molecular Geometry",
      directAnswer: "See-saw shape with one equatorial lone pair; bond angles are slightly reduced from 120° and 90° due to lone pair-bonding pair repulsion.",
      steps: [
        {
          title: "Determine steric number",
          detail: "Sulfur has 6 valence electrons. 4 bond pairs with F atoms + 1 lone pair = 5 electron domains ($AX_4E$).",
          mathExpression: "\\text{Steric Number} = 4 + 1 = 5",
        },
        {
          title: "Select lone pair position",
          detail: "In a trigonal bipyramidal electron geometry, the lone pair occupies an equatorial position to minimize 90° repulsive interactions.",
        }
      ],
      finalAnswer: "\\text{Molecular Geometry: See-saw (AX}_4\\text{E)}",
      conceptUsed: "VSEPR Steric Number & Lone Pair Repulsion Hierarchy",
      keyTakeaway: "Lone pairs occupy equatorial positions in 5-domain systems because they experience only two 90° repulsions instead of three.",
    },
    explanation: "SF₄ has 4 bonding pairs and 1 lone pair (steric number 5). Electron geometry is trigonal bipyramidal, but molecular geometry is see-saw.",
    conceptTested: "VSEPR Theory & Steric Number 5 Geometries",
  }
];

export const INITIAL_STUDY_NOTES: StudyNote[] = [
  {
    id: "note_1",
    title: "Master Guide: Integration by Parts & LIATE",
    subject: "Mathematics",
    topic: "Calculus",
    summary: "Complete walkthrough of the Integration by Parts formula, LIATE prioritization, tabular method, and cyclic integrals.",
    contentMarkdown: `## Integration by Parts Formula

$$\\int u \\, dv = u v - \\int v \\, du$$

### LIATE Rule Priority:
1. **L** - Logarithmic functions ($\\ln x, \\log_a x$)
2. **I** - Inverse trigonometric functions ($\\arcsin x, \\arctan x$)
3. **A** - Algebraic / Polynomial functions ($x^2, 3x, \\sqrt{x}$)
4. **T** - Trigonometric functions ($\\sin x, \\cos x$)
5. **E** - Exponential functions ($e^x, 2^x$)

### Pro-Tips:
- Whenever you see a solitary inverse function like $\\int \\ln(x)dx$ or $\\int \\arctan(x)dx$, choose $u = \\text{function}$ and $dv = dx$.
- For cyclic integrals like $\\int e^x \\sin(x)dx$, integrate twice and solve algebraically for $I$.`,
    keyPoints: [
      "Select u as the term that simplifies upon differentiation.",
      "Tabular integration (DI method) is fastest for polynomials multiplied by sin, cos, or exp.",
      "Always remember the constant of integration (+ C) for indefinite integrals."
    ],
    formulas: [
      "\\int u \\, dv = uv - \\int v \\, du",
      "\\int \\ln(x) \\, dx = x\\ln(x) - x + C"
    ],
    createdAt: "2026-09-27T10:30:00Z"
  }
];

export const PRACTICE_QUESTIONS = PRACTICE_QUESTIONS_BANK;

export function getPracticeQuestions(subjectId: string): PracticeQuestion[] {
  return PRACTICE_QUESTIONS.filter(q => q.subjectId === subjectId || subjectId === 'all');
}
