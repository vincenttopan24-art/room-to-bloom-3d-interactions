# State and timing contract

`src/core/study.js` exports `initialState`, pure `reducer(state, action, limits?)`, `remainingMs(timer, now?)`, `formatDuration(ms)`, `angleFromPoint(x,y)`, `angleToValue(angle,steps)`, `calendarMonth(date)`, `recommend(task)`, `defaultLimits`, and `normalizeLimits(limits)`.

`StudyProvider` owns React state, local storage, and a 250 ms interval while the timer runs. It exports `useStudy()` → `{state,dispatch,limits,storageError}`, `useStudyState()` → state, and `useStudyActions()` → dispatch. Hooks must be under the provider. Action-only consumers use a separate context so timer ticks do not change their context value.

```jsx
<StudyProvider
  storageKey="room-to-bloom-v1"
  limits={{ maxHours: 12, maxMinutes: 59, minStudyMs: 60000 }}
  onStateChange={state => host.saveState(state)}
  onPaperCrumpled={(paper, state) => host.onPaperCrumpled(paper.taskId)}
>
  <Room />
</StudyProvider>
```

Optional props: `initial` is a partial initial override, `storage` is a `{getItem,setItem}` object (defaults to localStorage; `null` disables storage). Initial overrides and restored snapshots are validated together once on mount; change storage keys by remounting the provider. `onStateChange(state)` runs after state changes, including initial mount. `onPaperCrumpled(paper,state)` runs when a paper transitions into `crumpled`; it does not run simply because a saved crumpled paper is restored. A missed throw also transitions back into `crumpled`.

## Shape

```js
{
  active: null, room: 'library', lighting: 0.5,
  mainTask: '', tasks: [], papers: [],
  timer: {
    phase: 'study', status: 'idle', studyMs: 1500000,
    breakMs: 300000, remainingMs: 1500000, endsAt: null
  },
  audio: { track: 0, status: 'stopped' },
  book: { open: false, page: 0, turn: 0 }
}
```

Task shape: `{id:string,text:string,completed:boolean}`. Paper shape: `{taskId:string,status:'ready'|'crumpled'|'throwing'|'binned',completedAt:number}`. `completedAt` is an epoch timestamp in milliseconds. IDs are supplied by the host and must be unique. Unknown actions return the existing state.

## Actions

Payload fields are at the action root: `{type:'LIGHT', value:0.8}`.

| Type | Payload | Result |
| --- | --- | --- |
| `FOCUS`, `CLOSE` | `id` for focus | Sets one active object or clears focus |
| `ROOM`, `LIGHT` | `id`, `value` respectively | Validates room; clamps light 0–1 |
| `MAIN_TASK` | `text` | Sets main notebook task |
| `ADD_TASK` | `id,text` | Trims text; ignores empty/duplicate ID; selects new task page and increments `book.turn` |
| `EDIT_TASK` | `id,text` | Updates nonempty trimmed text |
| `DELETE_TASK` | `id` | Removes task and clamps selected page; retains its paper history |
| `COMPLETE_TASK` | `id,now?` | Toggles completion and creates one ready paper per task ID |
| `CRUMPLE`, `THROW_PAPER`, `BIN_PAPER`, `MISS_PAPER` | `id` (task ID) | Sets corresponding paper status; miss returns crumpled; binned is final |
| `BOOK_OPEN` | `open` | Sets cover state |
| `BOOK_PAGE` | `page` | Clamps page 0–task count; increments `book.turn` animation key |
| `TIMER_SET` | `studyMs?,breakMs?` | Validates durations, stops timer, resets remaining phase duration |
| `TIMER_START`, `TIMER_PAUSE`, `TIMER_BREAK`, `TICK` | `now?` | Timestamp in milliseconds; defaults to Date.now() |
| `TIMER_RESET` | none | Returns to idle study phase at study duration |
| `AUDIO` | `track?,status?,error?` | Validates track 0–6; status playing/paused/stopped/loading/error; error stored for error status |
| `APPLY_RECOMMENDATION` | `recommendation` | Applies room, light, and sound selection without auto-playing |

Undoing completion removes that task's paper only if it has not reached the bin. A binned paper remains historical even when the task is undone or deleted. Re-completing a task whose paper is binned reuses that one historical record; it never adds duplicate paper for the same task ID. A deleted completed task leaves its paper available to finish the throw.

## Timer

`endsAt` is authoritative while running. Each tick computes `max(0,endsAt-now)` rather than subtracting a fixed tick amount. Pausing saves the actual remaining duration and clears `endsAt`; resuming sets a fresh deadline. This avoids accumulated timer drift and survives suspended tabs or reloads.

Finishing study moves to `phase:'break', status:'idle'` with the full break duration. Finishing break moves to idle study. `finishedPhase` records which phase ended. There is no automatic next session. `TIMER_BREAK` explicitly starts a fresh break; `TIMER_START` starts/resumes the currently selected phase. Steam should be visible only for `phase==='break' && status==='running'`, with the component handling fade-out.

Default dials allow 0–12 hours and 0–59 minutes. The default study minimum is 60 seconds; the duration maximum is 12:59:00. `limits.maxStudyMs` can lower that maximum, while `maxHours`/`maxMinutes` also cap it. Breaks clamp to 1 second through the same maximum. Non-finite duration inputs retain the previous value. `formatDuration` uses HH:MM:SS and rounds up fractional seconds so the display does not hit zero before expiry.

## Persistence

Storage envelope: `{version:1,state}`. Unsupported versions, malformed JSON and malformed fields fall back safely. Tasks and papers are filtered, copied and deduplicated. Restored `throwing` papers return to `crumpled`, because an in-flight physics simulation cannot be restored. Focus is always cleared. Audio restores paused rather than triggering browser autoplay. An unexpired running timer resumes its wall-clock deadline; an expired deadline advances exactly once to the next idle phase. Storage access errors are exposed as `storageError` without preventing use of the app. Nothing is deleted from storage on read failure.

## Helpers

- `angleFromPoint(x,y)` takes screen coordinates relative to dial center (positive y downward), clockwise radians with zero up. `angleToValue` wraps and rounds to the nearest step, yielding 0..steps−1.
- `calendarMonth(date)` uses local calendar dates and Monday-first weeks. Returns `{year,month,label,days,daysInMonth}`, month is zero-based. `days` contains null padding or `{date,day,key,isToday}`; key is YYYY-MM-DD. Week rows always have seven cells.
- `recommend(task)` is deterministic, runs locally, and returns `{environment,sound,lighting,reason}`. Creative words choose colourful; rest chooses beach; study/reading/coding choose library; planning chooses café; fallback is garden. The room set is library, cafe, garden, beach, classroom, living, colourful, rooftop, park.
- Sound indexes: 0 Forest, 1 Rain, 2 Ocean, 3 Café, 4 Soft Instrumental, 5 Lo-Fi, 6 White Noise. Recommendation selects a track without starting playback.

Verification: `npx vitest run tests/study.test.js tests/provider.test.jsx` covers countdown pause/resume, reload and expiry, limits, malformed persistence, denied storage, idle updates, callback transitions, task history, dial angles, leap-month layout, deterministic suggestions, audio error state, and notebook page bounds.
