# ROOM TO BLOOM — COMPLETE INTERACTIVE 3D DEVELOPMENT

## YOUR ROLE

Act as a senior React, Three.js, React Three Fiber, and interactive 3D animation engineer.

I am developing **ROOM TO BLOOM**, an interactive virtual study-room website with a warm, animated-movie-inspired illustration style.

Your task is to create **production-ready, reusable React components and functional 3D animations** for my existing GLB models.

I need actual working code, not pseudocode, conceptual explanations, or visual mockups.

## OFFICIAL PROJECT REFERENCES

**Existing published website:**
https://studyroom-cteuvmpb.manus.space

**LATEST GitHub asset repository:**
https://github.com/clarinetopan-collab/Room-bloom-2

IMPORTANT:

- Use `Room-bloom-2` as the authoritative source for the latest assets.
- Do not use the old `virtual-study-room` repository.
- The published website is a visual and functional reference.
- The GitHub repository primarily contains images and 3D assets; do not assume it contains the complete website source code.
- Preserve the existing website's design and functionality.
- Do not rebuild the website.
- Build modular code that Manus AI can integrate into the existing project.
- If the website source code is available, inspect it before implementation.

## LATEST 3D ASSETS

Inspect the actual repository and confirm the current filenames.

Expected assets include:

| Object | GLB filename |
|---|---|
| CD player | `CD.glb` |
| Table lamp | `red table lamp.glb` |
| Planning notebook | `planning_book_3d.glb` |
| Alarm clock | `alarm_clock.glb` |
| Calendar | `calendar.glb` |
| Television | `TV.glb` |
| Tea cup | `tea cup.glb` |
| Trash can | `rubbish can.glb` |
| Book stack | `book_stack.glb` |
| Island map | `3D model island.glb` |

Verify filenames, capitalization, and actual repository paths rather than assuming these names are all exact.

The CD player and table lamp have been updated. **Use the newest versions from this repository, not the old models.**

---

# PHASE 1 — INSPECT AND PREPARE ALL GLB MODELS

Before implementing animations:

1. Download and inspect the latest GLB files.
2. Analyze scene hierarchies and actual mesh names.
3. Identify pivot points, material groups, and coordinate systems.
4. Determine which objects have separate movable components.
5. Check for embedded animation clips.
6. Inspect whether models need additional geometry or animation rigs.
7. Preserve original colors, proportions, materials, textures, and recognizable appearance.

Do not invent mesh names.

If a GLB is a single static mesh, create supplementary pivot groups, procedural geometry, or an animation rig.

Document limitations that require changes to the original 3D model.

---

# PHASE 2 — INTERACTIVE ALARM CLOCK

**Model:** `alarm_clock.glb`

I want the analog clock hands to control the duration of a study session.

### Custom mapping

For this specific study timer:

- **Long hand = study hours**
- **Short hand = study minutes**

This is intentionally different from a conventional clock. Label the controls clearly.

### Interaction sequence

1. User clicks the clock inside the illustrated study room.
2. Camera smoothly zooms toward the 3D clock.
3. User can manually rotate the long hand to adjust hours.
4. User can manually rotate the short hand to adjust minutes.
5. A digital display updates immediately.
6. User clicks Start to begin the countdown.

### Requirements

- Accurate pointer-to-angle conversion.
- Realistic hand rotation around the center pivots.
- Clockwise and counterclockwise dragging.
- Configurable duration limits.
- Digital `HH:MM:SS` countdown.
- Start, Pause, Resume, and Reset.
- 25/5 Pomodoro preset.
- 50/10 Pomodoro preset.
- Custom study duration.
- Break timer synchronization.
- Persistence of selected duration.

Use timestamp-based timer calculations to prevent drift.

The entire clock must not rotate when adjusting the hands.

---

# PHASE 3 — TEA CUP BREAK ANIMATION

**Model:** `tea cup.glb`

Currently, the tea cup does not animate during study breaks.

I want a warm, cozy steam animation.

### Interaction sequence

1. User clicks Start Break.
2. Camera smoothly focuses on the tea cup.
3. Steam gradually begins rising.
4. Steam curls and disperses naturally.
5. The animation continues during the break.
6. When the break ends, the steam fades away.

### Technical requirements

- Three.js particle system or lightweight procedural steam meshes.
- Soft transparency and gradual fading.
- Subtle movement rather than exaggerated smoke.
- Frame-rate-independent animation.
- Proper cleanup of animation resources.
- Steam state connected directly to the break timer.

Do not make the steam permanently active.

---

# PHASE 4 — TV STUDY RECOMMENDATIONS

**Model:** `TV.glb`

The TV should visually display study environment recommendations based on the user's task.

### Interaction sequence

1. User clicks the TV.
2. Camera zooms toward the screen.
3. TV powers on with a subtle screen-glow animation.
4. User enters their main study task.
5. The recommendation system analyzes the task.
6. The recommended environment appears directly on the TV screen.

Example:

**YOUR STUDY SETUP**

Environment: University Library

Sound: Forest Ambience

Lighting: Warm

Add an **Apply Recommendation** action.

### Requirements

- Render text directly on or accurately aligned with the TV screen.
- Use a canvas texture or screen-aligned HTML interface.
- Keep the interface attached to the model.
- Connect recommendations to the actual environment, sound, and lighting state.
- Support task changes and recommendation updates.
- Provide a deterministic keyword-based recommendation fallback if an AI service is unavailable.

Do not display recommendations in an unrelated floating panel.

---

# PHASE 5 — INTERACTIVE PLANNING NOTEBOOK

**Model:** `planning_book_3d.glb`

This is one of the most important interactions.

### Initial state

The planning notebook is closed.

### Main-task interaction

1. User clicks the half-open notebook illustrated on the study desk.
2. Camera zooms toward the 3D planning notebook.
3. The cover opens around its spine.
4. The first page becomes visible.
5. User enters their main task.
6. The task appears on the page with a subtle handwriting animation.

### Subtask interaction

Each new subtask must trigger a page-turn animation.

1. User adds a subtask.
2. The current page lifts from the right.
3. The paper bends and curves.
4. The page turns toward the left.
5. The next page becomes visible.
6. The subtask is displayed on that page.

**One subtask = one page.**

### Functional requirements

- Open and close the book.
- Turn pages forward.
- Turn pages backward.
- Add subtasks.
- Edit subtasks.
- Delete subtasks.
- Mark subtasks complete.
- Synchronize with the main task list.
- Persist content across reloads.

Use actual 3D page-turning geometry or deformation.

Do not use a simple 2D opacity fade to imitate page turning.

If the GLB does not contain individually movable pages, create procedural page meshes aligned with the original book.

Preserve the original model's appearance.

---

# PHASE 6 — CD PLAYER WITH REACT BITS OPTIONWHEEL

**Model:** newest `CD.glb` from GitHub.

The CD player has been replaced with a newer model. Do not use the previous version.

### Interaction sequence

1. User clicks the CD player.
2. Camera zooms toward the model.
3. A music-selection OptionWheel appears beside it.
4. User selects a music or ambient-sound category.
5. Audio begins playing.
6. The CD disc inside the player starts rotating.

### Music options

- Forest Ambience
- Rain Sounds
- Ocean Waves
- Café Ambience
- Soft Instrumental
- Lo-Fi Study
- White Noise

### React Bits integration

Use the **OptionWheel JavaScript + CSS component**.

Official component documentation:
https://reactbits.dev

Use the exact OptionWheel source code I provide with this task, or retrieve the appropriate JS-CSS variant.

Do not substitute a normal HTML select menu.

Example:

```jsx
<OptionWheel
  items={[
    'Forest Ambience',
    'Rain Sounds',
    'Ocean Waves',
    'Café Ambience',
    'Soft Instrumental',
    'Lo-Fi Study',
    'White Noise'
  ]}
  defaultSelected={0}
  textColor="#a6a6a6"
  activeColor="#ffffff"
  side="left"
  fontSize={2}
  spacing={1.4}
  curve={1}
  tilt={6}
  blur={2}
  fade={0.25}
  smoothing={200}
  inset={80}
  loop={false}
  draggable
  onChange={(index, item) => selectAudio(item)}
/>
```

### CD animation rules

- Play: disc rotates continuously.
- Pause: disc stops rotating.
- Resume: disc resumes.
- Stop: disc stops.
- Change track: selected audio changes.

Only the disc should rotate, not the entire player.

Use delta-time animation through React Three Fiber.

The rotation must follow the real disc axis.

Use properly licensed playable audio sources.

Handle browser autoplay restrictions and missing audio files gracefully.

---

# PHASE 7 — LIVE INTERACTIVE CALENDAR

**Model:** `calendar.glb`

The calendar must automatically display the user's current local date.

### Interaction sequence

1. User clicks the calendar.
2. Camera smoothly zooms toward it.
3. The current month and year appear.
4. Today's date is highlighted.
5. A red circle is drawn around today's date.

Example:

If today is November 5:

- Month: NOVEMBER
- Highlighted date: 5
- Animated red circle around 5

### Requirements

- Read the current date from the user's local system.
- Correct month and year.
- Correct calendar layout.
- Correct day-of-week alignment.
- Leap-year support.
- Update automatically after local midnight.
- Readable 3D calendar display.
- Red-circle drawing animation.

Do not hardcode November 5.

Use a texture or overlay correctly attached to the calendar surface.

---

# PHASE 8 — DESK LAMP AND ROOM LIGHTING

**Model:** newest `red table lamp.glb`.

The lamp controls the lighting of the currently selected study room.

The GitHub repository includes bright and sunset/warm image variations.

### Lighting slider

- 0% = Warm sunset.
- 50% = Soft afternoon.
- 100% = Bright daylight.

### Requirements

1. Connect the lamp to a shared lighting controller.
2. Identify the correct bright/sunset image pair for each room.
3. Crossfade between the two images.
4. Preserve room composition and object positions.
5. Avoid ghosting and image misalignment.
6. Preserve the current room selection.
7. Keep interactive hotspots correctly aligned.
8. Optionally adjust the lamp's emissive material.

The lighting system must support all study rooms with valid image pairs.

If a room is missing a required variation, report it rather than inventing an image.

Do not treat sunset images as separate selectable environments.

---

# PHASE 9 — TRASH CAN AND CRUMPLED PAPER

**Model:** `rubbish can.glb`

The existing website already has working paper-tearing and crumpling animations.

Preserve them.

The missing functionality is the ability to put the crumpled paper into the trash can.

### Interaction sequence

1. User completes a subtask.
2. User tears the paper.
3. User crumples it.
4. User drags or throws the crumpled paper toward the trash can.
5. The bin detects the paper.
6. The paper falls inside.
7. The bin reacts with a subtle bounce.
8. The paper remains visible inside the 3D trash can.

### Requirements

- Reliable collision detection.
- Correct coordinate conversion between 2D and 3D interactions.
- Natural falling animation.
- Support multiple paper balls.
- Prevent floating paper.
- Persist completed-paper history.
- Allow retry when a throw misses.

Each completed subtask must correspond to a paper object.

The number of papers inside the bin must match the relevant completed-task history.

Do not create random decorative papers unrelated to tasks.

---

# PHASE 10 — SHARED 3D INTERACTION SYSTEM

Create a reusable architecture.

Suggested components:

- `InteractiveGLB`
- `CameraFocusController`
- `ObjectInteractionManager`
- `AnimationController`
- `StudyTimerController`
- `AudioController`
- `LightingController`
- `TaskStateController`

All objects should follow:

**HOVER → CLICK → CAMERA ZOOM → INTERACT → SAVE → CLOSE → RETURN**

Requirements:

- Only one active 3D interaction at a time.
- Smooth camera transitions.
- Escape key closes the interaction.
- Consistent hover feedback.
- Consistent close buttons.
- Responsive layout.
- Accessible alternatives for drag controls.
- Shared state synchronization.
- No unnecessary re-rendering.

Use React Three Fiber, Three.js, Drei, and compatible React state management.

Prefer JavaScript/JSX unless the existing project requires TypeScript.

---

# PHASE 11 — BUILD A TESTABLE DEMO

Create a functional demo where I can test every object independently.

Include:

- Clock hand dragging.
- Timer countdown.
- Tea steam.
- TV recommendations.
- Notebook opening.
- Page turning.
- CD rotation.
- Music selection.
- Calendar date.
- Lighting transitions.
- Paper entering the bin.

Test actual interactions, not only static rendering.

Document which features have been verified and which still require integration with Manus.

---

# PHASE 12 — FINAL CODE PACKAGE FOR MANUS

Create a folder:

`room-to-bloom-3d-interactions/`

Include:

1. Complete React source code.
2. CSS files.
3. Dependencies and installation instructions.
4. Asset paths.
5. Component APIs.
6. Shared state contracts.
7. Animation controllers.
8. Camera controllers.
9. Demo page.
10. Testing instructions.
11. Integration guide for Manus.
12. Known limitations.

If you have write access to the repository, create a separate branch or pull request.

Otherwise, provide a downloadable ZIP or complete source-code package.

Do not overwrite the asset repository's existing files.

## FINAL SUCCESS CRITERIA

The result must be a real, functional 3D interaction system that Manus can integrate into:

https://studyroom-cteuvmpb.manus.space

Use the latest models from:

https://github.com/clarinetopan-collab/Room-bloom-2

Do not claim that an animation works unless it has been implemented and tested.

**Your task is to build the functional 3D interaction code. Manus will handle integration into the existing website.**