import hashlib
import io
import logging

from django.core.cache import cache
from gtts import gTTS

logger = logging.getLogger(__name__)


def question_audio(text):
    text = (text or "").strip()
    if not text:
        raise ValueError("No text provided for audio synthesis")

    key = "interview-speech-gtts:" + hashlib.sha256(text.encode("utf-8")).hexdigest()
    audio = cache.get(key)
    if audio is not None:
        return audio

    try:
        buffer = io.BytesIO()
        tts = gTTS(text=text, lang="en", tld="co.in", slow=False)
        tts.write_to_fp(buffer)
        buffer.seek(0)
        audio = buffer.read()

        if not audio:
            raise ValueError("Empty audio payload received from gTTS")

        cache.set(key, audio, timeout=3600)
        return audio
    except Exception as error:
        logger.error("gTTS synthesis failed: %s", str(error))
        raise