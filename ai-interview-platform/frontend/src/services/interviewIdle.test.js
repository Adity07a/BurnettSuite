import test from "node:test";
import assert from "node:assert/strict";
import { createInterviewIdle } from "./interviewIdle.js";
import { voiceFailureMessage } from "./interviewAudio.js";

function fixture() {
  let callback = null;
  const calls = [];
  const guard = createInterviewIdle({ repeat: (n) => calls.push(`repeat-${n}`), next: () => calls.push("next"),
    schedule: (fn, ms) => { assert.equal(ms, 3000); callback = fn; return 1; }, cancel: () => { callback = null; } });
  return { guard, calls, tick() { const fn = callback; callback = null; fn?.(); } };
}

test("no speech: two additional readings then change, each after 3 seconds", () => {
  const { guard, calls, tick } = fixture();
  for (let i = 0; i < 3; i++) { guard.listen(); tick(); }
  assert.deepEqual(calls, ["repeat-1", "repeat-2", "next"]);
});
test("speech onset cancels repeats and advancing even before transcript arrives", () => {
  const { guard, calls, tick } = fixture();
  guard.listen(); guard.speechStarted(); tick(); guard.listen(); tick();
  assert.deepEqual(calls, []);
});
test("pause cancels old question timer and reset grants a new two-repeat budget", () => {
  const { guard, calls, tick } = fixture();
  guard.listen(); tick(); guard.listen(); guard.pause(); tick();
  guard.reset(); guard.listen(); tick();
  assert.deepEqual(calls, ["repeat-1", "repeat-1"]);
});
test("recognition restarts do not reset an existing countdown", () => {
  let schedules = 0;
  const guard = createInterviewIdle({ repeat() {}, next() {}, schedule: () => ++schedules, cancel() {} });
  guard.listen(); guard.listen(); assert.equal(schedules, 1);
});
test("autoplay block differs from missing server dependencies and missing endpoint", async () => {
  assert.match(await voiceFailureMessage({ name: "NotAllowedError" }), /browser blocked automatic audio/);
  assert.match(await voiceFailureMessage({ response: { status: 503, data: new Blob([JSON.stringify({ code: "voice_dependency_missing" })]) } }), /missing speech dependencies/);
  assert.match(await voiceFailureMessage({ response: { status: 404 } }), /endpoint was not found/);
  assert.match(await voiceFailureMessage({ response: { status: 504, data: { code: "voice_timeout" } } }), /timed out/);
});
