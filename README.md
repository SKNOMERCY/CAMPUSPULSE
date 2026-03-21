# CampusPulse

Smart campus events feed with student, organiser, and admin views.

## AI Campus Assistant Backend
This repo now includes a production-style FastAPI RAG backend in `backend/` that answers campus questions from structured JSON data using FAISS retrieval and an OpenAI-powered response step.

### Backend Structure
- `backend/main.py` - FastAPI app and API endpoints
- `backend/rag_pipeline.py` - Retrieval, prompt building, and answer generation
- `backend/embeddings.py` - OpenAI embeddings with sentence-transformers fallback
- `backend/retriever.py` - FAISS index build, persistence, and top-k search
- `backend/memory.py` - Session-based chat memory
- `backend/data_loader.py` - JSON loading and chunk creation
- `backend/data/` - Sample `clubs.json`, `events.json`, `placements.json`, and `faqs.json`

### Local Run
1. Create and activate a Python virtual environment.
2. Install dependencies with `pip install -r backend/requirements.txt`
3. Copy `backend/.env.example` to `backend/.env` and set `OPENAI_API_KEY`
4. Start the API with `uvicorn backend.main:app --reload`
5. Open `http://127.0.0.1:8000/docs` for Swagger UI

### API Endpoints
- `POST /init` builds or reloads the FAISS index
- `POST /query` accepts `query`, `session_id`, and optional `top_k`
- `GET /health` returns readiness and configuration details

### Example Requests
Initialize the knowledge base:

```bash
curl -X POST http://127.0.0.1:8000/init ^
  -H "Content-Type: application/json" ^
  -d "{\"rebuild\": true}"
```

Ask a question:

```bash
curl -X POST http://127.0.0.1:8000/query ^
  -H "Content-Type: application/json" ^
  -d "{\"session_id\":\"demo-session\",\"query\":\"When does Hack the Campus 2026 happen?\"}"
```

Example response:

```json
{
  "answer": "Hack the Campus 2026 takes place on 2026-04-12 from 9:00 AM to 9:00 PM in Central Innovation Hall.",
  "sources": [
    "events.json - Hack the Campus 2026"
  ]
}
```

### Sample JSON Shape
The backend expects record-oriented JSON. The bundled sample files show the intended format:

```json
{
  "events": [
    {
      "title": "Hack the Campus 2026",
      "event_type": "Hackathon",
      "date": "2026-04-12",
      "time": "9:00 AM to 9:00 PM",
      "location": "Central Innovation Hall",
      "description": "One-day campus hackathon.",
      "registration_deadline": "2026-04-08"
    }
  ]
}
```

## GitHub Pages
This repo is set up for GitHub Pages using the docs/ folder at the repository root.

1. In GitHub: Settings ? Pages
2. Source: **Deploy from a branch**
3. Branch: main and folder: /docs
4. Save and wait for the site to publish

## Local Run
Open docs/index.html or campuspulse/frontend/index.html in a browser.

