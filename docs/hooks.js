import {
  html,
  startTransition,
  useEffect,
  useRef,
  useState,
} from "./lib.js";
import { API_BASE, ASSISTANT_SESSION_KEY, cn } from "./data.js";

function makeMessage(role, text, sources = []) {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    role,
    text,
    sources,
  };
}

function getAssistantSessionId() {
  const existing = localStorage.getItem(ASSISTANT_SESSION_KEY);
  if (existing) return existing;

  const generated = `cp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  localStorage.setItem(ASSISTANT_SESSION_KEY, generated);
  return generated;
}

function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.18 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return [ref, visible];
}

function Reveal({ children, className = "" }) {
  const [ref, visible] = useReveal();

  return html`
    <div ref=${ref} className=${cn("reveal", visible && "reveal-visible", className)}>
      ${children}
    </div>
  `;
}

// Keeps the UI aware of whether the local FastAPI assistant is reachable and indexed.
function useBackendStatus() {
  const [status, setStatus] = useState({
    state: "checking",
    label: "Checking backend",
    detail: "Pinging the local CampusPulse assistant service.",
    mode: "Standby",
  });

  const applyHealth = (payload) => {
    const ready = Boolean(payload?.initialized);
    const mode =
      payload?.answer_mode === "openai"
        ? "OpenAI RAG live"
        : "Grounded local mode";

    setStatus({
      state: "online",
      label: ready ? "Assistant live" : "Backend reachable",
      detail: ready
        ? `${mode} · ${payload.embedding_model || "retrieval model"}`
        : `${mode} · initialize or ask to warm the knowledge base`,
      mode,
    });
  };

  const checkStatus = async () => {
    try {
      const response = await fetch(`${API_BASE}/health`);
      if (!response.ok) throw new Error("Health check failed.");

      const payload = await response.json();
      applyHealth(payload);
      return payload;
    } catch {
      setStatus({
        state: "offline",
        label: "Backend offline",
        detail:
          "Run backend/start_backend.bat or uvicorn backend.main:app --reload.",
        mode: "Unavailable",
      });
      return null;
    }
  };

  const initializeIndex = async () => {
    setStatus({
      state: "checking",
      label: "Initializing knowledge base",
      detail: "Building or loading the campus retrieval index.",
      mode: "Working",
    });

    const response = await fetch(`${API_BASE}/init`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rebuild: false }),
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message =
        payload?.detail || "Could not initialize the knowledge base.";
      setStatus({
        state: "offline",
        label: "Initialization failed",
        detail: message,
        mode: "Unavailable",
      });
      throw new Error(message);
    }

    setStatus({
      state: "online",
      label: "Knowledge base ready",
      detail: `${payload.chunks_indexed} campus chunks indexed with ${payload.provider}.`,
      mode: `${payload.embedding_model || "configured embeddings"}`,
    });

    return payload;
  };

  useEffect(() => {
    checkStatus();
    const intervalId = window.setInterval(checkStatus, 30000);
    return () => window.clearInterval(intervalId);
  }, []);

  return { status, checkStatus, initializeIndex };
}

// Owns the shared chat transcript used by both the main assistant panel and the floating widget.
function useAssistantConversation(checkStatus) {
  const [sessionId] = useState(() => getAssistantSessionId());
  const [messages, setMessages] = useState(() => [
    makeMessage(
      "assistant",
      "CampusPulse is ready to answer questions about events, clubs, placements, and campus FAQs. Ask anything and I will keep the response grounded in the campus knowledge base."
    ),
  ]);
  const [typing, setTyping] = useState(false);

  const appendAssistantMessage = (text, sources = []) => {
    startTransition(() => {
      setMessages((current) => [...current, makeMessage("assistant", text, sources)]);
    });
  };

  const sendMessage = async (question) => {
    const cleanQuestion = question.trim();
    if (!cleanQuestion) return;

    startTransition(() => {
      setMessages((current) => [...current, makeMessage("user", cleanQuestion)]);
    });
    setTyping(true);

    try {
      const response = await fetch(`${API_BASE}/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: cleanQuestion,
          session_id: sessionId,
          top_k: 4,
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(
          payload?.detail || "The assistant could not complete the request."
        );
      }

      appendAssistantMessage(
        payload.answer || "I don't have enough information.",
        payload.sources || []
      );
      checkStatus();
    } catch (error) {
      appendAssistantMessage(
        `I couldn't reach the CampusPulse backend. ${error.message || "Start the local API and try again."}`
      );
      checkStatus();
    } finally {
      setTyping(false);
    }
  };

  return { messages, typing, sendMessage, appendAssistantMessage, sessionId };
}

export {
  Reveal,
  makeMessage,
  useAssistantConversation,
  useBackendStatus,
};
