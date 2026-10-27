export function selectInterviewVoice(voices = []) {
  const english = voices.filter((voice) => /^en(?:[-_]|$)/i.test(voice.lang || ""));
  const indian = english.filter((voice) => /^en[-_]IN$/i.test(voice.lang || ""));
  const natural = (voice) => /natural|neural|online|google/i.test(voice.name || "");
  return indian.find(natural) || indian[0] || english.find(natural) || english[0] || null;
}

export function configureInterviewVoice(utterance, voices) {
  const voice = selectInterviewVoice(voices);
  if (voice) utterance.voice = voice;
  utterance.lang = voice?.lang || "en-IN";
  utterance.rate = 0.92;
  utterance.pitch = 1;
  utterance.volume = 1;
  return utterance;
}
