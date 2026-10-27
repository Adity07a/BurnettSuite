import test from "node:test";
import assert from "node:assert/strict";
import { configureSpeech, speechErrorMessage, speechSuggestions } from "./assistantSpeech.js";

test("offers the reported LangChain correction without rewriting normal language questions", () => {
  assert.equal(speechSuggestions("what about language and")[0].text, "what about LangChain");
  assert.deepEqual(speechSuggestions("What programming language should I learn?"), []);
  assert.deepEqual(speechSuggestions("Tell me about LangChain"), []);
});

test("configures locale and supports browsers without vocabulary hints", () => {
  const recognition = {};
  configureSpeech(recognition, "en-IN", {});
  assert.equal(recognition.lang, "en-IN");
  assert.equal(recognition.maxAlternatives, 5);
});

test("adds technical vocabulary when contextual biasing is supported", () => {
  const recognition = { phrases: [] };
  configureSpeech(recognition, "en-US", { SpeechRecognitionPhrase: class { constructor(phrase, boost) { this.phrase = phrase; this.boost = boost; } } });
  assert.ok(recognition.phrases.some((item) => item.phrase === "LangChain"));
});

test("retry clears unsupported vocabulary hints", () => {
  const recognition = { phrases: ["LangChain"] };
  configureSpeech(recognition, "en-IN", { SpeechRecognitionPhrase: class {} }, false);
  assert.deepEqual(recognition.phrases, []);
});

test("reports network and microphone failures separately with their error codes", () => {
  assert.match(speechErrorMessage("network"), /speech recognition service/);
  assert.match(speechErrorMessage("audio-capture"), /microphone audio/);
  assert.match(speechErrorMessage("language-not-supported"), /Select another voice language/);
  assert.match(speechErrorMessage("unknown"), /Voice error: unknown/);
});
