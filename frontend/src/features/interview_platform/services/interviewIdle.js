// One initial reading, at most two additional readings, then skip.
export function createInterviewIdle({ repeat, next, schedule = setTimeout, cancel = clearTimeout }) {
  let timer = null;
  let repeats = 0;
  let started = false;
  const pause = () => { if (timer !== null) cancel(timer); timer = null; };
  return {
    reset() { pause(); repeats = 0; started = false; },
    pause,
    speechStarted() { started = true; pause(); },
    listen() {
      if (started || timer !== null) return;
      timer = schedule(() => {
        timer = null;
        if (started) return;
        if (repeats < 2) { repeats += 1; repeat(repeats); }
        else next();
      }, 3000);
    },
  };
}
