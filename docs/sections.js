import { html } from "./lib.js";
import {
  PANEL_CLASS,
  PRIMARY_BUTTON,
  SECONDARY_BUTTON,
  capabilityMetrics,
  campusSignals,
  cn,
  footerLinks,
  productSignals,
  smoothScrollTo,
} from "./data.js";
import {
  ArrowUpRightIcon,
  BrainPulseIcon,
  DatabaseStackIcon,
  LogoMark,
  SearchOrbitIcon,
  ShieldGridIcon,
  SparkleIcon,
} from "./icons.js";
import { Reveal } from "./hooks.js";
import { NavLink, SectionHeader, StatusBadge } from "./ui.js";

const featureCards = [
  {
    title: "Grounded RAG Answers",
    description:
      "Every response is constrained by retrieved campus context, so the assistant speaks with citations instead of guesses.",
    icon: SearchOrbitIcon,
    accent: "from-electric/50 to-cyanGlow/40",
  },
  {
    title: "FAISS Retrieval Layer",
    description:
      "Vector search keeps answers fast, relevant, and traceable across events, clubs, placements, and policy FAQs.",
    icon: DatabaseStackIcon,
    accent: "from-violetGlow/50 to-electric/35",
  },
  {
    title: "Session-Aware AI Memory",
    description:
      "Follow-up questions stay coherent with lightweight multi-turn memory that preserves the last few exchanges.",
    icon: BrainPulseIcon,
    accent: "from-cyanGlow/50 to-sky-400/35",
  },
  {
    title: "Campus Ops Ready",
    description:
      "Built for real deployment with health checks, initialization flows, local fallback mode, and clean API surfaces.",
    icon: ShieldGridIcon,
    accent: "from-fuchsia-500/35 to-violetGlow/45",
  },
];

// Sticky product nav with the primary conversion path into the assistant experience.
function Navbar({ status, onTryAssistant }) {
  return html`
    <header className="sticky top-0 z-40 px-4 pt-4 sm:px-6 lg:px-8">
      <nav
        className=${cn(
          PANEL_CLASS,
          "mx-auto flex max-w-7xl items-center justify-between rounded-[24px] px-4 py-3 sm:px-6"
        )}
      >
        <button
          type="button"
          onClick=${() => smoothScrollTo("top")}
          className="flex items-center gap-3"
        >
          <${LogoMark} className="h-11 w-11" />
          <div className="text-left">
            <div className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-200/80">
              CampusPulse
            </div>
            <div className="text-sm text-slate-400">
              AI campus operating layer
            </div>
          </div>
        </button>

        <div className="hidden items-center gap-8 md:flex">
          ${footerLinks.map(
            (link) => html`
              <${NavLink}
                key=${link.target}
                label=${link.label}
                target=${link.target}
              />
            `
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:block">
            <${StatusBadge} status=${status} />
          </div>
          <button
            type="button"
            className=${PRIMARY_BUTTON}
            onClick=${onTryAssistant}
          >
            Try AI Assistant
            <${ArrowUpRightIcon} />
          </button>
        </div>
      </nav>
    </header>
  `;
}

// Right-side hero preview that visualizes the RAG flow as a premium product artifact.
function HeroVisual({ status }) {
  return html`
    <div className="relative flex min-h-[420px] items-center justify-center lg:justify-end">
      <div className="orb-float absolute left-0 top-10 h-36 w-36 rounded-full bg-electric/25 blur-3xl"></div>
      <div className="orb-float-delay absolute bottom-0 right-10 h-44 w-44 rounded-full bg-cyanGlow/20 blur-3xl"></div>

      <div className="relative w-full max-w-[34rem]">
        <div
          className=${cn(
            PANEL_CLASS,
            "relative overflow-hidden rounded-[32px] border-white/14 bg-slate-900/70 p-5"
          )}
        >
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyanGlow/70 to-transparent"></div>
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/75">
                Retrieval Preview
              </div>
              <h3 className="mt-3 text-xl font-semibold text-white">
                Ask one question, orchestrate campus context.
              </h3>
            </div>
            <${StatusBadge} status=${status} />
          </div>

          <div className="grid gap-4">
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
              <div className="text-[11px] uppercase tracking-[0.22em] text-slate-400">
                Query
              </div>
              <div className="mt-2 text-sm text-slate-100">
                "When is Hack the Campus 2026 and who can join?"
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="text-[11px] uppercase tracking-[0.22em] text-slate-400">
                  Step 1
                </div>
                <div className="mt-2 text-sm font-medium text-white">Embed</div>
                <div className="mt-1 text-xs text-slate-400">
                  Vectorize the question for fast semantic search.
                </div>
              </div>
              <div className="rounded-2xl border border-electric/20 bg-electric/10 p-4">
                <div className="text-[11px] uppercase tracking-[0.22em] text-electric">
                  Step 2
                </div>
                <div className="mt-2 text-sm font-medium text-white">
                  Retrieve
                </div>
                <div className="mt-1 text-xs text-slate-300">
                  Top campus chunks pulled from FAISS with metadata.
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="text-[11px] uppercase tracking-[0.22em] text-slate-400">
                  Step 3
                </div>
                <div className="mt-2 text-sm font-medium text-white">
                  Ground
                </div>
                <div className="mt-1 text-xs text-slate-400">
                  Answer only from context and attach sources.
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-cyanGlow/15 bg-gradient-to-br from-cyanGlow/10 via-transparent to-electric/10 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-semibold text-white">
                  Answer preview
                </div>
                <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-slate-300">
                  Citations attached
                </span>
              </div>
              <p className="mt-3 text-sm leading-7 text-slate-200">
                Hack the Campus 2026 takes place on April 12, 2026 from 9:00 AM
                to 9:00 PM in Central Innovation Hall. It is open to
                undergraduate students in teams of 2 to 4.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-slate-300">
                  events.json - Hack the Campus 2026
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute -left-6 top-14 hidden w-40 rounded-3xl border border-white/10 bg-slate-950/70 p-4 shadow-soft backdrop-blur xl:block">
          <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
            Campus signal
          </div>
          <div className="mt-2 text-3xl font-semibold text-white">24/7</div>
          <div className="mt-2 text-xs leading-6 text-slate-400">
            Instant answers across placements, events, clubs, and campus policy.
          </div>
        </div>

        <div className="pointer-events-none absolute -bottom-8 right-6 hidden w-48 rounded-3xl border border-white/10 bg-slate-950/70 p-4 shadow-soft backdrop-blur xl:block">
          <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
            Mode
          </div>
          <div className="mt-2 text-lg font-semibold text-white">
            ${status.mode}
          </div>
          <div className="mt-2 text-xs leading-6 text-slate-400">
            ${status.detail}
          </div>
        </div>
      </div>
    </div>
  `;
}

function HeroSection({ status, onTryAssistant }) {
  return html`
    <section id="top" className="px-4 pt-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <${Reveal}>
          <div className="relative overflow-hidden rounded-[36px] border border-white/10 bg-hero px-6 py-8 shadow-glow sm:px-10 sm:py-12 lg:px-14 lg:py-16">
            <div className="absolute inset-y-0 right-0 hidden w-[40%] bg-[radial-gradient(circle_at_top,rgba(103,232,249,0.18),transparent_55%)] lg:block"></div>
            <div className="relative grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-white/[0.04] px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-100">
                  <${SparkleIcon} className="h-4 w-4" />
                  AI-powered campus intelligence
                </div>

                <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
                  Build a campus experience that feels more like a product than
                  a portal.
                </h1>

                <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                  CampusPulse turns scattered campus knowledge into a premium AI
                  layer for events, clubs, placements, and FAQs. Retrieval,
                  citations, session memory, and fast answers live inside one
                  clean interface.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    className=${PRIMARY_BUTTON}
                    onClick=${onTryAssistant}
                  >
                    Try AI Assistant
                    <${ArrowUpRightIcon} />
                  </button>
                  <button
                    type="button"
                    className=${SECONDARY_BUTTON}
                    onClick=${() => smoothScrollTo("signals")}
                  >
                    Explore Campus Grid
                  </button>
                </div>

                <div className="mt-10 grid gap-4 sm:grid-cols-3">
                  ${capabilityMetrics.map(
                    (metric) => html`
                      <div
                        key=${metric.label}
                        className="rounded-3xl border border-white/10 bg-white/[0.05] p-4 shadow-soft"
                      >
                        <div className="text-2xl font-semibold text-white">
                          ${metric.value}
                        </div>
                        <div className="mt-2 text-sm font-medium text-slate-100">
                          ${metric.label}
                        </div>
                        <div className="mt-2 text-xs leading-6 text-slate-400">
                          ${metric.detail}
                        </div>
                      </div>
                    `
                  )}
                </div>
              </div>

              <${HeroVisual} status=${status} />
            </div>
          </div>
        </${Reveal}>
      </div>
    </section>
  `;
}

function FeatureCard({ title, description, icon: Icon, accent }) {
  return html`
    <div className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-slate-900/55 p-6 shadow-soft transition duration-300 hover:-translate-y-1.5 hover:border-cyan-300/20 hover:bg-slate-900/70">
      <div className=${cn("absolute inset-x-0 top-0 h-1 bg-gradient-to-r", accent)}></div>
      <div className="mb-6 inline-flex rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-cyan-200">
        <${Icon} />
      </div>
      <h3 className="text-lg font-semibold text-white">${title}</h3>
      <p className="mt-3 text-sm leading-7 text-slate-400">${description}</p>
    </div>
  `;
}

function FeaturesSection() {
  return html`
    <section id="features" className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <${Reveal}>
          <${SectionHeader}
            eyebrow="Core Capabilities"
            title="A campus AI layer designed like a modern SaaS product."
            description="CampusPulse blends premium UX with practical AI infrastructure: vector retrieval, grounded answers, chat memory, and operator-friendly service flows."
          />
        </${Reveal}>

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          ${featureCards.map(
            (feature) => html`
              <${Reveal} key=${feature.title}>
                <${FeatureCard}
                  title=${feature.title}
                  description=${feature.description}
                  icon=${feature.icon}
                  accent=${feature.accent}
                />
              </${Reveal}>
            `
          )}
        </div>
      </div>
    </section>
  `;
}

function SignalCard({ card }) {
  return html`
    <div className="group relative overflow-hidden rounded-[30px] border border-white/10 bg-slate-900/55 p-6 shadow-soft transition duration-300 hover:-translate-y-1.5 hover:border-white/15">
      <div className=${cn("absolute inset-0 bg-gradient-to-br opacity-80", card.tone)}></div>
      <div className="relative">
        <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
          ${card.eyebrow}
        </div>
        <h3 className="mt-4 text-2xl font-semibold text-white">${card.title}</h3>
        <p className="mt-4 text-sm leading-7 text-slate-300">${card.description}</p>
        <div className="mt-6 flex flex-wrap gap-2">
          ${card.tags.map(
            (tag) => html`
              <span
                key=${tag}
                className="rounded-full border border-white/12 bg-white/[0.05] px-3 py-1 text-xs font-medium text-slate-200"
              >
                ${tag}
              </span>
            `
          )}
        </div>
      </div>
    </div>
  `;
}

function CampusSignalsSection() {
  return html`
    <section id="signals" className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <${Reveal}>
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <${SectionHeader}
              eyebrow="Campus Command Center"
              title="The interface reflects intelligence, not clutter."
              description="From event discovery to placement prep, the product language stays clean, sharp, and operationally useful. These cards show how the assistant frames live campus signals."
            />

            <div className="grid gap-3 sm:grid-cols-3">
              ${productSignals.map(
                (signal) => html`
                  <div
                    key=${signal.label}
                    className="rounded-[26px] border border-white/10 bg-white/[0.04] p-4 shadow-soft"
                  >
                    <div className="text-xs uppercase tracking-[0.24em] text-slate-500">
                      ${signal.label}
                    </div>
                    <div className="mt-3 text-sm font-semibold text-white">
                      ${signal.value}
                    </div>
                  </div>
                `
              )}
            </div>
          </div>
        </${Reveal}>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          ${campusSignals.map(
            (card) => html`
              <${Reveal} key=${card.title}>
                <${SignalCard} card=${card} />
              </${Reveal}>
            `
          )}
        </div>
      </div>
    </section>
  `;
}

function Footer() {
  return html`
    <footer className="px-4 pb-10 pt-8 sm:px-6 lg:px-8">
      <div
        className=${cn(
          PANEL_CLASS,
          "mx-auto max-w-7xl rounded-[32px] px-6 py-8 sm:px-8"
        )}
      >
        <div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr] md:items-end">
          <div>
            <div className="flex items-center gap-3">
              <${LogoMark} className="h-11 w-11" />
              <div>
                <div className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-200/80">
                  CampusPulse
                </div>
                <div className="text-sm text-slate-400">
                  AI campus operating layer
                </div>
              </div>
            </div>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-400">
              A premium interface for RAG-powered campus intelligence. Events,
              clubs, placements, and FAQs stay one citation away.
            </p>
          </div>

          <div className="flex flex-col gap-3 md:items-end">
            <div className="flex flex-wrap gap-4">
              ${footerLinks.map(
                (link) => html`
                  <button
                    key=${link.target}
                    type="button"
                    onClick=${() => smoothScrollTo(link.target)}
                    className="text-sm text-slate-400 transition hover:text-white"
                  >
                    ${link.label}
                  </button>
                `
              )}
            </div>
            <div className="text-sm text-slate-500">
              Local backend: 127.0.0.1:8000
            </div>
          </div>
        </div>
      </div>
    </footer>
  `;
}

export {
  CampusSignalsSection,
  FeaturesSection,
  Footer,
  HeroSection,
  Navbar,
};
