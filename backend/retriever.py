from __future__ import annotations

import json
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Sequence

import faiss
import numpy as np

from .data_loader import DocumentChunk
from .embeddings import EmbeddingService


@dataclass(slots=True)
class RetrievedChunk:
    chunk: DocumentChunk
    score: float


class FaissRetriever:
    """Handles FAISS indexing, persistence, and similarity search."""

    def __init__(self, embedder: EmbeddingService, storage_dir: str | Path) -> None:
        self.embedder = embedder
        self.storage_dir = Path(storage_dir)
        self.index_path = self.storage_dir / "campus.index"
        self.metadata_path = self.storage_dir / "chunks.json"
        self.index: faiss.Index | None = None
        self.chunks: list[DocumentChunk] = []
        self.embedding_manifest: dict[str, str | int | None] = {}

    @property
    def is_ready(self) -> bool:
        return self.index is not None and bool(self.chunks)

    def build(self, chunks: Sequence[DocumentChunk]) -> dict[str, str | int | None]:
        texts = [chunk.text for chunk in chunks]
        vectors = self.embedder.embed_texts(texts)

        # The vectors are normalized, so inner product behaves like cosine similarity.
        index = faiss.IndexFlatIP(vectors.shape[1])
        index.add(vectors)

        self.index = index
        self.chunks = list(chunks)
        self.embedding_manifest = self.embedder.manifest()
        self.embedding_manifest["dimension"] = vectors.shape[1]
        self._persist()
        return self.embedding_manifest

    def load(self) -> bool:
        if not self.index_path.exists() or not self.metadata_path.exists():
            return False

        self.index = faiss.read_index(str(self.index_path))
        payload = json.loads(self.metadata_path.read_text(encoding="utf-8"))
        self.embedding_manifest = payload.get("embedding", {})
        self.chunks = [DocumentChunk(**item) for item in payload.get("chunks", [])]
        return self.is_ready

    def clear(self) -> None:
        self.index = None
        self.chunks = []
        self.embedding_manifest = {}

    def is_compatible(self) -> bool:
        current = self.embedder.manifest()
        return (
            self.embedding_manifest.get("provider") == current.get("provider")
            and self.embedding_manifest.get("model") == current.get("model")
        )

    def retrieve(self, query: str, top_k: int = 4, min_score: float = 0.12) -> list[RetrievedChunk]:
        if not self.is_ready:
            raise RuntimeError("Retriever is not initialized.")

        query_vector = self.embedder.embed_query(query).astype(np.float32).reshape(1, -1)
        scores, indices = self.index.search(query_vector, min(top_k, len(self.chunks)))

        hits: list[RetrievedChunk] = []
        for score, index in zip(scores[0], indices[0], strict=False):
            if index < 0:
                continue
            if float(score) >= min_score:
                hits.append(RetrievedChunk(chunk=self.chunks[int(index)], score=float(score)))

        if hits:
            return hits

        # Keep one weak match so the API can still show what was considered.
        first_index = int(indices[0][0])
        if first_index >= 0:
            return [RetrievedChunk(chunk=self.chunks[first_index], score=float(scores[0][0]))]

        return []

    def _persist(self) -> None:
        self.storage_dir.mkdir(parents=True, exist_ok=True)
        faiss.write_index(self.index, str(self.index_path))
        # Persist chunk metadata alongside the FAISS file so citations survive restarts.
        payload = {
            "embedding": self.embedding_manifest,
            "chunks": [asdict(chunk) for chunk in self.chunks],
        }
        self.metadata_path.write_text(json.dumps(payload, indent=2), encoding="utf-8")
