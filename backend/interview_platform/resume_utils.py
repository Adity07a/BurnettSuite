import pymupdf
from docx import Document


def extract_text_from_pdf(file):
    text = ""

    pdf_document = pymupdf.open(stream=file.read(), filetype="pdf")

    for page in pdf_document:
        text += page.get_text()

    pdf_document.close()

    return text


def extract_text_from_docx(file):
    document = Document(file)

    text = ""

    for paragraph in document.paragraphs:
        text += paragraph.text + "\n"

    return text


def extract_text_from_resume(file):
    filename = file.name.lower()

    if filename.endswith(".pdf"):
        return extract_text_from_pdf(file)

    elif filename.endswith(".docx"):
        return extract_text_from_docx(file)

    return ""