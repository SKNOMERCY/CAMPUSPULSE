from __future__ import annotations

from collections import defaultdict, deque
from dataclasses import dataclass
from threading import Lock


@dataclass(slots=True)
class ConversationMessage:
    role: str
    content: str


class SessionMemoryStore:
    """Stores lightweight session history for follow-up questions."""

    def __init__(self, max_messages: int = 20) -> None:
        self.max_messages = max_messages
        self._lock = Lock()
        self._sessions: dict[str, deque[ConversationMessage]] = defaultdict(
            lambda: deque(maxlen=self.max_messages)
        )

    def add_message(self, session_id: str, role: str, content: str) -> None:
        with self._lock:
            self._sessions[session_id].append(ConversationMessage(role=role, content=content))

    def recent_messages(self, session_id: str, limit: int = 5) -> list[ConversationMessage]:
        with self._lock:
            session = self._sessions.get(session_id)
            if not session:
                return []
            return list(session)[-limit:]

    def add_exchange(self, session_id: str, user_message: str, assistant_message: str) -> None:
        with self._lock:
            self._sessions[session_id].append(ConversationMessage(role="user", content=user_message))
            self._sessions[session_id].append(ConversationMessage(role="assistant", content=assistant_message))
