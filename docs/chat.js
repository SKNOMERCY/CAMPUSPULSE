import { html, useEffect, useRef, useState } from "./lib.js";
import {
  PANEL_CLASS,
  PRIMARY_BUTTON,
  SECONDARY_BUTTON,
  cn,
  suggestedPrompts,
} from "./data.js";
import { ArrowUpRightIcon, LogoMark, MessageSquareIcon } from "./icons.js";
import { Reveal } from "./hooks.js";
import { SectionHeader, StatusBadge } from "./ui.js";

function MessageBubble({ message }) {
  const isUser = message.role === "user";

  return html`
    <div className=${cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className=${cn(
          "max-w-[90%] rounded-[24px] px-4 py-3 text-sm leading-7 shadow-soft",
          isUser
            ? "rounded-br-md bg-gradient-to-r from-electric via-cyanGlow to-violetGlow text-slate-950"
            : "rounded-bl-md border border-white/10 bg-white/[0.05] text-slate-200"
        )}
      >
        <div>${message.text}</div>
        ${!isUser && message.sources?.length
          ? html`
              <div className="mt-3 flex flex-wrap gap-2">
                ${message.sources.map(
                  (source) => html`
                    <span
                      key=${source}
                      className="rounded-full border border-white/10 bg-slate-900/70 px-3 py-1 text-[11px] text-slate-300"
                    >
                      ${source}
                    </span>
                  `
                )}
              </div>
            `
          : null}
      </div>
    </div>
  `;
}

function TypingBubble() {
  return html`
    <div className="flex justify-start">
      <div className="inline-flex items-center gap-2 rounded-[24px] rounded-bl-md border border-white/10 bg-white/[0.05] px-4 py-3 shadow-soft">
        <span className="typing-dot"></span>
        <span className="typing-dot"></span>
        <span className="typing-dot"></span>
      </div>
    </div>
  `;
}

function ConversationFeed({ messages, typing, compact = false }) {
  const feedRef = useRef(null);

  useEffect(() => {
    // Keep the latest exchange visible as the assistant streams new turns into the thread.
    const node = feedRef.current;
    if (!node) return;
    node.scrollTop = node.scrollHeight;
  }, [messages, typing]);

  return html`
    <div
      ref=${feedRef}
      className=${cn(
        "chat-scroll flex flex-col gap-4 overflow-y-auto pr-1",
        compact ? "h-[20rem]" : "h-[24rem] lg:h-[28rem]"
      )}
    >
      ${messages.map(
        (message) => html`<${MessageBubble} key=${message.id} message=${message} />`
      )}
      ${typing ? html`<${TypingBubble} />` : null}
    </div>
  `;
}

function Composer({
  onSend,
  placeholder = "Ask about a club, event, placement, or policy...",
}) {
  const [draft, setDraft] = useState("");

  const submit = () => {
    const cleanDraft = draft.trim();
    if (!cleanDraft) return;
    onSend(cleanDraft);
    setDraft("");
  };

  return html`
    <div className="rounded-[24px] border border-white/10 bg-slate-950/65 p-3 shadow-soft">
      <div className="flex items-end gap-3">
        <textarea
          rows="2"
          value=${draft}
          onChange=${(event) => setDraft(event.target.value)}
          onKeyDown=${(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              submit();
            }
          }}
          placeholder=${placeholder}
          className="min-h-[64px] flex-1 resize-none rounded-2xl border-none bg-transparent px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:ring-0"
        ></textarea>
        <button
          type="button"
          onClick=${submit}
          className=${cn(PRIMARY_BUTTON, "px-4 py-3")}
        >
          <${ArrowUpRightIcon} className="h-4 w-4 rotate-45" />
        </button>
      </div>
    </div>
  `;
}

function PromptList({ onPrompt }) {
  return html`
    <div className="flex flex-wrap gap-2">
      ${suggestedPrompts.map(
        (prompt) => html`
          <button
            key=${prompt}
            type="button"
            onClick=${() => onPrompt(prompt)}
            className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-left text-xs text-slate-300 transition hover:border-cyan-300/35 hover:bg-white/[0.08] hover:text-white"
          >
            ${prompt}
          </button>
        `
      )}
    </div>
  `;
}

function AssistantSection({
  status,
  sessionId,
  messages,
  typing,
  onSend,
  onTryFloating,
  onInitialize,
  onRefreshHealth,
}) {
  return html`
    <section id="assistant" className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <${Reveal}>
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className=${cn(PANEL_CLASS, "p-6 sm:p-8")}>
              <${SectionHeader}
                eyebrow="AI Assistant"
                title="The main interface feels like a premium product workspace."
                description="Ask grounded questions, initialize the RAG index, and keep follow-up context alive in one modern assistant surface."
              />

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[26px] border border-white/10 bg-white/[0.04] p-5">
                  <div className="text-[11px] uppercase tracking-[0.24em] text-slate-500">
                    Assistant status
                  </div>
                  <div className="mt-3">
                    <${StatusBadge} status=${status} />
                  </div>
                  <p className="mt-4 text-sm leading-7 text-slate-400">
                    ${status.detail}
                  </p>
                </div>

                <div className="rounded-[26px] border border-white/10 bg-white/[0.04] p-5">
                  <div className="text-[11px] uppercase tracking-[0.24em] text-slate-500">
                    Session memory
                  </div>
                  <div className="mt-3 text-base font-semibold text-white">
                    Live chat context preserved
                  </div>
                  <p className="mt-3 break-all text-sm leading-7 text-slate-400">
                    ${sessionId}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  className=${PRIMARY_BUTTON}
                  onClick=${onInitialize}
                >
                  Initialize Knowledge Base
                </button>
                <button
                  type="button"
                  className=${SECONDARY_BUTTON}
                  onClick=${onRefreshHealth}
                >
                  Refresh Backend Status
                </button>
                <button
                  type="button"
                  className=${SECONDARY_BUTTON}
                  onClick=${onTryFloating}
                >
                  Open Floating Chat
                </button>
              </div>

              <div className="mt-8">
                <div className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Suggested prompts
                </div>
                <${PromptList} onPrompt=${onSend} />
              </div>
            </div>

            <div className=${cn(PANEL_CLASS, "overflow-hidden p-1")}>
              <div className="rounded-[26px] border border-white/10 bg-slate-950/70 p-4 sm:p-5">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/70">
                      Conversation Layer
                    </div>
                    <div className="mt-2 text-lg font-semibold text-white">
                      CampusPulse Assistant
                    </div>
                  </div>
                  <${StatusBadge} status=${status} />
                </div>

                <${ConversationFeed}
                  messages=${messages}
                  typing=${typing}
                />

                <div className="mt-4">
                  <${Composer} onSend=${onSend} />
                </div>
              </div>
            </div>
          </div>
        </${Reveal}>
      </div>
    </section>
  `;
}

function FloatingChat({ open, status, messages, typing, onSend, onToggle }) {
  return html`
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-4 sm:bottom-8 sm:right-8">
      <div
        className=${cn(
          "origin-bottom-right transition duration-300",
          open
            ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-y-6 scale-95 opacity-0"
        )}
      >
        <div
          className=${cn(
            PANEL_CLASS,
            "w-[calc(100vw-2rem)] max-w-[24rem] overflow-hidden p-1"
          )}
        >
          <div className="rounded-[24px] border border-white/10 bg-slate-950/80 p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <${LogoMark} className="h-10 w-10" />
                <div>
                  <div className="text-sm font-semibold text-white">
                    CampusPulse Chat
                  </div>
                  <div className="text-xs text-slate-400">${status.mode}</div>
                </div>
              </div>
              <button
                type="button"
                onClick=${onToggle}
                className="rounded-full border border-white/10 bg-white/[0.04] p-2 text-slate-300 transition hover:bg-white/[0.08] hover:text-white"
                aria-label="Close assistant chat"
              >
                <span className="block h-4 w-4 text-sm leading-none">x</span>
              </button>
            </div>

            <${ConversationFeed}
              messages=${messages}
              typing=${typing}
              compact=${true}
            />

            <div className="mt-4">
              <${Composer}
                onSend=${onSend}
                placeholder="Ask the floating assistant..."
              />
            </div>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick=${onToggle}
        className="group inline-flex items-center gap-3 rounded-full border border-cyan-300/20 bg-gradient-to-r from-electric via-cyanGlow to-violetGlow px-5 py-4 text-sm font-semibold text-slate-950 shadow-glow transition duration-300 hover:-translate-y-1"
      >
        <${MessageSquareIcon} />
        ${open ? "Hide Assistant" : "Chat with CampusPulse"}
      </button>
    </div>
  `;
}

export { AssistantSection, FloatingChat };
