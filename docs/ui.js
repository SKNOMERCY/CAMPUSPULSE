import { html } from "./lib.js";
import { cn, footerLinks, smoothScrollTo } from "./data.js";
import { Reveal } from "./hooks.js";

function StatusBadge({ status }) {
  const toneClasses = {
    online: "border-emerald-400/25 bg-emerald-400/10 text-emerald-200",
    checking: "border-amber-300/25 bg-amber-300/10 text-amber-100",
    offline: "border-rose-300/25 bg-rose-400/10 text-rose-100",
  };

  const dotClasses = {
    online: "bg-emerald-300",
    checking: "bg-amber-200",
    offline: "bg-rose-300",
  };

  return html`
    <span
      className=${cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium",
        toneClasses[status.state] || toneClasses.checking
      )}
    >
      <span className=${cn("h-2 w-2 rounded-full", dotClasses[status.state] || dotClasses.checking)}></span>
      ${status.label}
    </span>
  `;
}

function NavLink({ label, target }) {
  return html`
    <button
      type="button"
      onClick=${() => smoothScrollTo(target)}
      className="text-sm text-slate-300 transition hover:text-white"
    >
      ${label}
    </button>
  `;
}

function SectionHeader({ eyebrow, title, description, align = "left" }) {
  return html`
    <div className=${cn("max-w-3xl", align === "center" && "mx-auto text-center")}>
      <div className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/70">
        ${eyebrow}
      </div>
      <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
        ${title}
      </h2>
      <p className="mt-4 text-base leading-8 text-slate-400">${description}</p>
    </div>
  `;
}

export { NavLink, Reveal, SectionHeader, StatusBadge, footerLinks };
