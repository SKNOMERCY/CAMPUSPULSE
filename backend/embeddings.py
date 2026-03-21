from __future__ import annotations

import hashlib
import os
import re
from typing import Iterable, Sequence

import numpy as np


class EmbeddingService:
    """Creates embeddings with OpenAI first and a local transformer fallback."""

    def __init__(
        self,
        provider: str | None = None,
        openai_model: str | None = None,
        sentence_model_name: str | None = None,
    ) -> None:
        self.provider = (provider or os.getenv("EMBEDDING_PROVIDER", "auto")).lower()
        self.openai_model = openai_model or os.getenv("OPENAI_EMBEDDING_MODEL", "text-embedding-3-small")
        self.sentence_model_name = sentence_model_name or os.getenv(
            "SENTENCE_TRANSFORMER_MODEL",
            "all-MiniLM-L6-v2",
        )
        self.hashing_dimensions = int(os.getenv("HASH_EMBEDDING_DIMENSIONS", "512"))
        self.model_name = ""
        self._dimension: int | None = None
        self._openai_client = None
        self._sentence_model = None
        self._configure_provider()

    def manifest(self) -> dict[str, str | int | None]:
        return {
            "provider": self.provider,
            "model": self.model_name,
            "dimension": self._dimension,
        }

    def embed_texts(self, texts: Sequence[str], batch_size: int = 32) -> np.ndarray:
        clean_texts = [text.strip() for text in texts if text and text.strip()]
        if not clean_texts:
            if self._dimension is None:
                raise ValueError("Cannot determine embedding dimension from an empty text batch.")
            return np.empty((0, self._dimension), dtype=np.float32)

        if self.provider == "openai":
            vectors = self._embed_with_openai(clean_texts, batch_size)
        elif self.provider == "sentence-transformers":
            vectors = self._embed_with_sentence_transformer(clean_texts, batch_size)
        else:
            vectors = self._embed_with_hashing(clean_texts)

        normalized = self._normalize(vectors)
        self._dimension = int(normalized.shape[1])
        return normalized

    def embed_query(self, query: str) -> np.ndarray:
        return self.embed_texts([query], batch_size=1)[0]

    def _configure_provider(self) -> None:
        api_key = os.getenv("OPENAI_API_KEY")
        requested_openai = self.provider in {"auto", "openai"}

        if self.provider == "hashing":
            self.model_name = f"hashing-{self.hashing_dimensions}"
            self._dimension = self.hashing_dimensions
            return

        # Prefer OpenAI embeddings when credentials are available.
        if requested_openai and api_key:
            from openai import OpenAI

            self.provider = "openai"
            self.model_name = self.openai_model
            self._openai_client = OpenAI(api_key=api_key)
            return

        if self.provider == "openai" and not api_key:
            raise RuntimeError("OPENAI_API_KEY is required when EMBEDDING_PROVIDER=openai.")

        # Fall back to a local sentence-transformers model for offline-style embedding generation.
        try:
            from sentence_transformers import SentenceTransformer

            self.provider = "sentence-transformers"
            self.model_name = self.sentence_model_name
            self._sentence_model = SentenceTransformer(self.sentence_model_name)
            return
        except Exception:
            # Final local fallback that requires no external downloads.
            self.provider = "hashing"
            self.model_name = f"hashing-{self.hashing_dimensions}"
            self._dimension = self.hashing_dimensions

    def _embed_with_openai(self, texts: Sequence[str], batch_size: int) -> np.ndarray:
        vectors: list[list[float]] = []
        for batch in self._batches(texts, batch_size):
            response = self._openai_client.embeddings.create(
                model=self.model_name,
                input=list(batch),
            )
            ordered = sorted(response.data, key=lambda item: item.index)
            vectors.extend(item.embedding for item in ordered)
        return np.asarray(vectors, dtype=np.float32)

    def _embed_with_sentence_transformer(self, texts: Sequence[str], batch_size: int) -> np.ndarray:
        encoded = self._sentence_model.encode(
            list(texts),
            batch_size=batch_size,
            convert_to_numpy=True,
            normalize_embeddings=True,
            show_progress_bar=False,
        )
        return np.asarray(encoded, dtype=np.float32)

    def _embed_with_hashing(self, texts: Sequence[str]) -> np.ndarray:
        vectors = np.zeros((len(texts), self.hashing_dimensions), dtype=np.float32)

        for row, text in enumerate(texts):
            tokens = re.findall(r"\b[a-zA-Z0-9]{2,}\b", text.lower())
            if not tokens:
                continue

            for token in tokens:
                digest = hashlib.sha256(token.encode("utf-8")).digest()
                bucket = int.from_bytes(digest[:4], "big") % self.hashing_dimensions
                sign = 1.0 if digest[4] % 2 == 0 else -1.0
                vectors[row, bucket] += sign

        return vectors

    def _normalize(self, vectors: np.ndarray) -> np.ndarray:
        norms = np.linalg.norm(vectors, axis=1, keepdims=True)
        norms[norms == 0] = 1.0
        return (vectors / norms).astype(np.float32)

    def _batches(self, texts: Sequence[str], batch_size: int) -> Iterable[Sequence[str]]:
        for start in range(0, len(texts), batch_size):
            yield texts[start : start + batch_size]
