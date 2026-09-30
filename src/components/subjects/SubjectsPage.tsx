import React, { useState, useMemo } from 'react';
import {
  Search, Brain, Target, X,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { cn } from '../../lib/utils';

type CategoryFilter = 'All' | 'Academic' | 'Technical';

interface SubjectDef {
  id: string;
  name: string;
  icon: string;
  category: 'Academic' | 'Technical';
  subcategory: string;
  description: string;
  topicsCount: number;
  masteryPercent: number;
  difficulty: 'Foundation' | 'Intermediate' | 'Advanced';
  color: string;
  popularTopics: string[];
  isNew?: boolean;
}

const SUBJECTS: SubjectDef[] = [
  // Academic
  {
    id: 'mathematics', name: 'Mathematics', icon: '📐', category: 'Academic', subcategory: 'STEM',
    description: 'Algebra, Calculus, Trigonometry, Statistics and more',
    topicsCount: 42, masteryPercent: 45, difficulty: 'Advanced', color: 'orange',
    popularTopics: ['Calculus', 'Algebra', 'Trigonometry', 'Statistics', 'Matrices'],
  },
  {
    id: 'physics', name: 'Physics', icon: '⚛️', category: 'Academic', subcategory: 'STEM',
    description: 'Mechanics, Thermodynamics, Waves, Optics, Electromagnetism',
    topicsCount: 38, masteryPercent: 30, difficulty: 'Advanced', color: 'blue',
    popularTopics: ['Mechanics', 'Thermodynamics', 'Electromagnetism', 'Optics', 'Modern Physics'],
  },
  {
    id: 'chemistry', name: 'Chemistry', icon: '🧪', category: 'Academic', subcategory: 'STEM',
    description: 'Organic, Inorganic, Physical Chemistry, Reactions',
    topicsCount: 35, masteryPercent: 20, difficulty: 'Advanced', color: 'emerald',
    popularTopics: ['Organic', 'Inorganic', 'Electrochemistry', 'Thermochemistry', 'Bonding'],
  },
  {
    id: 'biology', name: 'Biology', icon: '🧬', category: 'Academic', subcategory: 'STEM',
    description: 'Cell Biology, Genetics, Evolution, Ecology, Physiology',
    topicsCount: 32, masteryPercent: 0, difficulty: 'Intermediate', color: 'green',
    popularTopics: ['Cell Biology', 'Genetics', 'Evolution', 'Physiology', 'Ecology'],
  },
  {
    id: 'english', name: 'English', icon: '📝', category: 'Academic', subcategory: 'Languages',
    description: 'Grammar, Literature, Writing, Comprehension, Vocabulary',
    topicsCount: 28, masteryPercent: 60, difficulty: 'Foundation', color: 'purple',
    popularTopics: ['Grammar', 'Essay Writing', 'Literature', 'Comprehension', 'Vocabulary'],
  },
  {
    id: 'history', name: 'History', icon: '🏛️', category: 'Academic', subcategory: 'Humanities',
    description: 'World History, Ancient, Medieval, Modern, Indian History',
    topicsCount: 30, masteryPercent: 0, difficulty: 'Intermediate', color: 'amber',
    popularTopics: ['Ancient History', 'World Wars', 'Independence Movements', 'Medieval Era', 'Modern History'],
  },
  {
    id: 'geography', name: 'Geography', icon: '🌍', category: 'Academic', subcategory: 'Humanities',
    description: 'Physical, Human, Political Geography, Maps and Climate',
    topicsCount: 24, masteryPercent: 0, difficulty: 'Foundation', color: 'teal',
    popularTopics: ['Physical Geography', 'Climate', 'Maps', 'Human Geography', 'Geopolitics'],
  },
  {
    id: 'economics', name: 'Economics', icon: '📈', category: 'Academic', subcategory: 'Commerce',
    description: 'Micro, Macroeconomics, Indian Economy, Market Structures',
    topicsCount: 26, masteryPercent: 0, difficulty: 'Intermediate', color: 'yellow',
    popularTopics: ['Microeconomics', 'Macroeconomics', 'Indian Economy', 'Demand-Supply', 'GDP'],
  },
  {
    id: 'accountancy', name: 'Accountancy', icon: '🧾', category: 'Academic', subcategory: 'Commerce',
    description: 'Financial Accounting, Partnership, Company Accounts',
    topicsCount: 22, masteryPercent: 0, difficulty: 'Intermediate', color: 'indigo',
    popularTopics: ['Journal Entries', 'Balance Sheet', 'Partnership', 'Company Accounts', 'Cash Flow'],
  },
  {
    id: 'business-studies', name: 'Business Studies', icon: '💼', category: 'Academic', subcategory: 'Commerce',
    description: 'Business Organization, Management, Marketing, Finance',
    topicsCount: 20, masteryPercent: 0, difficulty: 'Foundation', color: 'rose',
    popularTopics: ['Management', 'Marketing', 'Finance', 'Business Environment', 'Entrepreneurship'],
  },
  // Technical
  {
    id: 'python', name: 'Python', icon: '🐍', category: 'Technical', subcategory: 'Programming',
    description: 'Python fundamentals, OOP, libraries, data structures, algorithms',
    topicsCount: 45, masteryPercent: 0, difficulty: 'Intermediate', color: 'blue',
    popularTopics: ['Basics', 'OOP', 'Libraries', 'Algorithms', 'Web Scraping'],
    isNew: true,
  },
  {
    id: 'javascript', name: 'JavaScript', icon: '⚡', category: 'Technical', subcategory: 'Programming',
    description: 'JS fundamentals, ES6+, DOM, async/await, Node.js',
    topicsCount: 48, masteryPercent: 0, difficulty: 'Intermediate', color: 'yellow',
    popularTopics: ['ES6+', 'DOM', 'Async/Await', 'Closures', 'React Basics'],
    isNew: true,
  },
  {
    id: 'java', name: 'Java', icon: '☕', category: 'Technical', subcategory: 'Programming',
    description: 'Java OOP, Collections, Multithreading, Spring Boot basics',
    topicsCount: 40, masteryPercent: 0, difficulty: 'Advanced', color: 'orange',
    popularTopics: ['OOP', 'Collections', 'Multithreading', 'JVM', 'Spring'],
  },
  {
    id: 'cpp', name: 'C++', icon: '⚙️', category: 'Technical', subcategory: 'Programming',
    description: 'C++ fundamentals, STL, OOP, memory management, competitive programming',
    topicsCount: 38, masteryPercent: 0, difficulty: 'Advanced', color: 'cyan',
    popularTopics: ['Pointers', 'STL', 'OOP', 'Templates', 'Memory'],
  },
  {
    id: 'data-structures', name: 'Data Structures', icon: '🌳', category: 'Technical', subcategory: 'CS Fundamentals',
    description: 'Arrays, Linked Lists, Trees, Graphs, Heaps, Hash Tables',
    topicsCount: 35, masteryPercent: 0, difficulty: 'Advanced', color: 'emerald',
    popularTopics: ['Arrays', 'Trees', 'Graphs', 'Hash Tables', 'Dynamic Programming'],
  },
  {
    id: 'algorithms', name: 'Algorithms', icon: '🔄', category: 'Technical', subcategory: 'CS Fundamentals',
    description: 'Sorting, Searching, Greedy, DP, Graph Algorithms',
    topicsCount: 32, masteryPercent: 0, difficulty: 'Advanced', color: 'purple',
    popularTopics: ['Sorting', 'Binary Search', 'Dynamic Programming', 'Greedy', 'Graph Traversal'],
  },
  {
    id: 'web-development', name: 'Web Development', icon: '🌐', category: 'Technical', subcategory: 'Development',
    description: 'HTML, CSS, React, Node.js, REST APIs, Databases',
    topicsCount: 50, masteryPercent: 0, difficulty: 'Intermediate', color: 'pink',
    popularTopics: ['HTML/CSS', 'React', 'Node.js', 'REST API', 'Databases'],
    isNew: true,
  },
  {
    id: 'data-science', name: 'Data Science', icon: '📊', category: 'Technical', subcategory: 'AI/ML',
    description: 'Pandas, NumPy, Visualization, Statistics, ML basics',
    topicsCount: 40, masteryPercent: 0, difficulty: 'Intermediate', color: 'teal',
    popularTopics: ['Pandas', 'NumPy', 'Matplotlib', 'Statistics', 'ML Basics'],
    isNew: true,
  },
  {
    id: 'machine-learning', name: 'Machine Learning', icon: '🤖', category: 'Technical', subcategory: 'AI/ML',
    description: 'Supervised, Unsupervised, Deep Learning, Model Evaluation',
    topicsCount: 36, masteryPercent: 0, difficulty: 'Advanced', color: 'indigo',
    popularTopics: ['Linear Regression', 'Neural Networks', 'CNNs', 'NLP', 'Model Evaluation'],
    isNew: true,
  },
  {
    id: 'cybersecurity', name: 'Cybersecurity', icon: '🛡️', category: 'Technical', subcategory: 'Security',
    description: 'Network Security, Cryptography, Ethical Hacking, Web Security',
    topicsCount: 28, masteryPercent: 0, difficulty: 'Advanced', color: 'red',
    popularTopics: ['Cryptography', 'Network Security', 'Ethical Hacking', 'Web Security', 'Forensics'],
  },
];

const COLOR_MAP: Record<string, { ring: string; bg: string; text: string; badge: string }> = {
  orange: { ring: 'border-orange-500/40', bg: 'from-orange-500/10', text: 'text-orange-400', badge: 'bg-orange-500/20 text-orange-300' },
  blue: { ring: 'border-blue-500/40', bg: 'from-blue-500/10', text: 'text-blue-400', badge: 'bg-blue-500/20 text-blue-300' },
  emerald: { ring: 'border-emerald-500/40', bg: 'from-emerald-500/10', text: 'text-emerald-400', badge: 'bg-emerald-500/20 text-emerald-300' },
  green: { ring: 'border-green-500/40', bg: 'from-green-500/10', text: 'text-green-400', badge: 'bg-green-500/20 text-green-300' },
  purple: { ring: 'border-purple-500/40', bg: 'from-purple-500/10', text: 'text-purple-400', badge: 'bg-purple-500/20 text-purple-300' },
  amber: { ring: 'border-amber-500/40', bg: 'from-amber-500/10', text: 'text-amber-400', badge: 'bg-amber-500/20 text-amber-300' },
  teal: { ring: 'border-teal-500/40', bg: 'from-teal-500/10', text: 'text-teal-400', badge: 'bg-teal-500/20 text-teal-300' },
  yellow: { ring: 'border-yellow-500/40', bg: 'from-yellow-500/10', text: 'text-yellow-400', badge: 'bg-yellow-500/20 text-yellow-300' },
  indigo: { ring: 'border-indigo-500/40', bg: 'from-indigo-500/10', text: 'text-indigo-400', badge: 'bg-indigo-500/20 text-indigo-300' },
  rose: { ring: 'border-rose-500/40', bg: 'from-rose-500/10', text: 'text-rose-400', badge: 'bg-rose-500/20 text-rose-300' },
  cyan: { ring: 'border-cyan-500/40', bg: 'from-cyan-500/10', text: 'text-cyan-400', badge: 'bg-cyan-500/20 text-cyan-300' },
  pink: { ring: 'border-pink-500/40', bg: 'from-pink-500/10', text: 'text-pink-400', badge: 'bg-pink-500/20 text-pink-300' },
  red: { ring: 'border-red-500/40', bg: 'from-red-500/10', text: 'text-red-400', badge: 'bg-red-500/20 text-red-300' },
};

interface SubjectsPageProps {
  onLaunchTutor?: (query?: string) => void;
  onLaunchPractice?: (subjectId?: string, topic?: string) => void;
  onLaunchNotes?: (subjectName: string) => void;
  onLaunchQuiz?: (subjectName: string) => void;
}

export function SubjectsPage({ onLaunchTutor, onLaunchPractice, onLaunchNotes, onLaunchQuiz }: SubjectsPageProps) {
  const [filter, setFilter] = useState<CategoryFilter>('All');
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<SubjectDef | null>(null);

  const filtered = useMemo(() => {
    return SUBJECTS.filter(s => {
      const matchCat = filter === 'All' || s.category === filter;
      const q = search.toLowerCase();
      const matchSearch = !search ||
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.popularTopics.some(t => t.toLowerCase().includes(q));
      return matchCat && matchSearch;
    });
  }, [filter, search]);

  return (
    <div className="min-h-screen bg-[#090a0f] py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <div className="text-center space-y-2">
          <Badge variant="glow" className="text-xs">20+ Subjects</Badge>
          <h1 className="text-3xl font-extrabold text-white">All Subjects</h1>
          <p className="text-gray-400 text-sm">
            Academic curriculum + Technical programming. Choose any subject and start your learning path.
          </p>
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search subjects or topics..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 transition-all"
            />
          </div>
          <div className="flex gap-2">
            {(['All', 'Academic', 'Technical'] as CategoryFilter[]).map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={cn(
                  'px-4 py-2 rounded-xl text-sm font-semibold border transition-all',
                  filter === cat
                    ? 'bg-orange-500/20 border-orange-500/50 text-orange-300'
                    : 'glass-panel border-white/10 text-gray-400 hover:text-white hover:border-white/20'
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Subject Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(subject => {
            const colors = COLOR_MAP[subject.color] ?? COLOR_MAP['orange'];
            return (
              <div
                key={subject.id}
                onClick={() => setSelectedSubject(subject)}
                className={cn(
                  'glass-panel border rounded-2xl p-5 cursor-pointer transition-all duration-200 hover:scale-[1.02] space-y-4 group',
                  colors.ring,
                  `bg-gradient-to-br ${colors.bg} to-transparent`
                )}
              >
                {/* Icon + badges */}
                <div className="flex items-start justify-between">
                  <span className="text-3xl">{subject.icon}</span>
                  <div className="flex flex-col gap-1 items-end">
                    {subject.isNew && (
                      <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded px-1.5 py-0.5">New</span>
                    )}
                    <span className={cn('text-xs px-1.5 py-0.5 rounded font-medium', colors.badge)}>
                      {subject.category}
                    </span>
                  </div>
                </div>

                {/* Name + desc */}
                <div>
                  <h3 className="font-extrabold text-white text-base group-hover:text-orange-200 transition-colors">
                    {subject.name}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed">{subject.description}</p>
                </div>

                {/* Mastery bar */}
                {subject.masteryPercent > 0 && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className={colors.text}>Mastery</span>
                      <span className={colors.text}>{subject.masteryPercent}%</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400"
                        style={{ width: `${subject.masteryPercent}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Stats */}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{subject.topicsCount} topics</span>
                  <span className={cn(
                    'font-medium',
                    subject.difficulty === 'Advanced' ? 'text-red-400'
                      : subject.difficulty === 'Intermediate' ? 'text-amber-400'
                      : 'text-emerald-400'
                  )}>
                    {subject.difficulty}
                  </span>
                </div>

                {/* Quick actions on hover */}
                <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={e => { e.stopPropagation(); onLaunchPractice?.(subject.id); }}
                    className={cn('flex-1 text-xs py-1.5 rounded-lg border font-semibold transition-all', colors.ring, colors.badge)}
                  >
                    Practice
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); onLaunchTutor?.(`Teach me ${subject.name}`); }}
                    className="flex-1 text-xs py-1.5 rounded-lg border border-white/10 text-gray-300 hover:bg-white/5 font-semibold transition-all"
                  >
                    Ask AI
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-500">
            <p className="text-2xl mb-2">🔍</p>
            <p className="font-semibold text-white">No subjects found</p>
            <p className="text-sm mt-1">Try a different search term or category</p>
          </div>
        )}
      </div>

      {/* Subject Detail Modal */}
      {selectedSubject && (() => {
        const colors = COLOR_MAP[selectedSubject.color] ?? COLOR_MAP['orange'];
        return (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setSelectedSubject(null)}
            />
            <div className="relative w-full max-w-lg glass-panel border border-white/15 rounded-3xl p-6 space-y-5 z-10 max-h-[85vh] overflow-y-auto">

              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{selectedSubject.icon}</span>
                  <div>
                    <h2 className="text-xl font-extrabold text-white">{selectedSubject.name}</h2>
                    <p className="text-xs text-gray-400">{selectedSubject.subcategory} · {selectedSubject.topicsCount} topics</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedSubject(null)}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <p className="text-sm text-gray-300">{selectedSubject.description}</p>

              {/* Difficulty + category badges */}
              <div className="flex gap-2 flex-wrap">
                <span className={cn('text-xs px-2.5 py-1 rounded-full border font-medium', colors.badge, colors.ring)}>
                  {selectedSubject.category}
                </span>
                <span className={cn(
                  'text-xs px-2.5 py-1 rounded-full border font-medium',
                  selectedSubject.difficulty === 'Advanced'
                    ? 'bg-red-500/20 text-red-300 border-red-500/30'
                    : selectedSubject.difficulty === 'Intermediate'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                )}>
                  {selectedSubject.difficulty}
                </span>
              </div>

              {/* Popular Topics */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Popular Topics</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedSubject.popularTopics.map(t => (
                    <span
                      key={t}
                      className="px-2.5 py-1 rounded-full text-xs bg-white/5 border border-white/10 text-gray-300"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="gradient"
                  size="sm"
                  onClick={() => { onLaunchPractice?.(selectedSubject.id); setSelectedSubject(null); }}
                  className="gap-2 font-semibold"
                >
                  <Target className="h-4 w-4" /> Practice
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => { onLaunchTutor?.(`Teach me about ${selectedSubject.name}`); setSelectedSubject(null); }}
                  className="gap-2"
                >
                  <Brain className="h-4 w-4" /> Ask AI
                </Button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
