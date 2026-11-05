# Notebook integration

`Notebook({assetBase})` is a React Three Fiber component. Mount inside Canvas and StudyProvider. It loads `planning_book_3d.glb` through the shared loader. The optional assetBase follows the same URL contract as the other objects.

The original book is retained. `bookRig` attaches the royal-blue front cover, cover title, boat and rocket pieces to the original spine pivot at `[-1.825,.68,0]`. The pivot eases around Z between closed and `.93π` open, based on `state.book.open`. Original GLB materials and textures remain unchanged.

The procedural paper uses the measured paper-block top at Y=.60 with the page at Y=.615, so the added paper clears the original surface. It is 3.42 × 4.5 model units, anchored at `[-1.685,.615,0]`. The model's original cream paper block remains in place. Presentation uses the agreed scale .48 and center `[-1.825,.4,0]`.

Page zero displays `state.mainTask`; page N displays task N−1, including its completed status. Every task owns one page. Changes to `book.page` or `book.turn` start a .85-second sheet turn. Forward bends from right to left, backward travels from left to right. These are actual segmented PlaneGeometry surfaces with position vertices and normals updated by `deformPage`, rather than a flat UI rotation. The flipping sheet has a cream back face and a textured front. The static sheet receives the selected content. Rapid navigation is queued in order with a snapshot of each requested page. Newly added task IDs are also queued when React batches multiple additions.

CanvasTexture renders a cream ruled page with local cursive fonts. Supplemental page materials are unlit for readable ink; original GLB materials are retained. Task text reveals at 55 characters/second after the turn ends. Updating the main task or current subtask resets the reveal. Handwriting waits while the book is closed. The component has no controls of its own: dispatch BOOK_OPEN and BOOK_PAGE from the host. ADD_TASK already selects the new task page and increments book.turn in the reducer.

Geometry, page textures and generated materials belong to this component and are disposed on unmount. The shared model loader disposes its cloned GLB materials. Original shared loader geometry and textures are not modified by the notebook.

## Verification and limits

`npx vitest run tests/notebook.test.jsx` verifies original-cover motion, stationary paper block, actual bent sheet geometry during forward and backward turns, CanvasTexture use, delayed handwriting, and owned-resource disposal. It uses the React Three Fiber renderer with a minimal rig fixture; the actual GLB rig also has its separate tests in rigs.test.js. Real notebook GLB bounds were inspected directly: original paper top .600, cover bottom .6425.

The handwriting uses system cursive fonts; appearance varies by browser. It reveals complete letters rather than simulating pen strokes. Text wraps and shrinks to a small readable size; exceptionally long task text can exceed the physical page height and is clipped to that page. The reverse face is intentionally blank cream. Page requests turn in sequence; the original static GLB paper block is retained beneath the procedural sheets. Browser visual verification is performed by the integrated demo, not this component's renderer tests.
