
from fastapi import APIRouter, File, HTTPException, UploadFile

from app.schemas.resume import ResumeParseResult
from app.services.resume_parser import (
    extract_resume_text,
    extract_contact_details,
    extract_document_links,
    extract_skills,
    extract_job_title,
    separate_education_and_certifications,
)
from app.services.llm_service import generate_json

router = APIRouter()

MAX_UPLOAD_SIZE = 10 * 1024 * 1024  # 10 MB


@router.post(
    "/parse-resume",
    response_model=ResumeParseResult,
)
async def parse_resume(file: UploadFile = File(...)):
    filename = file.filename or ""

    try:
        file_bytes = await file.read(MAX_UPLOAD_SIZE + 1)

        if not file_bytes:
            raise HTTPException(
                status_code=400,
                detail="The uploaded file is empty.",
            )

        if len(file_bytes) > MAX_UPLOAD_SIZE:
            raise HTTPException(
                status_code=413,
                detail="File size exceeds the 10 MB limit.",
            )

        try:
            resume_text = extract_resume_text(filename, file_bytes)
            contact_details = extract_contact_details(resume_text)
            document_links = extract_document_links(filename, file_bytes)
        except ValueError as exc:
            raise HTTPException(
                status_code=400,
                detail=str(exc),
            ) from exc

    finally:
        await file.close()

    prompt = f"""
Extract all available information from the supplied resume.

IMPORTANT RULES:
- Read the entire resume carefully, including the header and contact section.
- Extract the person's actual full name from the resume header.
- Extract every email address, phone number, and profile URL that is present.
- Populate skills with all explicitly listed technical and soft skills.
- Include every work experience entry and preserve its actual job title.
- Include project descriptions and their listed technologies.
- Separate formal education from courses, training, and certifications.
- Extract certifications, achievements, languages, and links when present.
- Do not leave a field empty if the information is clearly present.
- Do not invent or assume any information.
- If a detail is genuinely absent, use an empty string or empty list.
- A label such as "GitHub" or "LinkedIn" is not itself a URL.
- Return JSON matching the required schema.

RESUME TEXT:
<resume_text>
{resume_text}
</resume_text>
"""


    try:
        generated = await generate_json(
            prompt,
            system_prompt=(
                "You extract structured resume information. Return only valid JSON "
                "matching the requested schema. Do not add facts that are not "
                "present in the supplied resume."
            ),
            temperature=0,
            json_schema=ResumeParseResult.model_json_schema(),
        )
        result = ResumeParseResult.model_validate(generated)

        result.education, result.certifications = (
            separate_education_and_certifications(
                result.education,
                result.certifications,
            )
        )

        if not result.skills:
            result.skills = extract_skills(resume_text)

        # Recover the job title if it is missing.
        for experience in result.experience:
            if not experience.job_title:
                title = extract_job_title(resume_text)

                if title:
                    experience.job_title = title

        # Merge contact details extracted directly from the resume text.
        for field in ("email", "phone", "linkedin", "github", "portfolio"):
            extracted_value = contact_details.get(field, "").strip()

            if extracted_value:
                setattr(result.personal_info, field, extracted_value)

        # Merge actual hyperlink destinations embedded in the document.
        for url in document_links:
            normalized_url = url.lower()

            if "linkedin.com/" in normalized_url:
                result.personal_info.linkedin = url
            elif "github.com/" in normalized_url:
                result.personal_info.github = url
            elif not result.personal_info.portfolio:
                result.personal_info.portfolio = url

        # Do not return display labels such as "Github" or "Linkedin"
        # as though they were actual URLs.
        if result.personal_info.github.lower() in ("github", "git hub"):
            result.personal_info.github = ""

        if result.personal_info.linkedin.lower() == "linkedin":
            result.personal_info.linkedin = ""

        return result

    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc

    except (ValueError, KeyError) as exc:
        raise HTTPException(
            status_code=502,
            detail="The AI provider returned an invalid or unexpected response.",
        ) from exc
