export async function voiceFailureMessage(error) {
  if (error?.name === "NotAllowedError") return "Your browser blocked automatic audio. Tap Play question to allow Swara playback.";
  const status = error?.response?.status;
  if (status === 404) return "The speech endpoint was not found. The server may need the latest backend code.";
  if (status === 401 || status === 403) return "The speech request was not authorized. Please sign in again.";
  let data = error?.response?.data;
  if (typeof data?.text === "function") {
    try { data = JSON.parse(await data.text()); } catch { data = null; }
  }
  const messages = {
    voice_dependency_missing: "The server is missing speech dependencies. Install backend requirements and restart it.",
    voice_timeout: "The server timed out while generating Swara audio. Please retry playback.",
    voice_provider_error: "The server could not reach or use the Swara provider. Browser voice is being used.",
  };
  if (messages[data?.code]) return messages[data.code];
  if (status >= 500) return "The server could not generate Swara audio. Browser voice is being used.";
  if (error?.code === "ECONNABORTED") return "The speech request timed out. Check the server connection and retry.";
  if (!status && error?.name !== "NotSupportedError") return "The speech request or playback failed. Check your connection and retry audio.";
  return "Swara audio could not be played. Browser voice is being used.";
}
