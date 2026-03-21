from __future__ import annotations

import os
import re
from pathlib import Path
from typing import Any

from openai import OpenAI

from .data_loader import CampusDataLoader
from .embeddings import EmbeddingService
from .memory import SessionMemoryStore
from .retriever import FaissRetriever, RetrievedChunk


SYSTEM_PROMPT = """You are the CampusPulse AI campus assistant.

Rules:
- Answer using only the retrieved campus context.
- If the context does not contain the answer, reply exactly: I don't have enough information.
- Do not invent policies, schedules, contacts, deadlines, or eligibility details.
- Use recent conversation only to resolve follow-up references, not to add new facts.
- Keep the answer concise and directly helpful.
- Do not output a Sources section because the API adds citations separately.
"""


class CampusRAGPipeline:
    """Coordinates loading, retrieval, prompt construction, and grounded generation."""

    def __init__(
        self,
        data_dir: str | Path,
        storage_dir: str | Path,
        top_k: int | None = None,
        history_messages: int | None = None,
    ) -> None:
        self.data_dir = Path(data_dir)
        self.storage_dir = Path(storage_dir)
        self.top_k = top_k or int(os.getenv("TOP_K", "4"))
        self.history_messages = history_messages or int(os.getenv("RAG_HISTORY_MESSAGES", "5"))
        self.min_score = float(os.getenv("RAG_MIN_SCORE", "0.12"))
        self.max_output_tokens = int(os.getenv("RAG_MAX_OUTPUT_TOKENS", "300"))

        self.loader = CampusDataLoader(self.data_dir)
        self.embedder = EmbeddingService()
        self.retriever = FaissRetriever(self.embedder, self.storage_dir)
        self.memory = SessionMemoryStore()
        self._llm_client = self._build_llm_client()
        self.chat_model = os.getenv("OPENAI_CHAT_MODEL", "gpt-4o-mini")
        self.initialized = False

    def initialize(self, force_rebuild: bool = False) -> dict[str, Any]:
        # Reuse a compatible on-disk index to keep startup fast.
        if not force_rebuild and self.retriever.load():
            if self.retriever.is_compatible():
                self.initialized = True
                return self._init_payload("loaded")
            self.retriever.clear()

        chunks = self.loader.load_chunks()
        self.retriever.build(chunks)
        self.initialized = True
        return self._init_payload("rebuilt")

    def query(self, session_id: str, user_query: str, top_k: int | None = None) -> dict[str, Any]:
        if not self.initialized:
            self.initialize(force_rebuild=False)

        top_k = max(1, min(top_k or self.top_k, 5))
        # Retrieve the most relevant chunks before the model sees the question.
        retrieved = self.retriever.retrieve(user_query, top_k=top_k, min_score=self.min_score)
        sources = self._sources_from_hits(retrieved)

        if not retrieved or retrieved[0].score < self.min_score:
            answer = "I don't have enough information."
            self.memory.add_exchange(session_id, user_query, answer)
            return {"answer": answer, "sources": sources}

        if self._llm_client is None:
            best_hit = self._best_fallback_hit(user_query, retrieved)
            answer = self._answer_without_llm(user_query=user_query, retrieved=retrieved)
            self.memory.add_exchange(session_id, user_query, answer)
            return {"answer": answer, "sources": [best_hit.chunk.source_label()]}

        # The LLM only receives retrieved context plus a short session window for follow-ups.
        prompt = self._build_user_prompt(session_id=session_id, user_query=user_query, retrieved=retrieved)
        response = self._llm_client.responses.create(
            model=self.chat_model,
            input=[
                {
                    "role": "system",
                    "content": [{"type": "input_text", "text": SYSTEM_PROMPT}],
                },
                {
                    "role": "user",
                    "content": [{"type": "input_text", "text": prompt}],
                },
            ],
            max_output_tokens=self.max_output_tokens,
        )

        answer = self._extract_output_text(response).strip() or "I don't have enough information."
        # Save the turn so follow-up questions can refer back to the last few messages.
        self.memory.add_exchange(session_id, user_query, answer)
        return {"answer": answer, "sources": sources}

    def health(self) -> dict[str, Any]:
        return {
            "status": "ok",
            "initialized": self.initialized,
            "embedding_provider": self.embedder.manifest()["provider"],
            "embedding_model": self.embedder.manifest()["model"],
            "llm_configured": self._llm_client is not None,
            "answer_mode": "openai" if self._llm_client is not None else "extractive-fallback",
            "data_dir": str(self.data_dir),
            "storage_dir": str(self.storage_dir),
        }

    def _build_llm_client(self) -> OpenAI | None:
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            return None
        return OpenAI(api_key=api_key)

    def _build_user_prompt(
        self,
        session_id: str,
        user_query: str,
        retrieved: list[RetrievedChunk],
    ) -> str:
        history = self.memory.recent_messages(session_id, limit=self.history_messages)
        history_block = "\n".join(
            f"{message.role.title()}: {message.content}" for message in history
        ) or "No prior conversation."

        context_blocks = []
        for index, hit in enumerate(retrieved, start=1):
            context_blocks.append(
                "\n".join(
                    [
                        f"[Context {index}]",
                        f"Source file: {hit.chunk.source_file}",
                        f"Section: {hit.chunk.section}",
                        f"Title: {hit.chunk.title}",
                        f"Content: {hit.chunk.text}",
                    ]
                )
            )

        return "\n\n".join(
            [
                "Recent conversation:",
                history_block,
                "Retrieved campus context:",
                "\n\n".join(context_blocks),
                f"User question: {user_query}",
                "Answer using only the retrieved campus context.",
            ]
        )

    def _sources_from_hits(self, retrieved: list[RetrievedChunk]) -> list[str]:
        seen: set[str] = set()
        sources: list[str] = []
        for hit in retrieved:
            label = hit.chunk.source_label()
            if label not in seen:
                seen.add(label)
                sources.append(label)
        return sources

    def _init_payload(self, status: str) -> dict[str, Any]:
        manifest = self.retriever.embedding_manifest or self.embedder.manifest()
        return {
            "status": status,
            "provider": manifest.get("provider"),
            "embedding_model": manifest.get("model"),
            "chunks_indexed": len(self.retriever.chunks),
            "index_path": str(self.retriever.index_path),
        }

    def _extract_output_text(self, response: Any) -> str:
        output_text = getattr(response, "output_text", "")
        if output_text:
            return output_text

        fragments: list[str] = []
        for item in getattr(response, "output", []):
            for content in getattr(item, "content", []):
                text = getattr(content, "text", None)
                if text:
                    fragments.append(text)
        return "\n".join(fragments)

    def _answer_without_llm(self, user_query: str, retrieved: list[RetrievedChunk]) -> str:
        best_hit = self._best_fallback_hit(user_query, retrieved)
        focused_answer = self._focused_fallback_answer(user_query, best_hit)
        if focused_answer:
            return focused_answer

        query_terms = {
            token for token in re.findall(r"\b[a-zA-Z0-9]{3,}\b", user_query.lower())
            if token not in {"what", "when", "where", "which", "about", "there", "their", "have", "with", "from"}
        }

        candidate_sentences: list[tuple[int, str]] = []
        for hit in retrieved:
            sentences = re.split(r"(?<=[.!?])\s+", hit.chunk.text)
            for sentence in sentences:
                clean = sentence.strip()
                if not clean:
                    continue
                overlap = sum(1 for term in query_terms if term in clean.lower())
                candidate_sentences.append((overlap, clean))

        candidate_sentences.sort(key=lambda item: item[0], reverse=True)
        selected: list[str] = []
        for overlap, sentence in candidate_sentences:
            if overlap == 0 and selected:
                continue
            if sentence not in selected:
                selected.append(sentence)
            if len(selected) == 3:
                break

        if not selected:
            first_chunk = retrieved[0].chunk.text.strip()
            return first_chunk if first_chunk else "I don't have enough information."

        return " ".join(selected)

    def _best_fallback_hit(self, user_query: str, retrieved: list[RetrievedChunk]) -> RetrievedChunk:
        query_terms = set(re.findall(r"\b[a-zA-Z0-9]{3,}\b", user_query.lower()))

        def score_hit(hit: RetrievedChunk) -> tuple[int, float]:
            title_terms = set(re.findall(r"\b[a-zA-Z0-9]{3,}\b", hit.chunk.title.lower()))
            overlap = len(query_terms & title_terms)
            return overlap, hit.score

        return max(retrieved, key=score_hit)

    def _focused_fallback_answer(self, user_query: str, hit: RetrievedChunk) -> str | None:
        lowered_query = user_query.lower()
        needs_when = any(term in lowered_query for term in {"when", "date", "time", "deadline"})
        needs_where = any(term in lowered_query for term in {"where", "venue", "location"})
        needs_join = any(term in lowered_query for term in {"who can", "eligibility", "audience", "join", "membership"})
        needs_contact = any(term in lowered_query for term in {"contact", "email", "coordinator", "organizer", "organiser"})

        labels: list[str] = []
        if needs_when:
            labels.extend(["Date:", "Time:", "Registration deadline:", "Meeting schedule:", "Hiring timeline:"])
        if needs_where:
            labels.extend(["Venue:", "Location:"])
        if needs_join:
            labels.extend(["Audience:", "Eligibility:", "Membership:"])
        if needs_contact:
            labels.extend(["Contact:", "Faculty coordinator:", "Organizer:", "Organizer"])

        if not labels:
            return None

        sentences = [sentence.strip() for sentence in re.split(r"(?<=[.!?])\s+", hit.chunk.text) if sentence.strip()]
        selected = [sentence for sentence in sentences if any(label in sentence for label in labels)]
        if not selected:
            return None

        preface = sentences[0] if sentences else ""
        ordered = [preface] + [sentence for sentence in selected if sentence != preface]
        deduped = list(dict.fromkeys(ordered))
        return " ".join(deduped[:4])
