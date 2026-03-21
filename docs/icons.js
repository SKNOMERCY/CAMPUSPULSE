import { html } from "./lib.js";
import { cn } from "./data.js";

function LogoMark({ className = "h-10 w-10" }) {
  return html`
    <div
      className=${cn(
        "grid place-items-center rounded-2xl bg-gradient-to-br from-electric via-cyanGlow to-violetGlow text-slate-950 shadow-glow",
        className
      )}
    >
      <svg viewBox="0 0 48 48" fill="none" className="h-6 w-6">
        <path
          d="M10 24C10 15.16 17.16 8 26 8H38V20C38 28.84 30.84 36 22 36H10V24Z"
          fill="currentColor"
          opacity="0.95"
        ></path>
        <path
          d="M14 28C14 21.37 19.37 16 26 16H34V20C34 26.63 28.63 32 22 32H14V28Z"
          fill="#050816"
          opacity="0.88"
        ></path>
      </svg>
    </div>
  `;
}

function SearchOrbitIcon({ className = "h-6 w-6" }) {
  return html`
    <svg
      className=${className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="5.5"></circle>
      <path d="M20 20L15.6 15.6"></path>
      <path d="M11 5V3"></path>
      <path d="M5 11H3"></path>
      <path d="M11 19V17"></path>
    </svg>
  `;
}

function DatabaseStackIcon({ className = "h-6 w-6" }) {
  return html`
    <svg
      className=${className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <ellipse cx="12" cy="5.5" rx="7" ry="2.5"></ellipse>
      <path d="M5 5.5V11c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5V5.5"></path>
      <path d="M5 11v5.5c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5V11"></path>
    </svg>
  `;
}

function BrainPulseIcon({ className = "h-6 w-6" }) {
  return html`
    <svg
      className=${className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 5a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3"></path>
      <path d="M15 5a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3"></path>
      <path d="M9 12h6"></path>
      <path d="M12 9v6"></path>
      <path d="M6 10H4"></path>
      <path d="M20 14h-2"></path>
    </svg>
  `;
}

function ShieldGridIcon({ className = "h-6 w-6" }) {
  return html`
    <svg
      className=${className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3l7 3v5c0 4.4-2.8 8.4-7 10-4.2-1.6-7-5.6-7-10V6l7-3Z"></path>
      <path d="M9.5 10.5h5"></path>
      <path d="M9.5 13.5h5"></path>
    </svg>
  `;
}

function ArrowUpRightIcon({ className = "h-4 w-4" }) {
  return html`
    <svg
      className=${className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 17L17 7"></path>
      <path d="M9 7h8v8"></path>
    </svg>
  `;
}

function MessageSquareIcon({ className = "h-5 w-5" }) {
  return html`
    <svg
      className=${className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 6.5A2.5 2.5 0 0 1 7.5 4h9A2.5 2.5 0 0 1 19 6.5v7A2.5 2.5 0 0 1 16.5 16H10l-4 4v-4.5A2.5 2.5 0 0 1 5 13V6.5Z"></path>
    </svg>
  `;
}

function SparkleIcon({ className = "h-4 w-4" }) {
  return html`
    <svg
      className=${className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3l1.1 3.4L16.5 7.5l-3.4 1.1L12 12l-1.1-3.4L7.5 7.5l3.4-1.1L12 3Z"></path>
      <path d="M18 13l0.7 2.3L21 16l-2.3 0.7L18 19l-0.7-2.3L15 16l2.3-0.7L18 13Z"></path>
      <path d="M6 13l0.7 2.3L9 16l-2.3 0.7L6 19l-0.7-2.3L3 16l2.3-0.7L6 13Z"></path>
    </svg>
  `;
}

export {
  ArrowUpRightIcon,
  BrainPulseIcon,
  DatabaseStackIcon,
  LogoMark,
  MessageSquareIcon,
  SearchOrbitIcon,
  ShieldGridIcon,
  SparkleIcon,
};
