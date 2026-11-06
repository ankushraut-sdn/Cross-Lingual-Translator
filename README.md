# Cross-Lingual-Translator

## 1. Project Overview

A translation service: a FastAPI backend exposes a translation endpoint, and a React + Vite frontend provides a dashboard to try it.

**Known limitation:** the current `TranslationService` implementation (`backend/app/services/translate_cross_lingual.py`) is a dictionary-based demo — it matches a small set of pre-defined sentences and words against Spanish, French, German, and Hindi, and falls back to a placeholder for anything unrecognized. It does not yet call a real translation model (e.g. NLLB-200/MarianMT).

## 2. Core Features

- FastAPI backend with a versioned API (`app/api/v1`) and a translation service layer
- React 18 + Vite single-page frontend dashboard
- Backend serves the built frontend as static files when `frontend/dist` exists, so the whole app runs as one process
- `mcp_server.py`: a stdio JSON-RPC Model Context Protocol server exposing a `translate_cross_lingual` tool so AI agents/clients can call the service directly
- Multi-stage Dockerfile (Node build stage + Python runtime stage) for a single deployable image

## 3. Tech Stack

| Component | Technology |
|---|---|
| Backend | FastAPI, Uvicorn, Pydantic |
| Frontend | React 18, Vite |
| Packaging | Docker (multi-stage: `node:18-alpine` build + `python:3.10-slim` runtime) |

## 4. Project Structure

```
Cross-Lingual-Translator/
├── frontend/           # React 18 + Vite client
│   ├── src/App.jsx
│   └── vite.config.js
├── backend/
│   ├── app/
│   │   ├── core/       # configuration
│   │   ├── api/v1/     # routes
│   │   └── services/   # translation logic
│   ├── mcp_server.py   # MCP stdio server
│   ├── app.py          # entrypoint used by the Docker image
│   └── requirements.txt
├── Dockerfile
└── .dockerignore
```

## 5. Prerequisites

- Python 3.10+
- Node.js 18+ (for frontend dev/build)
- Docker (optional, for the packaged image)

## 6. How to Run

### Local development

```bash
cd backend
pip install -r requirements.txt
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

In a separate terminal, for frontend dev with hot reload:

```bash
cd frontend
npm install
npm run dev
```

### Docker

```bash
docker build -t cross-lingual-translator .
docker run -p 8000:8000 cross-lingual-translator
```

Then open `http://localhost:8000`.

## 7. API Documentation

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/run` | Accepts source text (and language parameters) and returns the dictionary-matched translation. |
| GET | `/` | Serves the built frontend, when present. |

## 8. Environment Variables

None required — no external API keys or configurable settings are used by the translation logic.

## 9. Known Limitations

- Translation is a small hardcoded dictionary lookup, not a real neural translation model.
- No automated tests currently exist in the repository (`backend/test/` is present but empty).

## License

No LICENSE file is present in this repository.
