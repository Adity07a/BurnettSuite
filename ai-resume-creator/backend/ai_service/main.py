
import hmac
import os

from dotenv import load_dotenv
from fastapi import Depends, Header, HTTPException
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.parse_resume import (
    router as parse_resume_router,
)
from app.api.routes.parse_job import (
    router as parse_job_router,
)
from app.api.routes.generate_resume import (
    router as generate_resume_router,
)
from app.api.routes.improve_section import (
    router as improve_section_router,
)
from app.api.routes.generate_summary import (
    router as generate_summary_router,
)
from app.api.routes.optimize_resume import (
    router as optimize_resume_router,
)
from app.core.ai_settings import AISettings

load_dotenv()

app = FastAPI(
    title="AI Resume Creator - AI Service",
    description=(
        "AI and document-processing service for the AI Resume Creator."
    ),
    version="1.0.0",
)


async def verify_internal_service_token(
    x_internal_service_token: str | None = Header(default=None),
) -> None:
    expected_token = os.getenv(
        "AI_SERVICE_SHARED_TOKEN",
        "",
    ).strip()

    if not expected_token:
        raise HTTPException(
            status_code=503,
            detail="Internal service authentication is not configured.",
        )

    if (
        not x_internal_service_token
        or not hmac.compare_digest(
            x_internal_service_token,
            expected_token,
        )
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid internal service credentials.",
        )


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(
    parse_resume_router,
    prefix="/api/v1/ai",
    tags=["Resume Parsing"],
    dependencies=[Depends(verify_internal_service_token)],
)

app.include_router(
    parse_job_router,
    prefix="/api/v1/ai",
    tags=["Job Description Parsing"],
    dependencies=[Depends(verify_internal_service_token)],
)

app.include_router(
    generate_resume_router,
    prefix="/api/v1/ai",
    tags=["Resume Generation"],
    dependencies=[Depends(verify_internal_service_token)],
)

app.include_router(
    improve_section_router,
    prefix="/api/v1/ai",
    tags=["Resume Editing"],
    dependencies=[Depends(verify_internal_service_token)],
)

app.include_router(
    generate_summary_router,
    prefix="/api/v1/ai",
    tags=["Resume Generation"],
    dependencies=[Depends(verify_internal_service_token)],
)

app.include_router(
    optimize_resume_router,
    prefix="/api/v1/ai",
    tags=["ATS Optimization"],
    dependencies=[Depends(verify_internal_service_token)],
)


@app.get("/")
def root():
    return {
        "message": "AI Resume Creator AI Service is running"
    }


@app.get("/health")
def health_check():
    settings = AISettings.from_environment()
    return {
        "status": "healthy",
        "provider": settings.provider,
        "model": settings.model,
    }
