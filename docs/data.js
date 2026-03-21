const API_BASE = "http://127.0.0.1:8000";
const ASSISTANT_SESSION_KEY = "campuspulse-ai-session";

const PRIMARY_BUTTON =
  "inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-electric via-cyanGlow to-violetGlow px-5 py-3 text-sm font-semibold text-slate-950 shadow-glow transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_90px_rgba(56,189,248,0.28)] focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70";
const SECONDARY_BUTTON =
  "inline-flex items-center justify-center gap-2 rounded-2xl border border-white/12 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-slate-100 transition duration-300 hover:-translate-y-0.5 hover:border-cyan-300/35 hover:bg-white/[0.08] focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/40";
const PANEL_CLASS =
  "glass-surface rounded-[28px] border border-white/10 bg-white/[0.04] shadow-panel";

const capabilityMetrics = [
  {
    value: "3s",
    label: "Target answer time",
    detail: "Top-k retrieval tuned for quick campus help.",
  },
  {
    value: "4",
    label: "Structured knowledge sources",
    detail: "Clubs, events, placements, and FAQs.",
  },
  {
    value: "RAG",
    label: "Grounding architecture",
    detail: "FAISS retrieval plus citation-aware responses.",
  },
];

const campusSignals = [
  {
    title: "Hack the Campus 2026",
    eyebrow: "Event Radar",
    description:
      "AI Society's flagship hackathon with grounded answers for timing, eligibility, and registration deadlines.",
    tags: ["Hackathon", "Productivity", "Sustainability"],
    tone: "from-electric/20 to-cyanGlow/10",
  },
  {
    title: "Resume Clinic for Final Years",
    eyebrow: "Career Layer",
    description:
      "Career-prep workflows where students can ask the assistant what to attend next based on upcoming placement needs.",
    tags: ["Workshop", "Placements", "Final Year"],
    tone: "from-cyanGlow/20 to-sky-400/10",
  },
  {
    title: "AI Society",
    eyebrow: "Club Graph",
    description:
      "A persistent memory node for club schedules, faculty contacts, membership rules, and recent project activity.",
    tags: ["Club", "GenAI", "Community"],
    tone: "from-violetGlow/20 to-electric/10",
  },
];

const productSignals = [
  {
    label: "RAG index",
    value: "Locally persisted",
  },
  {
    label: "Answer style",
    value: "Grounded + cited",
  },
  {
    label: "Campus fit",
    value: "Events, clubs, placements, FAQs",
  },
];

const suggestedPrompts = [
  "When is Hack the Campus 2026 and who can join?",
  "What are the meeting timings for AI Society?",
  "Which placement role needs Python and SQL?",
  "What is the hostel entry deadline on weekends?",
];

const footerLinks = [
  { label: "Features", target: "features" },
  { label: "Assistant", target: "assistant" },
  { label: "Campus Grid", target: "signals" },
];

function cn(...values) {
  return values.filter(Boolean).join(" ");
}

function smoothScrollTo(id) {
  const target = document.getElementById(id);
  if (target) {
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

export {
  API_BASE,
  ASSISTANT_SESSION_KEY,
  PRIMARY_BUTTON,
  SECONDARY_BUTTON,
  PANEL_CLASS,
  capabilityMetrics,
  campusSignals,
  productSignals,
  suggestedPrompts,
  footerLinks,
  cn,
  smoothScrollTo,
};
