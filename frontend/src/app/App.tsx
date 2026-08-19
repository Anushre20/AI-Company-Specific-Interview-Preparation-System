import { useState, useEffect, useRef } from "react";
import {
  checkBackend,
  getCompanies,
  getQuestions,
  askRAG,
  getInterviewIntelligence
} from "../api";
import {
  LayoutDashboard, Building2, BookOpen, MessageSquare, HelpCircle,
  TrendingUp, FileText, Bookmark, Settings, Search, Bell, Star,
  Clock, Target, CheckCircle2, AlertCircle, Circle, Play, Upload,
  ArrowRight, Menu, ChevronRight, ChevronLeft, Brain, Lightbulb,
  Globe, Info, Send, ThumbsUp, Briefcase, Code2, TrendingDown,
  AlertTriangle, Plus, Sparkles, Trophy, Zap, Shield, Users,
  ExternalLink, RotateCcw, Check, XCircle, Hash,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";

// ─── TYPES ────────────────────────────────────────────────────────────────────

type Page =
  | "landing" | "dashboard" | "companies" | "preparation"
  | "mock-interview" | "questions" | "progress" | "resume"
  | "saved" | "settings";
type Source = "official" | "reported" | "ai-generated" | "ai-prediction";
type Difficulty = "Easy" | "Medium" | "Hard";
type RoundType = "OA" | "Technical" | "Managerial" | "HR";

// ─── MOCK DATA ────────────────────────────────────────────────────────────────

const COMPANIES_DATA = [
  {
    id: "google", name: "Google", abbr: "G", color: "#4285F4",
    sector: "Tech", difficulty: "Hard" as Difficulty,
    avgPackage: "₹45 LPA", openRoles: 12,
    eligibility: { cgpa: 7.0, branches: ["CSE", "IT", "ECE", "EEE", "MCA"], backlogs: 0, graduationYears: [2024, 2025] },
    rounds: [
      {
        type: "OA" as RoundType, name: "Online Assessment", duration: "90 min",
        topics: [
          { name: "Arrays & Strings", difficulty: "Medium" as Difficulty, frequency: 5, confidence: 65 },
          { name: "Dynamic Programming", difficulty: "Hard" as Difficulty, frequency: 4, confidence: 40 },
          { name: "Graph Algorithms", difficulty: "Hard" as Difficulty, frequency: 3, confidence: 35 },
        ],
      },
      {
        type: "Technical" as RoundType, name: "Technical Round 1", duration: "60 min",
        topics: [
          { name: "System Design", difficulty: "Hard" as Difficulty, frequency: 5, confidence: 30 },
          { name: "OOP Concepts", difficulty: "Medium" as Difficulty, frequency: 4, confidence: 60 },
          { name: "OS & Networks", difficulty: "Medium" as Difficulty, frequency: 3, confidence: 50 },
        ],
      },
      {
        type: "Technical" as RoundType, name: "Technical Round 2 (Googleyness)", duration: "60 min",
        topics: [
          { name: "Behavioral Questions", difficulty: "Medium" as Difficulty, frequency: 5, confidence: 70 },
          { name: "Problem Solving", difficulty: "Hard" as Difficulty, frequency: 4, confidence: 45 },
        ],
      },
      {
        type: "HR" as RoundType, name: "HR Discussion", duration: "30 min",
        topics: [
          { name: "Career Goals", difficulty: "Easy" as Difficulty, frequency: 5, confidence: 80 },
          { name: "Culture Fit", difficulty: "Easy" as Difficulty, frequency: 4, confidence: 75 },
        ],
      },
    ],
    interviewReports: 342, rating: 4.6,
    tags: ["FAANG", "SWE", "Product"],
    recentActivity: "Active hiring · Last updated 2 days ago",
  },
  {
    id: "microsoft", name: "Microsoft", abbr: "Ms", color: "#00A4EF",
    sector: "Tech", difficulty: "Hard" as Difficulty,
    avgPackage: "₹40 LPA", openRoles: 8,
    eligibility: { cgpa: 6.5, branches: ["CSE", "IT", "ECE", "MCA"], backlogs: 0, graduationYears: [2024, 2025] },
    rounds: [
      {
        type: "OA" as RoundType, name: "Online Assessment", duration: "60 min",
        topics: [
          { name: "Arrays & Strings", difficulty: "Easy" as Difficulty, frequency: 5, confidence: 70 },
          { name: "Trees & Graphs", difficulty: "Medium" as Difficulty, frequency: 4, confidence: 50 },
        ],
      },
      {
        type: "Technical" as RoundType, name: "Technical Interview ×3", duration: "45 min",
        topics: [
          { name: "Data Structures", difficulty: "Medium" as Difficulty, frequency: 5, confidence: 55 },
          { name: "System Design", difficulty: "Hard" as Difficulty, frequency: 3, confidence: 35 },
          { name: "OOP Design", difficulty: "Medium" as Difficulty, frequency: 4, confidence: 60 },
        ],
      },
      {
        type: "HR" as RoundType, name: "HR Round", duration: "30 min",
        topics: [
          { name: "Behavioral (STAR)", difficulty: "Easy" as Difficulty, frequency: 5, confidence: 72 },
        ],
      },
    ],
    interviewReports: 258, rating: 4.4,
    tags: ["FAANG", "SWE", "Cloud"],
    recentActivity: "Hiring ongoing · Last updated 5 days ago",
  },
  {
    id: "amazon", name: "Amazon", abbr: "Am", color: "#FF9900",
    sector: "Tech", difficulty: "Hard" as Difficulty,
    avgPackage: "₹38 LPA", openRoles: 20,
    eligibility: { cgpa: 6.0, branches: ["CSE", "IT", "ECE", "EEE", "ME", "MCA"], backlogs: 1, graduationYears: [2024, 2025] },
    rounds: [
      {
        type: "OA" as RoundType, name: "Online Assessment", duration: "105 min",
        topics: [
          { name: "Coding Problems ×2", difficulty: "Medium" as Difficulty, frequency: 5, confidence: 60 },
          { name: "Work Simulation", difficulty: "Easy" as Difficulty, frequency: 4, confidence: 65 },
        ],
      },
      {
        type: "Technical" as RoundType, name: "Technical + LP Round ×2", duration: "60 min",
        topics: [
          { name: "DSA", difficulty: "Medium" as Difficulty, frequency: 5, confidence: 58 },
          { name: "Leadership Principles", difficulty: "Medium" as Difficulty, frequency: 5, confidence: 50 },
          { name: "System Design", difficulty: "Hard" as Difficulty, frequency: 3, confidence: 32 },
        ],
      },
      {
        type: "Managerial" as RoundType, name: "Bar Raiser", duration: "60 min",
        topics: [
          { name: "Leadership Principles", difficulty: "Hard" as Difficulty, frequency: 5, confidence: 48 },
          { name: "Situational Judgment", difficulty: "Medium" as Difficulty, frequency: 4, confidence: 55 },
        ],
      },
    ],
    interviewReports: 512, rating: 4.2,
    tags: ["FAANG", "SDE", "E-commerce"],
    recentActivity: "Actively hiring · Last updated 1 day ago",
  },
  {
    id: "goldman", name: "Goldman Sachs", abbr: "GS", color: "#1E3A5F",
    sector: "Finance", difficulty: "Hard" as Difficulty,
    avgPackage: "₹24 LPA", openRoles: 5,
    eligibility: { cgpa: 7.5, branches: ["CSE", "IT", "ECE", "Math", "Physics"], backlogs: 0, graduationYears: [2024, 2025] },
    rounds: [
      {
        type: "OA" as RoundType, name: "HackerRank Assessment", duration: "90 min",
        topics: [
          { name: "Competitive Programming", difficulty: "Hard" as Difficulty, frequency: 5, confidence: 38 },
          { name: "Quantitative Aptitude", difficulty: "Medium" as Difficulty, frequency: 4, confidence: 55 },
        ],
      },
      {
        type: "Technical" as RoundType, name: "Technical Rounds ×3", duration: "45 min",
        topics: [
          { name: "Advanced DSA", difficulty: "Hard" as Difficulty, frequency: 5, confidence: 35 },
          { name: "Probability & Stats", difficulty: "Hard" as Difficulty, frequency: 4, confidence: 40 },
          { name: "System Design", difficulty: "Hard" as Difficulty, frequency: 3, confidence: 28 },
        ],
      },
      {
        type: "HR" as RoundType, name: "HR + Managerial", duration: "30 min",
        topics: [
          { name: "Finance Domain", difficulty: "Medium" as Difficulty, frequency: 4, confidence: 45 },
        ],
      },
    ],
    interviewReports: 186, rating: 4.5,
    tags: ["Finance", "Quant", "FinTech"],
    recentActivity: "Applications open · Last updated 3 days ago",
  },
  {
    id: "flipkart", name: "Flipkart", abbr: "Fk", color: "#F6A623",
    sector: "Tech", difficulty: "Medium" as Difficulty,
    avgPackage: "₹30 LPA", openRoles: 15,
    eligibility: { cgpa: 6.0, branches: ["CSE", "IT", "ECE", "EEE"], backlogs: 1, graduationYears: [2024, 2025] },
    rounds: [
      {
        type: "OA" as RoundType, name: "Coding Test", duration: "90 min",
        topics: [
          { name: "Data Structures", difficulty: "Medium" as Difficulty, frequency: 5, confidence: 62 },
          { name: "Algorithms", difficulty: "Medium" as Difficulty, frequency: 4, confidence: 58 },
        ],
      },
      {
        type: "Technical" as RoundType, name: "Technical Rounds ×2", duration: "60 min",
        topics: [
          { name: "System Design", difficulty: "Medium" as Difficulty, frequency: 4, confidence: 45 },
          { name: "Low Level Design", difficulty: "Medium" as Difficulty, frequency: 3, confidence: 40 },
        ],
      },
      {
        type: "HR" as RoundType, name: "HR Discussion", duration: "30 min",
        topics: [
          { name: "Behavioral", difficulty: "Easy" as Difficulty, frequency: 5, confidence: 78 },
        ],
      },
    ],
    interviewReports: 298, rating: 4.1,
    tags: ["E-commerce", "SDE", "Product"],
    recentActivity: "Campus hiring · Last updated 2 days ago",
  },
  {
    id: "infosys", name: "Infosys", abbr: "In", color: "#007DC6",
    sector: "IT Services", difficulty: "Easy" as Difficulty,
    avgPackage: "₹6.5 LPA", openRoles: 200,
    eligibility: { cgpa: 6.0, branches: ["ALL"], backlogs: 0, graduationYears: [2024, 2025] },
    rounds: [
      {
        type: "OA" as RoundType, name: "Infosys HackWithInfy / Written", duration: "60 min",
        topics: [
          { name: "Aptitude", difficulty: "Easy" as Difficulty, frequency: 5, confidence: 80 },
          { name: "Logical Reasoning", difficulty: "Easy" as Difficulty, frequency: 5, confidence: 75 },
          { name: "Basic Coding", difficulty: "Easy" as Difficulty, frequency: 4, confidence: 70 },
        ],
      },
      {
        type: "Technical" as RoundType, name: "Technical Interview", duration: "30 min",
        topics: [
          { name: "C/C++/Java Basics", difficulty: "Easy" as Difficulty, frequency: 5, confidence: 80 },
          { name: "DBMS", difficulty: "Easy" as Difficulty, frequency: 4, confidence: 72 },
        ],
      },
      {
        type: "HR" as RoundType, name: "HR Interview", duration: "20 min",
        topics: [
          { name: "Communication", difficulty: "Easy" as Difficulty, frequency: 5, confidence: 85 },
        ],
      },
    ],
    interviewReports: 1245, rating: 3.8,
    tags: ["Mass Recruiter", "IT Services", "Fresher"],
    recentActivity: "Bulk hiring open · Last updated today",
  },
];

const QUESTIONS_DATA = [
  {
    id: "q1", text: "Given an array of integers, find the maximum sum subarray using Kadane's Algorithm. Analyze time and space complexity.",
    company: "Google", role: "SWE", round: "OA" as RoundType,
    difficulty: "Medium" as Difficulty, source: "reported" as Source,
    tags: ["Arrays", "DP", "Greedy"], year: 2024, saved: false, upvotes: 234,
    answer: "Use Kadane's Algorithm: track current_sum and max_sum. If current_sum < 0, reset to 0. O(n) time, O(1) space.",
  },
  {
    id: "q2", text: "Design a URL shortening service like bit.ly. Discuss architecture, database schema, caching strategy, and scaling to 1 billion requests/day.",
    company: "Amazon", role: "SDE-2", round: "Technical" as RoundType,
    difficulty: "Hard" as Difficulty, source: "reported" as Source,
    tags: ["System Design", "Database", "Scaling"], year: 2024, saved: true, upvotes: 189,
    answer: "Use base62 encoding for IDs, distributed ID generation (Snowflake), read-heavy caching with Redis, CDN for redirects.",
  },
  {
    id: "q3", text: "Implement an LRU Cache with O(1) get and O(1) put operations.",
    company: "Microsoft", role: "SWE", round: "Technical" as RoundType,
    difficulty: "Medium" as Difficulty, source: "official" as Source,
    tags: ["Data Structures", "HashMap", "LinkedList"], year: 2023, saved: false, upvotes: 312,
    answer: "Combine HashMap + Doubly Linked List. HashMap gives O(1) lookup; DLL enables O(1) insertion & deletion.",
  },
  {
    id: "q4", text: "Explain the CAP theorem. How does it apply when designing a distributed key-value store?",
    company: "Goldman Sachs", role: "Technology Analyst", round: "Technical" as RoundType,
    difficulty: "Hard" as Difficulty, source: "ai-generated" as Source,
    tags: ["Distributed Systems", "Database", "Theory"], year: 2024, saved: false, upvotes: 145,
    answer: "CAP: Consistency, Availability, Partition Tolerance — only 2 of 3 simultaneously. Choose CP (like HBase) or AP (like Cassandra).",
  },
  {
    id: "q5", text: "Tell me about a time when you had a conflict with a team member. How did you handle it?",
    company: "Amazon", role: "SDE", round: "Managerial" as RoundType,
    difficulty: "Medium" as Difficulty, source: "reported" as Source,
    tags: ["Behavioral", "Leadership Principles", "STAR"], year: 2024, saved: true, upvotes: 167,
    answer: "Use STAR format. Focus on constructive resolution, learning, and alignment with Amazon LP: Disagree and Commit.",
  },
  {
    id: "q6", text: "What is the time complexity of building a heap from an unordered array? Why is it O(n) and not O(n log n)?",
    company: "Flipkart", role: "SWE", round: "OA" as RoundType,
    difficulty: "Medium" as Difficulty, source: "reported" as Source,
    tags: ["Heaps", "Complexity", "DSA"], year: 2023, saved: false, upvotes: 98,
    answer: "O(n) via bottom-up heapification. Only half the nodes need sifting, and most are near leaves. Geometric series sums to O(n).",
  },
  {
    id: "q7", text: "Design the backend for a real-time collaborative code editor like Google Docs with multi-user conflict resolution.",
    company: "Google", role: "SWE", round: "Technical" as RoundType,
    difficulty: "Hard" as Difficulty, source: "ai-prediction" as Source,
    tags: ["System Design", "Real-time", "OT/CRDT"], year: 2024, saved: false, upvotes: 221,
    answer: "Use Operational Transformation or CRDTs for conflict resolution. WebSockets for real-time sync. Redis pub/sub for presence.",
  },
  {
    id: "q8", text: "Implement binary search on a rotated sorted array. Handle duplicates.",
    company: "Microsoft", role: "SWE", round: "OA" as RoundType,
    difficulty: "Medium" as Difficulty, source: "official" as Source,
    tags: ["Binary Search", "Arrays"], year: 2024, saved: false, upvotes: 278,
    answer: "Find the pivot using modified binary search first. Then determine which half the target lies in and binary search there.",
  },
  {
    id: "q9", text: "Explain virtual memory, paging tables, and page fault handling. How does TLB improve performance?",
    company: "Google", role: "SWE", round: "Technical" as RoundType,
    difficulty: "Medium" as Difficulty, source: "reported" as Source,
    tags: ["OS", "Memory Management"], year: 2023, saved: false, upvotes: 134,
    answer: "Virtual memory allows processes to use more than physical RAM via page tables. TLB caches page table entries for fast translation.",
  },
  {
    id: "q10", text: "What is the Birthday Paradox? In a room of 23 people, what is the probability that at least two share a birthday?",
    company: "Goldman Sachs", role: "Technology Analyst", round: "Technical" as RoundType,
    difficulty: "Hard" as Difficulty, source: "ai-generated" as Source,
    tags: ["Probability", "Quantitative", "Math"], year: 2024, saved: true, upvotes: 89,
    answer: "P = 1 - 365!/((365-n)! × 365^n). At n=23, P ≈ 50.7%. Counterintuitive due to the quadratic growth in pair comparisons.",
  },
];

const PROGRESS_DATA = {
  weekly: [
    { day: "Mon", questions: 12 }, { day: "Tue", questions: 8 },
    { day: "Wed", questions: 20 }, { day: "Thu", questions: 5 },
    { day: "Fri", questions: 18 }, { day: "Sat", questions: 25 },
    { day: "Sun", questions: 15 },
  ],
  topicCoverage: [
    { topic: "Arrays", coverage: 78, fill: "#4F46E5" },
    { topic: "Trees", coverage: 65, fill: "#7C3AED" },
    { topic: "OS/CN", coverage: 52, fill: "#2563EB" },
    { topic: "Behavioral", coverage: 70, fill: "#0891B2" },
    { topic: "DP", coverage: 45, fill: "#F59E0B" },
    { topic: "Graphs", coverage: 32, fill: "#EF4444" },
    { topic: "System Design", coverage: 28, fill: "#DC2626" },
  ],
  scoreHistory: [
    { week: "W1", score: 42 }, { week: "W2", score: 51 },
    { week: "W3", score: 58 }, { week: "W4", score: 65 },
    { week: "W5", score: 62 }, { week: "W6", score: 72 },
    { week: "W7", score: 78 },
  ],
  radarData: [
    { subject: "Arrays", A: 78 }, { subject: "DP", A: 45 },
    { subject: "Graphs", A: 32 }, { subject: "Trees", A: 65 },
    { subject: "Design", A: 28 }, { subject: "Behavioral", A: 70 },
  ],
};

const MOCK_QUESTIONS = [
  {
    id: 1,
    question: "Given an array of n integers, find all pairs that sum to a target value k. Optimize for both time and space complexity, and discuss trade-offs.",
    followUp: "What if the input array is already sorted? How would your approach change? What's the new complexity?",
    hint: "Consider using a HashMap for O(n) time with O(n) space, or two pointers for O(n log n) time with O(1) space if sorted.",
    difficulty: "Medium" as Difficulty, timeLimit: 180,
    tags: ["Arrays", "HashMap", "Two Pointers"],
  },
  {
    id: 2,
    question: "Explain the difference between a process and a thread. When would you choose multi-processing over multi-threading?",
    followUp: "How do threads communicate with each other? What synchronization primitives are available and what problems do they solve?",
    hint: "Think about memory sharing, context switching overhead, and use-cases like CPU-bound vs I/O-bound tasks.",
    difficulty: "Medium" as Difficulty, timeLimit: 120,
    tags: ["OS", "Concurrency"],
  },
  {
    id: 3,
    question: "Design a push notification system that delivers 1 million notifications per minute across email, SMS, and push. How would you ensure at-least-once delivery?",
    followUp: "How would you handle notification failures and retries? What if a user's device is offline for 3 days?",
    hint: "Consider message queues (Kafka/SQS), fan-out pattern, rate limiting per channel, and exponential backoff for retries.",
    difficulty: "Hard" as Difficulty, timeLimit: 240,
    tags: ["System Design", "Scalability", "Queues"],
  },
];

// ─── UTILITY COMPONENTS ────────────────────────────────────────────────────────

function SourceBadge({ type }: { type: Source }) {
  const cfg = {
    official: { label: "Official", cls: "bg-blue-50 text-blue-700 border-blue-200", Icon: Shield },
    reported: { label: "Reported", cls: "bg-emerald-50 text-emerald-700 border-emerald-200", Icon: Users },
    "ai-generated": { label: "AI Generated", cls: "bg-violet-50 text-violet-700 border-violet-200", Icon: Sparkles },
    "ai-prediction": { label: "AI Prediction", cls: "bg-amber-50 text-amber-700 border-amber-200", Icon: Brain },
  }[type];
  const { label, cls, Icon } = cfg;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${cls}`}>
      <Icon size={10} />
      {label}
    </span>
  );
}

function DiffBadge({ d }: { d: Difficulty }) {
  const cls = { Easy: "bg-emerald-50 text-emerald-700", Medium: "bg-amber-50 text-amber-700", Hard: "bg-red-50 text-red-700" }[d];
  return <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold ${cls}`}>{d}</span>;
}

function RoundBadge({ type }: { type: RoundType }) {
  const cls = {
    OA: "bg-cyan-50 text-cyan-700",
    Technical: "bg-indigo-50 text-indigo-700",
    Managerial: "bg-orange-50 text-orange-700",
    HR: "bg-pink-50 text-pink-700",
  }[type];
  return <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold ${cls}`}>{type}</span>;
}

function CompanyAvatar({ company }: { company: (typeof COMPANIES_DATA)[0] }) {
  return (
    <div
      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
      style={{ backgroundColor: company.color }}
    >
      {company.abbr}
    </div>
  );
}

function RadialScore({ score, size = 140 }: { score: number; size?: number }) {
  const r = size / 2 - 14;
  const circ = 2 * Math.PI * r;
  const filled = (score / 100) * circ;
  const color = score >= 70 ? "#4F46E5" : score >= 50 ? "#F59E0B" : "#EF4444";
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E2E8F0" strokeWidth={11} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={11}
          strokeLinecap="round" strokeDasharray={`${filled} ${circ}`} />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-bold text-slate-900">{score}</span>
        <span className="text-xs text-slate-400 font-medium">/ 100</span>
      </div>
    </div>
  );
}

function Bar2({ value, color = "bg-indigo-500" }: { value: number; color?: string }) {
  return (
    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
      <div className={`h-full ${color} rounded-full`} style={{ width: `${value}%` }} />
    </div>
  );
}

// ─── LANDING PAGE ──────────────────────────────────────────────────────────────

function LandingPage({ onStart }: { onStart: () => void }) {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-slate-100 px-6 py-4 flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur-md z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center">
            <Brain size={17} className="text-white" />
          </div>
          <span className="font-bold text-lg text-slate-900">Interview<span className="text-indigo-600">IQ</span></span>
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button className="hover:text-slate-900 transition-colors">Features</button>
          <button className="hover:text-slate-900 transition-colors">Companies</button>
          <button className="hover:text-slate-900 transition-colors">Pricing</button>
          <button onClick={onStart} className="bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition-colors">
            Get Started Free
          </button>
        </div>
        <button onClick={onStart} className="md:hidden bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm font-semibold">
          Get Started
        </button>
      </nav>

      {/* Hero */}
      <section className="py-20 px-6 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full text-sm font-semibold mb-6 border border-indigo-100">
          <Sparkles size={13} />
          RAG-Powered · Company-Specific · AI Mock Interviews
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 leading-[1.1] mb-6">
          Land Your Dream Job with
          <span className="text-indigo-600"> Company-Specific</span> AI Prep
        </h1>
        <p className="text-xl text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed">
          InterviewIQ uses RAG and real interview data to prepare you for exactly the interviews you will face — at Google, Amazon, Goldman Sachs, and 200+ companies.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button onClick={onStart} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl text-base font-bold hover:bg-indigo-700 transition-all hover:shadow-xl hover:shadow-indigo-200 flex items-center gap-2">
            Start Free Preparation <ArrowRight size={18} />
          </button>
          <button className="flex items-center gap-2 text-slate-700 px-6 py-4 rounded-2xl border border-slate-200 hover:border-slate-300 transition-colors font-semibold">
            <Play size={15} className="text-indigo-600" fill="currentColor" /> Watch 2-min Demo
          </button>
        </div>
        <p className="text-sm text-slate-400 mt-4">No credit card required · 5,000+ students placed at top companies</p>
      </section>

      {/* Stats Banner */}
      <section className="bg-indigo-600 py-12 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[["200+", "Companies Covered"], ["50K+", "Interview Questions"], ["92%", "Success Rate"], ["5K+", "Students Placed"]].map(([n, l]) => (
            <div key={l}>
              <div className="text-3xl font-extrabold text-white">{n}</div>
              <div className="text-indigo-200 text-sm mt-1">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-3">Everything You Need to Crack Any Interview</h2>
          <p className="text-slate-500 max-w-xl mx-auto">Built specifically for campus placements and fresher hiring at top companies.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: Brain, color: "bg-indigo-50 text-indigo-600", title: "RAG-Powered Preparation", desc: "Answers grounded in real company docs, JDs, and 50K+ reported interview experiences. Not hallucinated — verified and sourced." },
            { icon: Building2, color: "bg-emerald-50 text-emerald-600", title: "Company-Specific Roadmaps", desc: "Know exactly what rounds to expect, which topics to prioritize, difficulty per topic, and frequency — per company, per role." },
            { icon: MessageSquare, color: "bg-violet-50 text-violet-600", title: "AI Mock Interviewer", desc: "Simulate real interviews with adaptive follow-up questions, timer pressure, and a detailed performance scorecard." },
            { icon: FileText, color: "bg-orange-50 text-orange-600", title: "Resume Match Score", desc: "Upload your resume and get company-fit scores, skill gap analysis, and likely interview questions based on your profile." },
            { icon: Shield, color: "bg-blue-50 text-blue-600", title: "Source Transparency", desc: "Every question clearly labeled: Official, Reported, AI Generated, or AI Prediction. Know your source, trust your prep." },
            { icon: Target, color: "bg-pink-50 text-pink-600", title: "Eligibility Checker", desc: "Instantly know if you qualify for any company based on CGPA, degree, graduation year, backlogs, and experience." },
          ].map(({ icon: Icon, color, title, desc }) => (
            <div key={title} className="p-6 rounded-2xl border border-slate-100 hover:border-indigo-100 hover:shadow-md hover:shadow-indigo-50 transition-all group">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color} mb-4`}>
                <Icon size={22} />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">{title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 bg-slate-50 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-3">From Zero to Offer in 4 Steps</h2>
          <p className="text-slate-500 mb-14">Your structured path to placement success.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { n: "01", t: "Set Your Target", d: "Choose target companies and roles. Set interview date." },
              { n: "02", t: "Check Eligibility", d: "Verify you meet each company's CGPA, branch, and backlog criteria." },
              { n: "03", t: "Follow the Roadmap", d: "Study AI-curated topics in the right order, at the right depth." },
              { n: "04", t: "Practice & Improve", d: "Take mock interviews, get feedback, track progress weekly." },
            ].map(({ n, t, d }) => (
              <div key={n}>
                <div className="w-12 h-12 rounded-full bg-indigo-600 text-white font-bold text-lg flex items-center justify-center mx-auto mb-3">{n}</div>
                <h3 className="font-bold text-slate-900 mb-1.5">{t}</h3>
                <p className="text-sm text-slate-500">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 text-center">
        <h2 className="text-3xl font-bold text-slate-900 mb-3">Ready to Crack Your Dream Interview?</h2>
        <p className="text-slate-500 mb-8 max-w-xl mx-auto">Join 5,000+ students who landed offers at Google, Amazon, Microsoft, and 200+ companies.</p>
        <button onClick={onStart} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl text-base font-bold hover:bg-indigo-700 transition-all inline-flex items-center gap-2 hover:shadow-xl hover:shadow-indigo-200">
          Start Free Preparation <ArrowRight size={18} />
        </button>
      </section>

      <footer className="border-t border-slate-100 py-8 px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-400">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Brain size={12} className="text-white" />
          </div>
          <span className="font-semibold text-slate-600">InterviewIQ</span>
          <span>© 2025 All rights reserved.</span>
        </div>
        <div className="flex gap-6">
          {["Privacy", "Terms", "Contact", "Blog"].map(l => (
            <a key={l} href="#" className="hover:text-slate-600 transition-colors">{l}</a>
          ))}
        </div>
      </footer>
    </div>
  );
}

// ─── DASHBOARD PAGE ────────────────────────────────────────────────────────────

function DashboardPage({ onNav }: { onNav: (p: Page) => void }) {
  const target = COMPANIES_DATA[0];
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-0.5">Welcome back, Aryan · Thursday, 12 June 2025</p>
        </div>
        <button onClick={() => onNav("companies")} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors">
          <Plus size={15} /> Add Target Company
        </button>
      </div>

      {/* Primary Target + Readiness */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-slate-800">Primary Target</h2>
            <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 rounded-full font-semibold">
              📅 Interview in 14 days
            </span>
          </div>
          <div className="flex items-center gap-4 mb-5">
            <CompanyAvatar company={target} />
            <div className="flex-1">
              <h3 className="font-bold text-xl text-slate-900">{target.name}</h3>
              <p className="text-slate-500 text-sm">Software Engineer · New Grad 2025</p>
            </div>
            <div className="flex items-center gap-1">
              <Star size={14} className="text-amber-400 fill-amber-400" />
              <span className="font-bold text-slate-700 text-sm">{target.rating}</span>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-3 mb-5">
            {[
              ["Rounds", target.rounds.length], ["Avg CTC", target.avgPackage],
              ["Reports", target.interviewReports], ["Min CGPA", `${target.eligibility.cgpa}+`],
            ].map(([l, v]) => (
              <div key={String(l)} className="bg-slate-50 rounded-xl p-3 text-center">
                <div className="font-bold text-slate-900 text-sm">{v}</div>
                <div className="text-xs text-slate-500 mt-0.5">{l}</div>
              </div>
            ))}
          </div>
          <p className="text-sm font-semibold text-slate-700 mb-3">Round Preparation Status</p>
          <div className="space-y-2.5">
            {[
              ["Online Assessment", 72, true], ["Technical Round 1", 45, false],
              ["Technical Round 2", 38, false], ["HR Discussion", 80, true],
            ].map(([r, p, ok]) => (
              <div key={String(r)} className="flex items-center gap-3">
                <span className="text-xs text-slate-600 w-44 flex-shrink-0">{r}</span>
                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${ok ? "bg-indigo-500" : "bg-amber-400"}`} style={{ width: `${p}%` }} />
                </div>
                <span className="text-xs text-slate-400 w-7 text-right">{p}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col items-center gap-4">
          <h2 className="font-bold text-slate-800 self-start">Overall Readiness</h2>
          <RadialScore score={68} />
          <div className="w-full space-y-2.5">
            {[["Technical Skills", 62, "bg-indigo-500"], ["Soft Skills", 78, "bg-violet-500"], ["Practice Score", 55, "bg-cyan-500"]].map(([l, v, c]) => (
              <div key={String(l)} className="flex items-center gap-2">
                <span className="text-xs text-slate-600 w-28 flex-shrink-0">{l}</span>
                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full ${c} rounded-full`} style={{ width: `${v}%` }} />
                </div>
                <span className="text-xs text-slate-400 w-5">{v}</span>
              </div>
            ))}
          </div>
          <div className="w-full bg-amber-50 border border-amber-200 rounded-xl p-3">
            <p className="text-xs text-amber-700 font-semibold">⚠ Focus needed: System Design (28%)</p>
          </div>
          <button onClick={() => onNav("preparation")} className="w-full text-sm text-indigo-600 font-semibold text-center hover:underline">
            View Full Roadmap →
          </button>
        </div>
      </div>

      {/* Activity Chart + Weak Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-800">Weekly Activity</h2>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span>This week: <strong className="text-slate-800">103 questions</strong></span>
              <span className="text-amber-600 font-semibold">🔥 7-day streak</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={PROGRESS_DATA.weekly}>
              <defs>
                <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ border: "1px solid #E2E8F0", borderRadius: 12, fontSize: 12, background: "#fff" }} />
              <Area type="monotone" dataKey="questions" stroke="#4F46E5" strokeWidth={2.5} fill="url(#ag)" name="Questions Solved" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-bold text-slate-800 mb-4">Weak Areas</h2>
          <div className="space-y-3">
            {[
              ["System Design", 28, true], ["Graph Algorithms", 32, true],
              ["Dynamic Programming", 35, false], ["Probability & Stats", 40, false],
              ["OS Concepts", 52, false],
            ].map(([topic, score, bad]) => (
              <div key={String(topic)} className="flex items-center gap-2">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-700 font-medium">{topic}</span>
                    <span className="text-xs text-slate-400">{score}%</span>
                  </div>
                  <Bar2 value={Number(score)} color={bad ? "bg-red-400" : "bg-amber-400"} />
                </div>
                {bad ? <TrendingDown size={13} className="text-red-400 flex-shrink-0" /> : <TrendingUp size={13} className="text-emerald-500 flex-shrink-0" />}
              </div>
            ))}
          </div>
          <button onClick={() => onNav("progress")} className="mt-4 w-full text-xs text-indigo-600 font-semibold text-center hover:underline">
            View Analytics →
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="font-bold text-slate-800 mb-4">Recent Activity</h2>
        <div className="space-y-3">
          {[
            { a: "Completed Mock Interview", d: "Google SWE · Score: 74/100", t: "2h ago", Icon: MessageSquare, cls: "text-indigo-600 bg-indigo-50" },
            { a: "Solved 8 Questions", d: "Arrays & Strings · Medium difficulty", t: "5h ago", Icon: CheckCircle2, cls: "text-emerald-600 bg-emerald-50" },
            { a: "Eligibility Check Passed", d: "Goldman Sachs · All criteria met ✓", t: "Yesterday", Icon: Shield, cls: "text-blue-600 bg-blue-50" },
            { a: "Saved Question", d: '"Design a URL shortening service"', t: "Yesterday", Icon: Bookmark, cls: "text-violet-600 bg-violet-50" },
          ].map(({ a, d, t, Icon, cls }) => (
            <div key={a} className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${cls}`}>
                <Icon size={15} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-800">{a}</p>
                <p className="text-xs text-slate-500">{d}</p>
              </div>
              <span className="text-xs text-slate-400 flex-shrink-0">{t}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── COMPANIES PAGE ────────────────────────────────────────────────────────────

function CompaniesPage({ onNav }: { onNav: (p: Page) => void }) {
  const [search, setSearch] = useState("");
  const [diff, setDiff] = useState("All");
  const [sector, setSector] = useState("All");
  const [selected, setSelected] = useState<string | null>(null);
  const [roundTab, setRoundTab] = useState(0);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCompanies()
      .then((data) => {
        setCompanies(data);
      })
      .catch((error) => {
        console.error("Failed to load companies:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const filtered = companies.filter(c => {
    const ms = c.name.toLowerCase().includes(search.toLowerCase());
    const md = diff === "All" || c.difficulty === diff;
    const msc = sector === "All" || c.sector === sector;
    return ms && md && msc;
  });

  const co = selected ? companies.find(c => c.id === selected) : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-slate-500">Loading companies...</p>
      </div>
    );
  }

  if (co) {
    return (
      <div className="space-y-5">
        <button onClick={() => setSelected(null)} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors font-medium">
          <ChevronLeft size={16} /> Back to Companies
        </button>

        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            <CompanyAvatar company={co} />
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-slate-900">{co.name}</h1>
                <DiffBadge d={co.difficulty} />
                {co.tags.map(t => <span key={t} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">{t}</span>)}
              </div>
              <p className="text-slate-500 text-sm">{co.sector} · {co.recentActivity}</p>
              <div className="flex flex-wrap gap-5 mt-3">
                {[[co.avgPackage, "Avg Package"], [co.openRoles, "Open Roles"], [co.interviewReports, "Reports"]].map(([v, l]) => (
                  <div key={String(l)}>
                    <span className="font-bold text-slate-900">{v}</span>
                    <span className="text-xs text-slate-500 ml-1">{l}</span>
                  </div>
                ))}
                <div className="flex items-center gap-1">
                  <Star size={13} className="text-amber-400 fill-amber-400" />
                  <span className="font-bold text-slate-900">{co.rating}</span>
                </div>
              </div>
            </div>
            <button onClick={() => onNav("preparation")} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-2 flex-shrink-0">
              <BookOpen size={15} /> Start Prep
            </button>
          </div>
        </div>

        {/* Eligibility Checker */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Shield size={17} className="text-indigo-600" /> Eligibility for Your Profile</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {[
              { l: "Min CGPA", req: `${co.eligibility.cgpa}+`, yours: "8.2", ok: true },
              { l: "Backlogs", req: `Max ${co.eligibility.backlogs}`, yours: "0", ok: true },
              { l: "Branch", req: co.eligibility.branches.slice(0, 3).join(", ") + (co.eligibility.branches.length > 3 ? "..." : ""), yours: "CSE", ok: true },
              { l: "Grad Year", req: co.eligibility.graduationYears.join(" / "), yours: "2025", ok: true },
            ].map(({ l, req, yours, ok }) => (
              <div key={l} className={`p-3 rounded-xl border ${ok ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"}`}>
                <div className="flex items-center gap-1.5 mb-1.5">
                  {ok ? <CheckCircle2 size={14} className="text-emerald-600" /> : <XCircle size={14} className="text-red-600" />}
                  <span className="text-xs font-semibold text-slate-700">{l}</span>
                </div>
                <p className="text-xs text-slate-500">Required: {req}</p>
                <p className="text-xs font-semibold text-slate-700">Yours: {yours}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl p-3">
            <CheckCircle2 size={16} className="text-emerald-600" />
            <span className="text-sm font-semibold text-emerald-700">You are fully eligible for {co.name}! All criteria met.</span>
          </div>
        </div>

        {/* Interview Roadmap */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-bold text-slate-800 mb-4">Interview Roadmap</h2>
          <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-1">
            {co.rounds.map((r, i) => (
              <div key={i} className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => setRoundTab(i)}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${roundTab === i ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                  {r.type}
                </button>
                {i < co.rounds.length - 1 && <ChevronRight size={14} className="text-slate-300" />}
              </div>
            ))}
          </div>
          {co.rounds[roundTab] && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <RoundBadge type={co.rounds[roundTab].type} />
                <span className="font-semibold text-slate-800">{co.rounds[roundTab].name}</span>
                <span className="ml-auto text-xs text-slate-500 flex items-center gap-1"><Clock size={12} />{co.rounds[roundTab].duration}</span>
              </div>
              <div className="space-y-3">
                {co.rounds[roundTab].topics.map((tp, ti) => (
                  <div key={ti} className="flex items-center gap-4 p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-sm font-semibold text-slate-800">{tp.name}</span>
                        <DiffBadge d={tp.difficulty} />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">Confidence:</span>
                        <div className="w-28 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${tp.confidence >= 70 ? "bg-emerald-500" : tp.confidence >= 50 ? "bg-amber-400" : "bg-red-400"}`} style={{ width: `${tp.confidence}%` }} />
                        </div>
                        <span className="text-xs text-slate-500">{tp.confidence}%</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <span className="text-xs text-slate-400 mr-1">Freq</span>
                      {Array.from({ length: 5 }).map((_, fi) => (
                        <div key={fi} className={`w-1.5 h-1.5 rounded-full ${fi < tp.frequency ? "bg-indigo-500" : "bg-slate-200"}`} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Interview Reports */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            Interview Reports
            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">{co.interviewReports} verified</span>
          </h2>
          <div className="space-y-4">
            {[
              { name: "Rahul S.", role: "SWE Intern", result: "Selected", date: "May 2025", rounds: "OA → Tech 1 → Tech 2 → HR", comment: "OA had 3 medium LC problems (arrays, DP, graphs). Tech rounds focused heavily on system design basics and OS. HR was casual — discuss passion and career goals. Overall friendly process.", src: "reported" as Source },
              { name: "Priya M.", role: "SWE New Grad", result: "Rejected", date: "Apr 2025", rounds: "OA → Tech 1 → Tech 2", comment: "OA was manageable (easy-medium). Got eliminated at system design in Tech Round 2. Recommend heavy system design prep — they expect depth for new grads too. Don't neglect it.", src: "reported" as Source },
              { name: "Arjun K.", role: "SWE", result: "Selected", date: "Mar 2025", rounds: "OA → Tech ×3 → HR", comment: "Three technical rounds! Very thorough. Each had a DSA + conceptual portion. Googleyness round tested conflict resolution scenarios. Received offer within 5 days.", src: "reported" as Source },
            ].map((rpt, i) => (
              <div key={i} className="border border-slate-100 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm flex items-center justify-center">{rpt.name[0]}</div>
                  <span className="text-sm font-semibold text-slate-800">{rpt.name}</span>
                  <span className="text-xs text-slate-400">{rpt.role} · {rpt.date}</span>
                  <div className="ml-auto flex items-center gap-2">
                    <SourceBadge type={rpt.src} />
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${rpt.result === "Selected" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>{rpt.result}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mb-1.5">Rounds: {rpt.rounds}</p>
                <p className="text-sm text-slate-600 leading-relaxed">{rpt.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Companies</h1>
        <p className="text-slate-500 text-sm mt-0.5">Browse 200+ companies with detailed interview insights and roadmaps</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search companies..." className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["All", "Easy", "Medium", "Hard"].map(d => (
            <button key={d} onClick={() => setDiff(d)}
              className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${diff === d ? "bg-indigo-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>{d}</button>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          {["All", "Tech", "Finance", "IT Services"].map(s => (
            <button key={s} onClick={() => setSector(s)}
              className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${sector === s ? "bg-slate-900 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>{s}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(c => (
          <div key={c.id} onClick={() => { setSelected(c.id); setRoundTab(0); }}
            className="bg-white rounded-2xl border border-slate-200 p-5 cursor-pointer hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-50 transition-all group">
            <div className="flex items-start gap-3 mb-3">
              <CompanyAvatar company={c} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <h3 className="font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">{c.name}</h3>
                  <DiffBadge d={c.difficulty} />
                </div>
                <p className="text-xs text-slate-500">{c.sector} · {c.openRoles} open roles</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1 mb-3">
              {c.tags.map(t => <span key={t} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">{t}</span>)}
            </div>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {[[c.avgPackage, "Avg CTC"], [c.interviewReports, "Reports"], [c.rating, "Rating"]].map(([v, l], i) => (
                <div key={String(l)} className="text-center">
                  <div className="text-sm font-bold text-slate-900 flex items-center justify-center gap-0.5">
                    {i === 2 && <Star size={11} className="text-amber-400 fill-amber-400" />}{v}
                  </div>
                  <div className="text-xs text-slate-500">{l}</div>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1"><Clock size={10} />{c.recentActivity}</p>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20">
          <Building2 size={44} className="text-slate-200 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No companies match your search.</p>
          <p className="text-slate-400 text-sm">Try adjusting filters or search terms.</p>
        </div>
      )}
    </div>
  );
}

// ─── PREPARATION PAGE ──────────────────────────────────────────────────────────

function PreparationPage() {
  const [coId, setCoId] = useState("google");
  const [customCompany, setCustomCompany] = useState("");
  const [roundTab, setRoundTab] = useState(0);
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");
  const [aiSources, setAiSources] = useState<any[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [interviewIntelligence, setInterviewIntelligence] = useState<any>(null);
  const [intelligenceLoading, setIntelligenceLoading] = useState(false);
  const [intelligenceError, setIntelligenceError] = useState("");
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCompanies()
      .then((data) => {
        setCompanies(data);
      })
      .catch((error) => {
        console.error("Failed to load companies:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

    const selectedCompany = companies.find(c => c.id === coId);

const activeCompanyName =
  coId === "custom"
    ? customCompany.trim()
    : selectedCompany?.name || "";

const co = selectedCompany || {
  id: "custom",
  name: activeCompanyName || "Company",
  abbr: activeCompanyName
    ? activeCompanyName.substring(0, 2).toUpperCase()
    : "CO",
  color: "#4F46E5",
  sector: "Technology",
  difficulty: "Hard" as Difficulty,
  avgPackage: "N/A",
  interviewReports: 0,
  rating: 0,
  rounds: [],
  tags: [],
  recentActivity: "Live web research",
  eligibility: {
    cgpa: 0,
    branches: [],
    backlogs: 0,
    graduationYears: []
  }
};

  const roundIconMap: Record<string, typeof Code2> = {
    OA: Hash,
    Technical: Code2,
    Managerial: Briefcase,
    HR: Users
  };

  const roundColorMap: Record<string, string> = {
    OA: "bg-cyan-50 text-cyan-700",
    Technical: "bg-indigo-50 text-indigo-700",
    Managerial: "bg-orange-50 text-orange-700",
    HR: "bg-pink-50 text-pink-700"
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-slate-500">Loading preparation data...</p>
      </div>
    );
  }

  if (!co) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500">Company data not found.</p>
      </div>
    );
  }

  const aiAnalysis = (() => {
    if (!interviewIntelligence?.analysis) return null;

    try {
      if (typeof interviewIntelligence.analysis === "object") {
        return interviewIntelligence.analysis;
      }

      let raw = interviewIntelligence.analysis
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

      return JSON.parse(raw);
    } catch {
      return null;
    }
  })();

  const roadmapRounds =
  Array.isArray(aiAnalysis?.rounds)
    ? aiAnalysis.rounds
    : [];

    if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-slate-500">Loading preparation data...</p>
      </div>
    );
  }

  if (!co) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500">Company data not found.</p>
      </div>
    );
  }

    async function handleAskAI() {
    if (!aiQuestion.trim()) return;

const companyName = activeCompanyName;

if (!companyName) return;

setAiLoading(true);
    setAiError("");
    setAiAnswer("");
    setAiSources([]);

    try {
      const result = await askRAG(
  aiQuestion,
  companyName,
        "SDE / Software Engineering",
        undefined,
        3
      );

      setAiAnswer(result.answer || "");
      setAiSources(result.sources || []);
    } catch (error) {
      console.error("RAG request failed:", error);
      setAiError("Unable to get an AI answer. Please try again.");
    } finally {
      setAiLoading(false);
    }
  }

  async function loadInterviewIntelligence() {
const companyName = activeCompanyName;

if (!companyName) return;

    setIntelligenceLoading(true);
    setIntelligenceError("");

    try {
const result = await getInterviewIntelligence(
  companyName,
        "SDE / Software Engineering",
        10
      );

setInterviewIntelligence(result);
setAiSources(result.sources || []);

console.log("Interview Intelligence:", result);
    } catch (error) {
      console.error("Interview intelligence request failed:", error);
      setIntelligenceError(
        "Unable to load interview intelligence."
      );
    } finally {
      setIntelligenceLoading(false);
    }
  }
  return (
    <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-indigo-100 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Brain size={18} />
          </div>

          <div>
            <h2 className="font-bold text-slate-900">
              AI Interview Assistant
            </h2>
            <p className="text-xs text-slate-500">
              Ask questions grounded in real interview evidence
            </p>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <input
            value={aiQuestion}
            onChange={(e) => setAiQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleAskAI();
              }
            }}
            placeholder={`Ask anything about ${activeCompanyName || "this company"} interviews...`}
            className="flex-1 px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <button
            onClick={handleAskAI}
            disabled={aiLoading || !aiQuestion.trim()}
            className="bg-indigo-600 text-white px-5 py-3 rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {aiLoading ? (
              "Thinking..."
            ) : (
              <>
                Ask AI <Send size={15} />
              </>
            )}
          </button>
        </div>

        {aiError && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">
            {aiError}
          </div>
        )}

        {aiAnswer && (
          <div className="mt-5 bg-slate-50 rounded-xl p-5 border border-slate-100">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={15} className="text-indigo-600" />
              <span className="font-semibold text-slate-800">
                InterviewIQ Answer
              </span>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
              {aiAnswer}
            </p>

            {aiSources.length > 0 && (
              <div className="mt-5 pt-4 border-t border-slate-200">
                <p className="text-xs font-semibold text-slate-500 mb-2">
                  Sources used
                </p>

                <div className="space-y-2">
                  {aiSources.map((source, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between gap-3 bg-white rounded-lg border border-slate-100 px-3 py-2"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-700 truncate">
                          {source.source_name}
                        </p>

                        <p className="text-[11px] text-slate-400">
                          {source.source_type} · {source.published_date || "Date unavailable"}
                        </p>
                      </div>

                      {source.source_url && (
                        <a
                          href={source.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-800 flex-shrink-0"
                        >
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
<div className="flex items-center justify-between flex-wrap gap-3">
  <div>
    <h1 className="text-2xl font-bold text-slate-900">
      Interview Preparation
    </h1>
    <p className="text-slate-500 text-sm mt-0.5">
      Step-by-step roadmap with topics, confidence tracking, and sources
    </p>
  </div>

  <div className="flex items-center gap-3 flex-wrap">

    <select
      value={coId}
      onChange={(e) => {
        setCoId(e.target.value);
        setRoundTab(0);
        setInterviewIntelligence(null);
        setIntelligenceError("");
        setCustomCompany("");
      }}
      className="w-48 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
    >
      {companies.map((c) => (
        <option key={c.id} value={c.id}>
          {c.name}
        </option>
      ))}

      <option value="custom">
        Other / Enter Company
      </option>
    </select>

    {coId === "custom" && (
      <input
        type="text"
        value={customCompany}
        onChange={(e) => {
          setCustomCompany(e.target.value);
          setInterviewIntelligence(null);
          setRoundTab(0);
        }}
        placeholder="Enter company name..."
        className="w-64 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
      />
    )}

    <button
      onClick={loadInterviewIntelligence}
      disabled={intelligenceLoading || !activeCompanyName}
      className="bg-violet-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-violet-700 disabled:opacity-50"
    >
      {intelligenceLoading ? "Analyzing..." : "Analyze with AI"}
    </button>

  </div>
</div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
              {intelligenceError && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
          {intelligenceError}
        </div>
      )}

      {interviewIntelligence?.analysis && (
        <div className="bg-violet-50 border border-violet-100 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Brain size={18} className="text-violet-600" />
            <h2 className="font-bold text-slate-900">
              AI Interview Intelligence
            </h2>
          </div>

          <p className="text-xs text-slate-500 mb-3">
            Evidence-based analysis generated from the available interview sources.
          </p>

<pre className="text-xs bg-white rounded-xl p-4 overflow-auto max-h-96 border border-violet-100 whitespace-pre-wrap">
  {(() => {
    try {
      let raw = interviewIntelligence.analysis;

      // If the response is already an object
      if (typeof raw === "object") {
        return JSON.stringify(raw, null, 2);
      }

      // Remove ```json and ``` if the LLM returned a code block
      raw = raw
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

      const parsed = JSON.parse(raw);

      return JSON.stringify(parsed, null, 2);
    } catch (error) {
      return String(interviewIntelligence.analysis);
    }
  })()}
</pre>
        </div>
      )}
        <div className="flex items-center gap-3 mb-5">
          <CompanyAvatar company={co} />
          <div>
            <h2 className="font-bold text-slate-900">{co.name} · Full Interview Roadmap</h2>
            <p className="text-sm text-slate-500">{roadmapRounds.length} rounds · {co.difficulty} difficulty · {co.avgPackage}</p>
          </div>
        </div>

        {/* Round tabs */}
        <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-1">
          {roadmapRounds.map((r, i) => {
            const Icon = roundIconMap[r.type] || Code2;
            const colorCls = roundColorMap[r.type] || "";
            return (
              <div key={i} className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => setRoundTab(i)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${roundTab === i ? "bg-indigo-600 text-white shadow-md shadow-indigo-200" : "bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100"}`}>
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${roundTab === i ? "bg-white/20" : colorCls}`}>
                    <Icon size={14} className={roundTab === i ? "text-white" : ""} />
                  </div>
                  {r.type}
                  <span className={`text-xs ${roundTab === i ? "text-indigo-200" : "text-slate-400"}`}>{r.duration || "—"}</span>
                </button>
                {i < roadmapRounds.length - 1 && (
  <ChevronRight size={16} className="text-slate-300" />
)}
              </div>
            );
          })}
        </div>

        {roadmapRounds.length === 0 ? (
  <div className="text-center py-12">
    <Brain size={28} className="mx-auto text-violet-400 mb-3" />

    <p className="font-semibold text-slate-700">
      No interview roadmap available yet
    </p>

    <p className="text-sm text-slate-500 mt-1">
      Click "Analyze with AI" to research this company using live interview evidence.
    </p>
  </div>
) : roadmapRounds[roundTab] && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <RoundBadge type={roadmapRounds[roundTab].type} />
              <span className="font-bold text-slate-800">{roadmapRounds[roundTab].name}</span>
              <span className="ml-auto text-xs text-slate-500 flex items-center gap-1">
  <Clock size={12} />
  {roadmapRounds[roundTab]?.duration || "—"}
</span>
            </div>
            <div className="space-y-3">
              {roadmapRounds[roundTab].topics.map((tp: any, ti: number) => (
                <div key={ti} className="p-4 border border-slate-100 rounded-xl hover:border-indigo-100 hover:bg-slate-50/50 transition-all">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold text-slate-800 flex-1">{tp.name}</h4>
                    <DiffBadge
  d={
    tp.difficulty ||
    (tp.confidence === "High"
      ? "Easy"
      : tp.confidence === "Low"
        ? "Hard"
        : "Medium")
  }
/>
                    <div className="flex items-center gap-1 text-xs text-slate-400">
  <Brain size={12} />
  AI Evidence
</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 w-20">Confidence</span>
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
  className={`h-full rounded-full ${
    (typeof tp.confidence === "number"
      ? tp.confidence
      : tp.confidence === "High"
        ? 80
        : tp.confidence === "Low"
          ? 30
          : 55) >= 70
      ? "bg-emerald-500"
      : (typeof tp.confidence === "number"
          ? tp.confidence
          : tp.confidence === "High"
            ? 80
            : tp.confidence === "Low"
              ? 30
              : 55) >= 50
        ? "bg-amber-400"
        : "bg-red-400"
  }`}
  style={{
    width: `${
      typeof tp.confidence === "number"
        ? tp.confidence
        : tp.confidence === "High"
          ? 80
          : tp.confidence === "Low"
            ? 30
            : 55
    }%`
  }}
/>
                    </div>
                    <span className="text-xs text-slate-500 w-10">
                      {typeof tp.confidence === "number"
  ? tp.confidence
  : tp.confidence === "High"
    ? 80
    : tp.confidence === "Low"
      ? 30
      : 55}% confidence
                      </span>
                    <button className="text-xs text-indigo-600 font-semibold hover:underline">Practice →</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* RAG Sources */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="font-bold text-slate-800 mb-1 flex items-center gap-2">
          <Globe size={17} className="text-indigo-600" />
          Sources & Evidence
        </h2>

        <p className="text-sm text-slate-500 mb-4">
          Live sources retrieved from the web and used to generate this preparation guide.
        </p>

        {aiSources.length === 0 ? (
          <div className="text-center py-8">
            <Globe size={24} className="mx-auto text-slate-300 mb-2" />

            <p className="text-sm font-semibold text-slate-600">
              No live sources loaded yet
            </p>

            <p className="text-xs text-slate-400 mt-1">
              Ask AI a question or click "Analyze with AI" to retrieve live evidence.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {aiSources.map((source, index) => {
              const sourceType =
                source.source_type === "official"
                  ? "official"
                  : source.source_type === "reported"
                    ? "reported"
                    : "ai-generated";

              return (
                <div
                  key={`${source.source_url || source.source_name}-${index}`}
                  className="flex items-center gap-3 p-3.5 border border-slate-100 rounded-xl hover:border-indigo-100 hover:bg-slate-50/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-sm font-semibold text-slate-800">
                        {source.source_name || "Web Source"}
                      </span>

                      <SourceBadge type={sourceType as Source} />
                    </div>

                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
                      {source.domain && (
                        <span>{source.domain}</span>
                      )}

                      {source.search_score !== undefined &&
                        source.search_score !== null && (
                          <span>
                            Search relevance:{" "}
                            {(Number(source.search_score) * 100).toFixed(0)}%
                          </span>
                        )}

                      {source.published_date && (
                        <span>
                          Published: {source.published_date}
                        </span>
                      )}
                    </div>
                  </div>

                  {source.source_url && (
                    <a
                      href={source.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Open source"
                      className="text-indigo-600 hover:text-indigo-800 flex-shrink-0"
                    >
                      <ExternalLink size={15} />
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MOCK INTERVIEW PAGE ───────────────────────────────────────────────────────

function MockInterviewPage() {
  const [phase, setPhase] = useState<"setup" | "interview" | "results">("setup");
  const [qIdx, setQIdx] = useState(0);
  const [answer, setAnswer] = useState("");
  const [followUpAnswer, setFollowUpAnswer] = useState("");
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [running, setRunning] = useState(false);
  const [scores, setScores] = useState<number[]>([]);
  const [selCo, setSelCo] = useState("google");

  const [companies, setCompanies] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
    Promise.all([getCompanies(), getQuestions()])
      .then(([companyData, questionData]) => {
        setCompanies(companyData);
        setQuestions(questionData);
      })
      .catch((error) => {
        console.error("Failed to load mock interview data:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (running && timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0 && running) {
      setRunning(false);
      if (!showFollowUp) setShowFollowUp(true);
    }
    return () => clearTimeout(timerRef.current);
  }, [running, timeLeft, showFollowUp]);

  const startInterview = () => {
    setPhase("interview"); setQIdx(0); setAnswer(""); setFollowUpAnswer("");
    setShowFollowUp(false); setScores([]);
    setTimeLeft(questions[0].timeLimit); setRunning(true);
  };

  const submitAnswer = () => { setRunning(false); setShowFollowUp(true); };

  const nextQ = () => {
    const sc = Math.min(95, Math.max(48, (answer.length > 80 ? 18 : 8) + (followUpAnswer.length > 40 ? 12 : 4) + Math.floor(Math.random() * 25) + 40));
    const newScores = [...scores, sc];
    setScores(newScores);
    if (qIdx < questions.length - 1) {
      const ni = qIdx + 1;
      setQIdx(ni); setAnswer(""); setFollowUpAnswer("");
      setShowFollowUp(false); setTimeLeft(questions[ni].timeLimit); setRunning(true);
    } else { setPhase("results"); }
  };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b) / scores.length) : 0;
  const q = questions[qIdx] || questions[0];

    if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-slate-500">Loading interview data...</p>
      </div>
    );
  }

  if (!questions.length || !companies.length) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-red-500">Unable to load interview data.</p>
      </div>
    );
  }

  if (phase === "setup") return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">AI Mock Interviewer</h1>
        <p className="text-slate-500 text-sm mt-0.5">Simulate a real interview with timed questions, follow-ups, and detailed scoring</p>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="font-bold text-slate-800 mb-4">Configure Your Session</h2>
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Target Company</label>
            <select value={selCo} onChange={e => setSelCo(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500">
              {companies.map(c => (
  <option key={c.id} value={c.id}>
    {c.name}
  </option>
))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Role</label>
            <select className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option>Software Engineer</option><option>SDE Intern</option>
              <option>Data Scientist</option><option>Product Manager</option>
            </select>
          </div>
        </div>
        <div className="bg-slate-50 rounded-xl p-4 mb-5 border border-slate-100">
          <p className="text-sm font-semibold text-slate-700 mb-3">Session Format</p>
          <div className="grid grid-cols-3 gap-3">
            {[["Questions", "3"], ["Time / Q", "2–4 min"], ["Follow-ups", "1 per Q"]].map(([l, v]) => (
              <div key={l} className="bg-white rounded-xl p-3 text-center border border-slate-200">
                <div className="font-bold text-slate-900">{v}</div>
                <div className="text-xs text-slate-500 mt-0.5">{l}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-2 mb-5">
          {["Questions sourced from real interview reports and AI generation", "Timed responses to simulate real interview pressure", "Follow-up questions to test depth of understanding", "Detailed report with strengths, weaknesses, and AI recommendations"].map(t => (
            <div key={t} className="flex items-start gap-2 text-sm text-slate-600">
              <CheckCircle2 size={15} className="text-indigo-500 flex-shrink-0 mt-0.5" />{t}
            </div>
          ))}
        </div>
        <button onClick={startInterview} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 text-base">
          <Play size={18} /> Start Mock Interview
        </button>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="font-bold text-slate-800 mb-4">Previous Sessions</h2>
        <div className="space-y-3">
          {[["Google", "SWE", 74, "Today, 2:30 PM", "+8"], ["Amazon", "SDE", 66, "Yesterday", "+12"], ["Microsoft", "SWE", 58, "3 days ago", "+5"]].map(([co, role, sc, date, imp]) => (
            <div key={String(co)} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <CompanyAvatar company={companies.find(c => c.name === co)!} />
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-800">{co} · {role}</p>
                <p className="text-xs text-slate-500">{date}</p>
              </div>
              <div className="text-right">
                <div className="font-bold text-slate-900">{sc}/100</div>
                <div className="text-xs text-emerald-600 font-semibold">{imp} vs last</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (phase === "results") return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Interview Results</h1>
        <p className="text-slate-500 text-sm mt-0.5">Performance analysis for this session</p>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center">
        <RadialScore score={avg} size={160} />
        <h2 className="text-xl font-bold text-slate-900 mt-4 mb-1">
          {avg >= 80 ? "Excellent! 🎉" : avg >= 65 ? "Good Job! 👍" : "Keep Practicing! 💪"}
        </h2>
        <p className="text-slate-500 text-sm max-w-sm mx-auto">
          {avg >= 80 ? "Well-prepared! Refine your edge cases and system design depth." : avg >= 65 ? "Solid foundation. Work on system design and answer structure." : "Focus on DSA fundamentals and use the STAR method for behavioral."}
        </p>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {scores.map((sc, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 text-center">
            <p className="text-xs text-slate-500 mb-1">Question {i + 1}</p>
            <p className="text-3xl font-extrabold text-slate-900">{sc}</p>
            <p className="text-xs text-slate-400 mt-1">/100</p>
            <p className="text-xs text-indigo-600 mt-1 font-medium">{questions[i]?.tags[0]}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h3 className="font-bold text-emerald-700 mb-3 flex items-center gap-2"><ThumbsUp size={15} /> Strengths</h3>
          <ul className="space-y-1.5">
            {["Clear problem breakdown", "Good time management", "Considered edge cases", "Communicated thought process"].map(s => (
              <li key={s} className="flex items-start gap-2 text-sm text-slate-700">
                <Check size={13} className="text-emerald-500 mt-0.5 flex-shrink-0" />{s}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h3 className="font-bold text-red-600 mb-3 flex items-center gap-2"><AlertCircle size={15} /> Improve On</h3>
          <ul className="space-y-1.5">
            {["System design depth", "Complexity analysis", "Follow-up handling", "Code optimization"].map(s => (
              <li key={s} className="flex items-start gap-2 text-sm text-slate-700">
                <AlertTriangle size={13} className="text-amber-500 mt-0.5 flex-shrink-0" />{s}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5">
        <h3 className="font-bold text-indigo-900 mb-3 flex items-center gap-2"><Lightbulb size={15} className="text-indigo-600" /> AI Recommendations</h3>
        <ul className="space-y-2">
          {["Practice 5 System Design problems this week (focus: distributed systems, caching)", "Review DP patterns — there were gaps in the memoization explanation", "Take another mock interview in 3 days to measure improvement"].map((r, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-indigo-800">
              <Zap size={13} className="text-indigo-500 mt-0.5 flex-shrink-0" />{r}
            </li>
          ))}
        </ul>
      </div>
      <button onClick={() => { setPhase("setup"); setScores([]); }}
        className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
        <RotateCcw size={17} /> Start Another Interview
      </button>
    </div>
  );

  const timeColor = timeLeft < 30 ? "text-red-600" : timeLeft < 60 ? "text-amber-600" : "text-slate-800";
  return (
    <div className="space-y-4 max-w-2xl">
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${(qIdx / questions.length) * 100}%` }} />
        </div>
        <span className="text-sm text-slate-500 font-medium flex-shrink-0">Q {qIdx + 1} / {questions.length}</span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex flex-wrap items-center gap-2">
            <RoundBadge type={q.tags.includes("System Design") ? "Technical" : "OA"} />
            <DiffBadge d={q.difficulty} />
            {q.tags.map(t => <span key={t} className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-medium">{t}</span>)}
          </div>
          <div className={`flex items-center gap-1.5 font-mono font-bold text-2xl flex-shrink-0 ${timeColor}`}>
            <Clock size={20} />{fmt(timeLeft)}
          </div>
        </div>
        <h2 className="text-base font-semibold text-slate-900 leading-relaxed mb-3">{q.question}</h2>
        {!showFollowUp && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-4 flex items-start gap-2">
            <Info size={13} className="text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700"><strong>Hint:</strong> {q.hint}</p>
          </div>
        )}
        {!showFollowUp ? (
          <div className="space-y-3">
            <textarea value={answer} onChange={e => setAnswer(e.target.value)}
              placeholder="Explain your approach step by step. Think aloud — describe trade-offs and complexity..."
              className="w-full h-36 border border-slate-200 rounded-xl p-3 text-sm text-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed" />
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">{answer.length} chars</span>
              <button onClick={submitAnswer} disabled={answer.length < 15}
                className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5">
                <Send size={14} /> Submit Answer
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <p className="text-xs text-slate-400 font-semibold mb-1 uppercase tracking-wide">Your Answer</p>
              <p className="text-sm text-slate-700 leading-relaxed">{answer}</p>
            </div>
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
              <p className="text-sm font-bold text-indigo-800 mb-1.5 flex items-center gap-2">
                <Brain size={14} /> Follow-up Question
              </p>
              <p className="text-sm text-indigo-900 leading-relaxed">{q.followUp}</p>
            </div>
            <textarea value={followUpAnswer} onChange={e => setFollowUpAnswer(e.target.value)}
              placeholder="Answer the follow-up. Be concise but thorough..."
              className="w-full h-24 border border-slate-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <button onClick={nextQ} disabled={followUpAnswer.length < 5}
              className="w-full bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors disabled:opacity-40 flex items-center justify-center gap-2">
              {qIdx < questions.length - 1 ? "Next Question →" : "Finish Interview →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── QUESTIONS PAGE ────────────────────────────────────────────────────────────

function QuestionsPage() {
  const [search, setSearch] = useState("");
  const [co, setCo] = useState("All");
  const [round, setRound] = useState("All");
  const [diff, setDiff] = useState("All");
  const [src, setSrc] = useState("All");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [saved, setSaved] = useState(() => new Set(QUESTIONS_DATA.filter(q => q.saved).map(q => q.id)));

  const qs = QUESTIONS_DATA.filter(q => {
    const ms = q.text.toLowerCase().includes(search.toLowerCase()) || q.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    const mc = co === "All" || q.company === co;
    const mr = round === "All" || q.round === round;
    const md = diff === "All" || q.difficulty === diff;
    const msr = src === "All" || q.source === src;
    return ms && mc && mr && md && msr;
  });

  const toggleSave = (id: string) => setSaved(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Question Bank</h1>
        <p className="text-slate-500 text-sm mt-0.5">{QUESTIONS_DATA.length} questions · Past interviews, official, and AI-generated</p>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search questions, topics, tags..." className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div className="flex flex-wrap gap-2">
          <select value={co} onChange={e => setCo(e.target.value)} className="border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="All">All Companies</option>
            {COMPANIES_DATA.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
          <select value={round} onChange={e => setRound(e.target.value)} className="border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="All">All Rounds</option>
            {["OA", "Technical", "Managerial", "HR"].map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <select value={diff} onChange={e => setDiff(e.target.value)} className="border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="All">All Difficulty</option>
            {["Easy", "Medium", "Hard"].map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select value={src} onChange={e => setSrc(e.target.value)} className="border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="All">All Sources</option>
            <option value="official">Official</option>
            <option value="reported">Reported</option>
            <option value="ai-generated">AI Generated</option>
            <option value="ai-prediction">AI Prediction</option>
          </select>
        </div>
      </div>
      <p className="text-sm text-slate-500 font-medium">{qs.length} questions found</p>
      <div className="space-y-3">
        {qs.map(q => (
          <div key={q.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 cursor-pointer hover:bg-slate-50/50 transition-colors" onClick={() => setExpanded(expanded === q.id ? null : q.id)}>
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <SourceBadge type={q.source} />
                    <DiffBadge d={q.difficulty} />
                    <RoundBadge type={q.round} />
                    <span className="text-xs text-slate-500 font-medium">{q.company}</span>
                    {q.year && <span className="text-xs text-slate-400">{q.year}</span>}
                  </div>
                  <p className="text-sm font-semibold text-slate-800 leading-relaxed">{q.text}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {q.tags.map(t => <span key={t} className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-medium">{t}</span>)}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <button onClick={e => { e.stopPropagation(); toggleSave(q.id); }}
                    className={`p-1.5 rounded-lg transition-colors ${saved.has(q.id) ? "text-indigo-600 bg-indigo-50" : "text-slate-300 hover:text-indigo-600 hover:bg-indigo-50"}`}>
                    <Bookmark size={15} fill={saved.has(q.id) ? "currentColor" : "none"} />
                  </button>
                  <div className="flex items-center gap-1 text-xs text-slate-400"><ThumbsUp size={11} />{q.upvotes}</div>
                </div>
              </div>
            </div>
            {expanded === q.id && q.answer && (
              <div className="border-t border-slate-100 p-5 bg-indigo-50/60">
                <div className="flex items-center gap-2 mb-1.5">
                  <Lightbulb size={13} className="text-indigo-600" />
                  <span className="text-sm font-bold text-indigo-800">Sample Approach</span>
                </div>
                <p className="text-sm text-indigo-900 leading-relaxed">{q.answer}</p>
              </div>
            )}
          </div>
        ))}
        {qs.length === 0 && (
          <div className="text-center py-20">
            <HelpCircle size={44} className="text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No questions found.</p>
            <p className="text-slate-400 text-sm">Try different filters or search terms.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── PROGRESS PAGE ─────────────────────────────────────────────────────────────

function ProgressPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Progress & Analytics</h1>
        <p className="text-slate-500 text-sm mt-0.5">Track your preparation journey across all topics, companies, and time</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { l: "Questions Solved", v: "312", d: "+47 this week", Icon: CheckCircle2, cls: "text-emerald-600 bg-emerald-50" },
          { l: "Mock Interviews", v: "12", d: "+3 this week", Icon: MessageSquare, cls: "text-indigo-600 bg-indigo-50" },
          { l: "Avg Mock Score", v: "72/100", d: "+8 from last", Icon: Trophy, cls: "text-amber-600 bg-amber-50" },
          { l: "Study Streak", v: "7 days 🔥", d: "Personal best!", Icon: Zap, cls: "text-violet-600 bg-violet-50" },
        ].map(({ l, v, d, Icon, cls }) => (
          <div key={l} className="bg-white rounded-2xl border border-slate-200 p-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cls} mb-3`}><Icon size={19} /></div>
            <div className="text-xl font-extrabold text-slate-900">{v}</div>
            <div className="text-xs text-slate-500 mt-0.5">{l}</div>
            <div className="text-xs text-emerald-600 mt-1 font-semibold">{d}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="font-bold text-slate-800 mb-4">Mock Interview Score History</h2>
        <ResponsiveContainer width="100%" height={210}>
          <LineChart data={PROGRESS_DATA.scoreHistory}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ border: "1px solid #E2E8F0", borderRadius: 12, fontSize: 12 }} />
            <Line type="monotone" dataKey="score" stroke="#4F46E5" strokeWidth={3} dot={{ fill: "#4F46E5", r: 5, strokeWidth: 2, stroke: "#fff" }} name="Score" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-bold text-slate-800 mb-4">Topic Coverage</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={PROGRESS_DATA.topicCoverage} layout="vertical" margin={{ right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="topic" tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} width={78} />
              <Tooltip contentStyle={{ border: "1px solid #E2E8F0", borderRadius: 12, fontSize: 12 }} formatter={(v: number) => [`${v}%`, "Coverage"]} />
              <Bar dataKey="coverage" name="Coverage" radius={[0, 5, 5, 0]}>
                {PROGRESS_DATA.topicCoverage.map((e, i) => <Cell key={i} fill={e.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-bold text-slate-800 mb-4">Skill Radar</h2>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={PROGRESS_DATA.radarData}>
              <PolarGrid stroke="#E2E8F0" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: "#64748B" }} />
              <Radar name="Coverage" dataKey="A" stroke="#4F46E5" fill="#4F46E5" fillOpacity={0.18} strokeWidth={2.5} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 14-Day Roadmap */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="font-bold text-slate-800 mb-1">AI-Personalized 14-Day Preparation Roadmap</h2>
        <p className="text-sm text-slate-500 mb-4">Tailored for Google SWE based on your current readiness of 68/100.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { day: "Day 1–2", focus: "Arrays & Strings", tasks: ["20 Easy problems", "10 Medium problems", "Review time complexity"], status: "done" },
            { day: "Day 3–4", focus: "Trees & Recursion", tasks: ["15 Tree problems", "DFS/BFS patterns", "Mock: Tree problems"], status: "done" },
            { day: "Day 5–6", focus: "Dynamic Programming", tasks: ["DP patterns overview", "10 DP problems (memoization)", "Tabulation vs Memoization"], status: "current" },
            { day: "Day 7", focus: "Mock Interview #1", tasks: ["Full Google mock session", "Review feedback report", "Identify top 3 gaps"], status: "upcoming" },
            { day: "Day 8–9", focus: "Graph Algorithms", tasks: ["BFS, DFS, Dijkstra, Bellman-Ford", "10 Graph problems", "Topological sort"], status: "upcoming" },
            { day: "Day 10–11", focus: "System Design", tasks: ["URL shortener, notification system", "Rate limiter, load balancer", "Watch 5 design walkthroughs"], status: "upcoming" },
            { day: "Day 12", focus: "OS & Networks", tasks: ["Process vs Thread, deadlocks", "TCP/IP, HTTP, DNS", "Memory management & paging"], status: "upcoming" },
            { day: "Day 13–14", focus: "Final Prep & Mock #2", tasks: ["2 full mock interviews", "Review all weak areas", "Behavioral + confidence prep"], status: "upcoming" },
          ].map(({ day, focus, tasks, status }) => (
            <div key={day} className={`p-4 rounded-xl border transition-all ${status === "done" ? "bg-emerald-50 border-emerald-200" : status === "current" ? "bg-indigo-50 border-indigo-300 shadow-sm shadow-indigo-100" : "bg-white border-slate-200"}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{day}</span>
                {status === "done" && <CheckCircle2 size={15} className="text-emerald-600" />}
                {status === "current" && <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />}
                {status === "upcoming" && <Circle size={15} className="text-slate-300" />}
              </div>
              <h3 className="font-bold text-sm text-slate-800 mb-1.5">{focus}</h3>
              <ul className="space-y-0.5">
                {tasks.map(t => <li key={t} className="text-xs text-slate-500 flex items-start gap-1"><span className="text-slate-300 mt-0.5">·</span>{t}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── RESUME PAGE ───────────────────────────────────────────────────────────────

function ResumePage() {
  const [state, setState] = useState<"upload" | "loading" | "done">("upload");
  const [progress, setProgress] = useState(0);

  const handleUpload = () => {
    setState("loading");
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(interval); setState("done"); return 100; }
        return p + 10;
      });
    }, 200);
  };

  if (state === "upload") return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Resume Analyzer</h1>
        <p className="text-slate-500 text-sm mt-0.5">Upload your resume for AI-powered company match scores and skill gap analysis</p>
      </div>
      <div onClick={handleUpload}
        className="border-2 border-dashed border-indigo-200 rounded-2xl p-16 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/50 transition-all group">
        <Upload size={44} className="text-indigo-200 group-hover:text-indigo-400 mx-auto mb-4 transition-colors" />
        <h2 className="text-lg font-bold text-slate-900 mb-1">Upload Your Resume</h2>
        <p className="text-sm text-slate-500 mb-5">Drag & drop or click · PDF, DOCX · max 5 MB</p>
        <button className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors">
          Select File
        </button>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <h3 className="font-bold text-slate-800 mb-3">What you will receive:</h3>
        <div className="space-y-2">
          {[
            [Target, "Company-specific match score for each target company"],
            [AlertTriangle, "Skill gap analysis with specific missing skills and priority"],
            [HelpCircle, "Likely interview questions based on your experience"],
            [Lightbulb, "Resume improvement suggestions per company"],
          ].map(([Icon, text]) => (
            <div key={String(text)} className="flex items-center gap-3 text-sm text-slate-600">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                <Icon size={14} className="text-indigo-600" />
              </div>
              {text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (state === "loading") return (
    <div className="flex flex-col items-center justify-center min-h-96 gap-5">
      <div className="w-20 h-20 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
      <div className="text-center">
        <h2 className="text-lg font-bold text-slate-900 mb-1">Analyzing your resume...</h2>
        <p className="text-slate-500 text-sm">Running RAG analysis against company requirements</p>
      </div>
      <div className="w-64 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
      </div>
      <p className="text-xs text-slate-400">{progress}% complete</p>
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Resume Analysis</h1>
          <p className="text-slate-500 text-sm mt-0.5">Aryan_Sharma_Resume.pdf · Analyzed just now · 3 pages</p>
        </div>
        <button onClick={() => setState("upload")} className="text-sm text-indigo-600 border border-indigo-200 px-4 py-2 rounded-xl font-semibold hover:bg-indigo-50 transition-colors">
          Upload New Resume
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="font-bold text-slate-800 mb-4">Company Match Scores</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {[
            [COMPANIES_DATA[1], 84, "Excellent Match"], [COMPANIES_DATA[4], 81, "Strong Match"],
            [COMPANIES_DATA[0], 78, "Strong Match"], [COMPANIES_DATA[2], 72, "Good Match"],
            [COMPANIES_DATA[3], 58, "Partial Match"], [COMPANIES_DATA[5], 95, "Top Match"],
          ].map(([c, sc, lv]) => {
            const company = c as (typeof COMPANIES_DATA)[0];
            const score = sc as number;
            const level = lv as string;
            return (
              <div key={company.id} className="flex items-center gap-3 p-4 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors">
                <CompanyAvatar company={company} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800">{company.name}</p>
                  <p className="text-xs text-slate-500">{level}</p>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                    <div className={`h-full rounded-full ${score >= 80 ? "bg-emerald-500" : score >= 65 ? "bg-indigo-500" : "bg-amber-400"}`} style={{ width: `${score}%` }} />
                  </div>
                </div>
                <span className="font-extrabold text-slate-900">{score}%</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-bold text-slate-800 mb-3 flex items-center gap-2"><CheckCircle2 size={17} className="text-emerald-600" /> Skills Detected</h2>
          <div className="flex flex-wrap gap-2">
            {["Python", "C++", "JavaScript", "React", "Node.js", "SQL", "Machine Learning", "REST APIs", "Git", "Docker", "Linux", "Data Structures", "Algorithms", "TensorFlow"].map(s => (
              <span key={s} className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-semibold">{s}</span>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-bold text-slate-800 mb-3 flex items-center gap-2"><AlertCircle size={17} className="text-amber-600" /> Skill Gaps (Google SWE)</h2>
          <div className="space-y-2">
            {[
              { s: "System Design", p: "High", a: "Study distributed systems, CAP theorem, and scalability patterns" },
              { s: "Golang / Rust", p: "Medium", a: "Google values systems programming languages on some teams" },
              { s: "Kubernetes / GCP", p: "Medium", a: "Cloud-native familiarity is a strong differentiator" },
              { s: "Low-Level Programming", p: "Low", a: "Good to have for infrastructure-focused roles" },
            ].map(({ s, p, a }) => (
              <div key={s} className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-bold text-slate-800">{s}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded font-semibold ${p === "High" ? "bg-red-100 text-red-700" : p === "Medium" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"}`}>{p}</span>
                </div>
                <p className="text-xs text-slate-600">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="font-bold text-slate-800 mb-1 flex items-center gap-2">
          <Brain size={17} className="text-indigo-600" /> Likely Questions Based on Your Resume
        </h2>
        <p className="text-xs text-slate-500 mb-4">Predicted via RAG analysis of your skills and experience against company interview patterns.</p>
        <div className="space-y-3">
          {[
            { q: "Walk me through your machine learning project. How did you handle class imbalance and model evaluation?", tag: "ML Project", src: "ai-prediction" as Source },
            { q: "In your React project, how did you manage state at scale? When would you reach for Redux vs Context API?", tag: "React Experience", src: "ai-prediction" as Source },
            { q: "You have REST API experience — design a feed API for a social platform that serves 50M users.", tag: "API Background", src: "ai-prediction" as Source },
            { q: "What is the most complex SQL query you have written? How would you optimize it for billions of rows?", tag: "SQL Skills", src: "ai-prediction" as Source },
          ].map(({ q, tag, src }) => (
            <div key={q} className="p-4 border border-slate-100 rounded-xl hover:border-slate-200 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <SourceBadge type={src} />
                <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full font-semibold">From your {tag}</span>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">{q}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── SAVED PAGE ────────────────────────────────────────────────────────────────

function SavedPage() {
  const [tab, setTab] = useState<"questions" | "companies">("questions");
  const savedQs = QUESTIONS_DATA.filter(q => q.saved);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Saved</h1>
        <p className="text-slate-500 text-sm mt-0.5">Your bookmarked questions and companies</p>
      </div>
      <div className="flex gap-2">
        {[["questions", `Questions (${savedQs.length})`], ["companies", "Companies (2)"]].map(([t, l]) => (
          <button key={t} onClick={() => setTab(t as "questions" | "companies")}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${tab === t ? "bg-indigo-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>{l}</button>
        ))}
      </div>

      {tab === "questions" && (
        <div className="space-y-3">
          {savedQs.length === 0 ? (
            <div className="text-center py-20">
              <Bookmark size={44} className="text-slate-200 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No saved questions yet.</p>
              <p className="text-slate-400 text-sm">Bookmark questions from the Question Bank.</p>
            </div>
          ) : savedQs.map(q => (
            <div key={q.id} className="bg-white rounded-2xl border border-slate-200 p-5">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <SourceBadge type={q.source} /><DiffBadge d={q.difficulty} /><RoundBadge type={q.round} />
                <span className="text-xs text-slate-500 font-medium">{q.company}</span>
              </div>
              <p className="text-sm font-semibold text-slate-800 leading-relaxed">{q.text}</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {q.tags.map(t => <span key={t} className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-medium">{t}</span>)}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "companies" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {COMPANIES_DATA.slice(0, 2).map(c => (
            <div key={c.id} className="bg-white rounded-2xl border border-slate-200 p-5">
              <div className="flex items-center gap-3 mb-3">
                <CompanyAvatar company={c} />
                <div>
                  <h3 className="font-bold text-slate-900">{c.name}</h3>
                  <p className="text-sm text-slate-500">{c.sector}</p>
                </div>
                <DiffBadge d={c.difficulty} />
              </div>
              <div className="flex gap-5">
                <div><span className="font-bold text-slate-900">{c.avgPackage}</span><span className="text-xs text-slate-500 ml-1">Avg CTC</span></div>
                <div><span className="font-bold text-slate-900">{c.interviewReports}</span><span className="text-xs text-slate-500 ml-1">Reports</span></div>
                <div className="flex items-center gap-1"><Star size={12} className="text-amber-400 fill-amber-400" /><span className="font-bold text-slate-900">{c.rating}</span></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── SETTINGS PAGE ─────────────────────────────────────────────────────────────

function SettingsPage() {
  const [cgpa, setCgpa] = useState("8.2");
  const [branch, setBranch] = useState("CSE");
  const [year, setYear] = useState("2025");
  const [backlogs, setBacklogs] = useState("0");
  const [checked, setChecked] = useState(false);
  const [notifs, setNotifs] = useState([true, true, false, true]);

  const results = COMPANIES_DATA.map(c => {
    const okCgpa = parseFloat(cgpa) >= c.eligibility.cgpa;
    const okBranch = c.eligibility.branches.includes("ALL") || c.eligibility.branches.includes(branch);
    const okBacklog = parseInt(backlogs) <= c.eligibility.backlogs;
    const okYear = c.eligibility.graduationYears.includes(parseInt(year));
    return { ...c, ok: okCgpa && okBranch && okBacklog && okYear, okCgpa, okBranch, okBacklog, okYear };
  });

  const eligible = results.filter(r => r.ok).length;

  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 text-sm mt-0.5">Manage your profile, preferences, and eligibility criteria</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="font-bold text-slate-800 mb-4">Profile</h2>
        <div className="grid grid-cols-2 gap-4">
          {[["Full Name", "Aryan Sharma", "text"], ["Email", "aryan.sharma@iitb.ac.in", "email"], ["College", "IIT Bombay", "text"], ["Target Role", "Software Engineer", "text"]].map(([l, v, t]) => (
            <div key={String(l)}>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">{l}</label>
              <input defaultValue={v} type={t} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          ))}
        </div>
        <button className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors">
          Save Changes
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="font-bold text-slate-800 mb-1 flex items-center gap-2">
          <Shield size={17} className="text-indigo-600" /> Batch Eligibility Checker
        </h2>
        <p className="text-sm text-slate-500 mb-4">Enter your academic details to instantly check eligibility across all companies.</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">CGPA</label>
            <input value={cgpa} onChange={e => { setCgpa(e.target.value); setChecked(false); }} type="number" step="0.1" min="0" max="10"
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Branch</label>
            <select value={branch} onChange={e => { setBranch(e.target.value); setChecked(false); }}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500">
              {["CSE", "IT", "ECE", "EEE", "ME", "Civil", "MCA", "Math", "Physics"].map(b => <option key={b}>{b}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Grad Year</label>
            <select value={year} onChange={e => { setYear(e.target.value); setChecked(false); }}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500">
              {["2024", "2025", "2026"].map(y => <option key={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Backlogs</label>
            <input value={backlogs} onChange={e => { setBacklogs(e.target.value); setChecked(false); }} type="number" min="0" max="10"
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
        </div>
        <button onClick={() => setChecked(true)} className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors flex items-center gap-2">
          <Check size={15} /> Check Eligibility Across All Companies
        </button>

        {checked && (
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-sm font-bold text-slate-800">Results:</h3>
              <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">{eligible} eligible</span>
              <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">{results.length - eligible} not eligible</span>
            </div>
            <div className="space-y-2">
              {results.map(r => (
                <div key={r.id} className={`flex items-center gap-3 p-3 rounded-xl border ${r.ok ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"}`}>
                  <CompanyAvatar company={r} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800">{r.name}</p>
                    <p className="text-xs text-slate-500">Min CGPA {r.eligibility.cgpa} · Max {r.eligibility.backlogs} backlogs · {r.eligibility.branches.slice(0, 3).join(", ")}</p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    {r.ok ? (
                      <CheckCircle2 size={18} className="text-emerald-600" />
                    ) : (
                      <div>
                        <XCircle size={18} className="text-red-500" />
                        <p className="text-xs text-red-600 mt-0.5 font-medium">
                          {!r.okCgpa ? "CGPA low" : !r.okBranch ? "Branch" : !r.okBacklog ? "Backlogs" : "Year"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="font-bold text-slate-800 mb-4">Notifications</h2>
        <div className="space-y-3">
          {[
            ["Daily study reminders", "Get reminded to practice daily at 8 PM"],
            ["New company added", "When a new company is added to InterviewIQ"],
            ["Interview alerts", "Alerts for companies actively hiring at your college"],
            ["Weekly progress report", "Your weekly performance summary and insights"],
          ].map(([l, d], i) => (
            <div key={String(l)} className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0">
              <div>
                <p className="text-sm font-semibold text-slate-800">{l}</p>
                <p className="text-xs text-slate-500">{d}</p>
              </div>
              <button onClick={() => setNotifs(p => p.map((v, idx) => idx === i ? !v : v))}
                className={`w-11 h-6 rounded-full relative transition-colors flex-shrink-0 ${notifs[i] ? "bg-indigo-600" : "bg-slate-200"}`}>
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 shadow transition-all ${notifs[i] ? "left-6" : "left-1"}`} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── SIDEBAR ───────────────────────────────────────────────────────────────────

const NAV = [
  { page: "dashboard" as Page, label: "Dashboard", Icon: LayoutDashboard },
  { page: "companies" as Page, label: "Companies", Icon: Building2 },
  { page: "preparation" as Page, label: "Preparation", Icon: BookOpen },
  { page: "mock-interview" as Page, label: "Mock Interview", Icon: MessageSquare },
  { page: "questions" as Page, label: "Questions", Icon: HelpCircle },
  { page: "progress" as Page, label: "Progress", Icon: TrendingUp },
  { page: "resume" as Page, label: "Resume", Icon: FileText },
  { page: "saved" as Page, label: "Saved", Icon: Bookmark },
  { page: "settings" as Page, label: "Settings", Icon: Settings },
];

function Sidebar({ cur, onNav, collapsed, onToggle }: { cur: Page; onNav: (p: Page) => void; collapsed: boolean; onToggle: () => void }) {
  return (
    <aside className={`bg-white border-r border-slate-200 flex flex-col flex-shrink-0 min-h-screen transition-all duration-200 ${collapsed ? "w-16" : "w-58"}`}
      style={{ width: collapsed ? 64 : 232 }}>
      <div className={`flex items-center gap-2.5 p-4 border-b border-slate-100 ${collapsed ? "justify-center" : ""}`}>
        <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
          <Brain size={17} className="text-white" />
        </div>
        {!collapsed && (
          <div className="flex items-center justify-between flex-1">
            <span className="font-extrabold text-slate-900">Interview<span className="text-indigo-600">IQ</span></span>
            <button onClick={onToggle} className="text-slate-400 hover:text-slate-700 transition-colors p-1 rounded-lg hover:bg-slate-100">
              <ChevronLeft size={16} />
            </button>
          </div>
        )}
        {collapsed && (
          <button onClick={onToggle} className="hidden" />
        )}
      </div>

      {collapsed && (
        <button onClick={onToggle} className="flex justify-center py-3 text-slate-400 hover:text-slate-700 transition-colors border-b border-slate-100">
          <Menu size={17} />
        </button>
      )}

      <nav className="flex-1 p-2.5 space-y-0.5">
        {NAV.map(({ page, label, Icon }) => (
          <button key={page} onClick={() => onNav(page)} title={collapsed ? label : undefined}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${cur === page ? "bg-indigo-600 text-white shadow-sm shadow-indigo-200" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"} ${collapsed ? "justify-center" : ""}`}>
            <Icon size={17} className="flex-shrink-0" />
            {!collapsed && label}
          </button>
        ))}
      </nav>

      {!collapsed && (
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-extrabold text-sm flex-shrink-0">A</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-800 truncate">Aryan Sharma</p>
              <p className="text-xs text-slate-500 truncate">IIT Bombay · CSE · 2025</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

// ─── ROOT APP ──────────────────────────────────────────────────────────────────

export default function App() {
  const [page, setPage] = useState<Page>("landing");
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => { const m = window.innerWidth < 768; setIsMobile(m); if (m) setCollapsed(true); };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

    useEffect(() => {
    checkBackend()
      .then((data) => {
        console.log("Backend response:", data);
      })
      .catch((error) => {
        console.error("Backend connection failed:", error);
      });
  }, []);

  useEffect(() => {
  getCompanies()
    .then((data) => {
      console.log("Companies from backend:", data);
    })
    .catch((error) => {
      console.error("Failed to fetch companies:", error);
    });
}, []);

  const isApp = page !== "landing";

  if (!isApp) return <LandingPage onStart={() => setPage("dashboard")} />;

  return (
    <div className="flex min-h-screen bg-slate-50">
      {(!isMobile || !collapsed) && (
        <Sidebar cur={page} onNav={setPage} collapsed={collapsed} onToggle={() => setCollapsed(p => !p)} />
      )}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 px-5 py-3 flex items-center gap-3 sticky top-0 z-40">
          {isMobile && (
            <button onClick={() => setCollapsed(p => !p)} className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors flex-shrink-0">
              <Menu size={18} />
            </button>
          )}
          <div className="flex-1 relative max-w-sm hidden sm:block">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input placeholder="Search companies, topics, questions..."
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 text-slate-700" />
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <button className="relative p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors">
              <Bell size={17} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-indigo-600 rounded-full" />
            </button>
            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-extrabold text-sm cursor-pointer">A</div>
              <div className="hidden sm:block">
                <p className="text-xs font-bold text-slate-800">Aryan Sharma</p>
                <p className="text-xs text-slate-500">IIT Bombay</p>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 p-5 md:p-6 overflow-auto">
          {page === "dashboard" && <DashboardPage onNav={setPage} />}
          {page === "companies" && <CompaniesPage onNav={setPage} />}
          {page === "preparation" && <PreparationPage />}
          {page === "mock-interview" && <MockInterviewPage />}
          {page === "questions" && <QuestionsPage />}
          {page === "progress" && <ProgressPage />}
          {page === "resume" && <ResumePage />}
          {page === "saved" && <SavedPage />}
          {page === "settings" && <SettingsPage />}
        </main>
      </div>
    </div>
  );
}
