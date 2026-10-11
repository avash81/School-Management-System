from fastapi import FastAPI

app = FastAPI(title="SchoolOS AI Service", version="0.1.0")


@app.get("/health")
def health() -> dict[str, object]:
    return {
        "success": True,
        "message": "AI service is healthy",
        "data": {
            "service": "ai-service",
            "status": "ok",
        },
        "meta": {},
    }
