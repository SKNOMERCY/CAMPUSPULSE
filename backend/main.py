from __future__ import annotations

import os
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from .rag_pipeline import CampusRAGPipeline


BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
STORAGE_DIR = BASE_DIR / "storage"


load_dotenv(BASE_DIR / ".env")

app = FastAPI(title="Campus Assistant RAG API", version="1.0.0")

allow_origins = [origin.strip() for origin in os.getenv("ALLOW_ORIGINS", "*").split(",") if origin.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=allow_origins != ["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

pipeline = CampusRAGPipeline(data_dir=DATA_DIR, storage_dir=STORAGE_DIR)


class InitRequest(BaseModel):
    rebuild: bool = Field(default=False, description="Force a full reload and re-embedding run.")


class InitResponse(BaseModel):
    status: str
    provider: str | None
    embedding_model: str | None
    chunks_indexed: int
    index_path: str


class QueryRequest(BaseModel):
    query: str = Field(..., min_length=1, description="Natural language campus question.")
    session_id: str = Field(..., min_length=1, description="Client-controlled session identifier.")
    top_k: int = Field(default=4, ge=1, le=5, description="Number of retrieved chunks to use.")


class QueryResponse(BaseModel):
    answer: str
    sources: list[str]


@app.get("/health")
def health() -> dict[str, object]:
    return pipeline.health()


@app.post("/init", response_model=InitResponse)
def initialize_index(request: InitRequest) -> InitResponse:
    try:
        result = pipeline.initialize(force_rebuild=request.rebuild)
        return InitResponse(**result)
    except (FileNotFoundError, ValueError) as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.post("/query", response_model=QueryResponse)
def query_knowledge_base(request: QueryRequest) -> QueryResponse:
    try:
        result = pipeline.query(
            session_id=request.session_id,
            user_query=request.query,
            top_k=request.top_k,
        )
        return QueryResponse(**result)
    except (FileNotFoundError, ValueError) as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
