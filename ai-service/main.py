from typing import Optional
from fastapi import FastAPI, File, Form, UploadFile
from fastapi.concurrency import run_in_threadpool
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from insightface_engine import InsightFaceEngine

app = FastAPI(title="LangitLens — InsightFace ArcFace 512-D Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

engine: Optional[InsightFaceEngine] = None


@app.on_event("startup")
def startup_event():
    global engine
    engine = InsightFaceEngine()


@app.get("/health")
def health():
    return {
        "status": "ok",
        "engine": "insightface-buffalo_l-arcface-512d",
        "ready": engine is not None,
    }


@app.post("/detect")
async def detect_faces(
    file: UploadFile = File(...),
    mirror_horizontal: bool = Form(False),
    include_snapshot: bool = Form(False),
    include_thumbs: bool = Form(True),
):
    assert engine is not None, "InsightFace engine is not initialized"
    image_bytes = await file.read()
    return await run_in_threadpool(
        engine.analyze_bytes,
        image_bytes,
        mirror_horizontal,
        include_snapshot,
        include_thumbs,
    )


if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8001, workers=1)
