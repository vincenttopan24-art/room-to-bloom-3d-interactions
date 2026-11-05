# ROOM TO BLOOM implementation plan

Goal: modular JSX interaction package and independently testable demo, delivered as ZIP for Manus. Spec: user attachment and INSPECTION-ID.md. Latest authorization: finish brief without further approval.

Architecture: original GLB scene clones plus calibrated pivots and procedural page/steam/paper geometry. Shared React provider owns persistent timer/tasks/room/audio state. A camera controller and one active object enforce the interaction lifecycle. Host adapters expose callbacks and retain existing tearing/crumpling behavior.

Constraints: preserve models/materials; no rebuild of published website; only disc rotates; long clock hand=hours; short=minutes; one subtask/page and one paper/completed task. No paid service or public deployment required.

- [x] State/timer: failing tests for timestamp countdown, pauses, custom limits, persistence, leap calendar, deterministic recommendations, task-paper identity; implement study.js + StudyProvider.jsx; rerun tests.
- [x] Audio/lighting: failing tests for play rejection/races/cleanup and image pair selection; implement AudioController and RoomBackdrop; generate original CC0 synthetic audio; visually examine pairs.
- [x] Models/rigs: tests load actual GLBs, verify pivot preservation, select real disc/cover/hands, deform page, detect swept bin collision. Implement rigs/math. Keep metadata report.
- [x] Object components: tests for steam fade, page deformation and controller actions; implement clock, tea, TV screen, notebook, CD, calendar, lamp and bin. Each independently loaded; retry errors.
- [x] Demo: functional controls and illustrated room hotspot launcher with one active interaction, close/Escape and camera return. Accessible numeric controls supplement drag. Test controls via DOM and 3D renderer.
- [x] Verification: full test suite, build, stop previous local demo server if present, start preview, hit endpoint, browser test all objects and screenshot. Document exact outcomes and integration limits.
- [x] Delivery: README, API/state/integration guide, assets/license paths, reproducible tests, ZIP excluding node_modules/dist caches. Local branch only; repository access is read-only.

No commits until full suite passes. User did not request a remote push.

Hasil akhir: 79 test, build, restart endpoint, browser, screenshot, re-review dan arsip diverifikasi; lihat VERIFICATION.md.
