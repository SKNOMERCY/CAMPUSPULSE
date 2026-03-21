from __future__ import annotations

import json
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Any


@dataclass(slots=True)
class DocumentChunk:
    """A single retrievable chunk with enough metadata for citations."""

    chunk_id: str
    text: str
    source_file: str
    section: str
    title: str

    def source_label(self) -> str:
        return f"{self.source_file} - {self.title}"


class CampusDataLoader:
    """Loads structured campus JSON and turns each record into readable chunks."""

    def __init__(self, data_dir: str | Path, max_chars: int = 900) -> None:
        self.data_dir = Path(data_dir)
        self.max_chars = max_chars

    def load_chunks(self) -> list[DocumentChunk]:
        if not self.data_dir.exists():
            raise FileNotFoundError(f"Data directory not found: {self.data_dir}")

        chunks: list[DocumentChunk] = []
        # Each JSON file becomes a set of human-readable records instead of raw dumps.
        for file_path in sorted(self.data_dir.glob("*.json")):
            payload = json.loads(file_path.read_text(encoding="utf-8"))
            chunks.extend(self._chunks_for_file(file_path.name, payload))

        if not chunks:
            raise ValueError(f"No JSON records found in {self.data_dir}")

        return chunks

    def _chunks_for_file(self, source_file: str, payload: Any) -> list[DocumentChunk]:
        file_name = source_file.lower()
        if file_name == "clubs.json":
            return self._record_chunks(source_file, payload, "clubs", self._club_text)
        if file_name == "events.json":
            return self._record_chunks(source_file, payload, "events", self._event_text)
        if file_name == "placements.json":
            return self._record_chunks(source_file, payload, "placements", self._placement_text)
        if file_name == "faqs.json":
            return self._record_chunks(source_file, payload, "faqs", self._faq_text)
        return self._record_chunks(source_file, payload, Path(source_file).stem, self._generic_text)

    def _record_chunks(
        self,
        source_file: str,
        payload: Any,
        section: str,
        formatter: Any,
    ) -> list[DocumentChunk]:
        records = self._extract_records(payload, section)
        chunks: list[DocumentChunk] = []

        for record_index, record in enumerate(records, start=1):
            title, text = formatter(record, record_index)
            # Split long records so retrieval stays focused and fast.
            for part_index, chunk_text in enumerate(self._split_text(text), start=1):
                chunk_title = title if part_index == 1 else f"{title} (Part {part_index})"
                chunk_id = f"{Path(source_file).stem}-{record_index}-{part_index}"
                chunks.append(
                    DocumentChunk(
                        chunk_id=chunk_id,
                        text=chunk_text,
                        source_file=source_file,
                        section=section,
                        title=chunk_title,
                    )
                )

        return chunks

    def _extract_records(self, payload: Any, preferred_key: str) -> list[dict[str, Any]]:
        if isinstance(payload, list):
            return [item for item in payload if isinstance(item, dict)]

        if isinstance(payload, dict):
            candidate = payload.get(preferred_key)
            if isinstance(candidate, list):
                return [item for item in candidate if isinstance(item, dict)]

            for value in payload.values():
                if isinstance(value, list):
                    return [item for item in value if isinstance(item, dict)]

        raise ValueError(f"Unsupported JSON shape for section '{preferred_key}'")

    def _club_text(self, item: dict[str, Any], record_index: int) -> tuple[str, str]:
        title = self._pick(item, "name", "title") or f"Club {record_index}"
        lines = [f"{title} is a campus club."]
        self._append_line(lines, "Focus area", self._pick(item, "focus_area", "focus", "domain"))
        self._append_line(lines, "Overview", self._pick(item, "description", "summary"))
        self._append_line(lines, "Meeting schedule", self._pick(item, "meeting_schedule", "schedule"))
        self._append_line(lines, "Venue", self._pick(item, "location", "venue"))
        self._append_line(lines, "Faculty coordinator", self._pick(item, "faculty_coordinator"))
        self._append_line(lines, "Student leads", self._pick(item, "student_leads"))
        self._append_line(lines, "Membership", self._pick(item, "membership", "eligibility"))
        self._append_line(lines, "Recent activities", self._pick(item, "recent_activities", "highlights"))
        self._append_line(lines, "Contact", self._pick(item, "contact_email", "contact"))
        return title, " ".join(lines)

    def _event_text(self, item: dict[str, Any], record_index: int) -> tuple[str, str]:
        title = self._pick(item, "title", "name") or f"Event {record_index}"
        lines = [f"{title} is a campus event."]
        self._append_line(lines, "Event type", self._pick(item, "event_type", "type"))
        self._append_line(lines, "Organizer", self._pick(item, "organizer", "host"))
        self._append_line(lines, "Date", self._pick(item, "date"))
        self._append_line(lines, "Time", self._pick(item, "time"))
        self._append_line(lines, "Venue", self._pick(item, "location", "venue"))
        self._append_line(lines, "Audience", self._pick(item, "audience", "eligibility"))
        self._append_line(lines, "Details", self._pick(item, "description", "summary"))
        self._append_line(lines, "Agenda", self._pick(item, "agenda"))
        self._append_line(lines, "Registration deadline", self._pick(item, "registration_deadline"))
        self._append_line(lines, "Tags", self._pick(item, "tags", "domains"))
        return title, " ".join(lines)

    def _placement_text(self, item: dict[str, Any], record_index: int) -> tuple[str, str]:
        company = self._pick(item, "company") or f"Company {record_index}"
        role = self._pick(item, "role", "title")
        title = f"{company} - {role}" if role else company
        lines = [f"{title} is a placement opportunity or placement update."]
        self._append_line(lines, "Package", self._pick(item, "package_lpa", "package"))
        self._append_line(lines, "Eligibility", self._pick(item, "eligibility"))
        self._append_line(lines, "Hiring timeline", self._pick(item, "timeline", "drive_date"))
        self._append_line(lines, "Required skills", self._pick(item, "required_skills", "skills"))
        self._append_line(lines, "Selection rounds", self._pick(item, "selection_rounds", "rounds"))
        self._append_line(lines, "Statistics", self._pick(item, "statistics", "stats"))
        self._append_line(lines, "Preparation tips", self._pick(item, "tips", "advice"))
        self._append_line(lines, "Notes", self._pick(item, "description", "summary"))
        return title, " ".join(lines)

    def _faq_text(self, item: dict[str, Any], record_index: int) -> tuple[str, str]:
        question = self._pick(item, "question", "title") or f"FAQ {record_index}"
        lines = [f"FAQ question: {question}"]
        self._append_line(lines, "Category", self._pick(item, "category", "section"))
        self._append_line(lines, "Answer", self._pick(item, "answer", "response"))
        self._append_line(lines, "Contact", self._pick(item, "contact", "owner"))
        return question, " ".join(lines)

    def _generic_text(self, item: dict[str, Any], record_index: int) -> tuple[str, str]:
        title = self._pick(item, "title", "name", "question") or f"Record {record_index}"
        fragments = []
        for key, value in item.items():
            fragments.append(f"{self._humanize_key(key)}: {self._format_value(value)}")
        return title, f"{title}. " + " ".join(fragments)

    def _split_text(self, text: str) -> list[str]:
        if len(text) <= self.max_chars:
            return [text]

        sentences = [segment.strip() for segment in re.split(r"(?<=[.!?])\s+", text) if segment.strip()]
        chunks: list[str] = []
        current: list[str] = []
        current_length = 0

        for sentence in sentences:
            sentence_length = len(sentence) + 1
            if current and current_length + sentence_length > self.max_chars:
                chunks.append(" ".join(current))
                current = current[-1:]
                current_length = sum(len(part) + 1 for part in current)

            current.append(sentence)
            current_length += sentence_length

        if current:
            chunks.append(" ".join(current))

        return chunks

    def _append_line(self, lines: list[str], label: str, value: Any) -> None:
        if value in (None, "", [], {}):
            return
        text = self._format_value(value)
        lines.append(f"{label}: {text}.")

    def _format_value(self, value: Any) -> str:
        if isinstance(value, dict):
            return "; ".join(f"{self._humanize_key(key)}: {self._format_value(item)}" for key, item in value.items())
        if isinstance(value, list):
            return "; ".join(self._format_value(item) for item in value)
        return str(value).strip()

    def _pick(self, item: dict[str, Any], *keys: str) -> Any:
        for key in keys:
            if key in item and item[key] not in (None, "", [], {}):
                return item[key]
        return None

    def _humanize_key(self, value: str) -> str:
        return value.replace("_", " ").strip().capitalize()
