# Asset provenance and coordinate conventions

Source: https://github.com/clarinetopan-collab/Room-bloom-2

Main commit observed during retrieval: `a29b6c0c93227e0e3dbebde2855db4a1cf824a2e`. Download: GitHub main archive, 5 November 2026. All 10 GLBs and 18 room PNGs are included byte-for-byte. SHA-256 verification passed against the initial download. The original repository was not overwritten or pushed. Its README contains only the asset description, not the website source.

`model-report.json` is reproducible with npm run inspect. `glb-inspection.json` retains the initial full node/material/hierarchy inventory. No GLB includes an embedded animation clip. Mesh/node names in metadata are original; Three GLTFLoader sanitizes spaces and punctuation at runtime. findNode uses the actual name and Three PropertyBinding sanitizer rather than invented names.

The original models use Y up. Clock/TV/CD face approximately +Z; the CD uses its real Z spindle axis. Notebook and calendar lie in XZ; their top surfaces face +Y. Calendar is presented with a +PI/2 X wrapper rotation. Rigs act in original model coordinates under a normalization group. Clock hand centers are reparented around Clock Center Pin without moving the body. Original large studio-floor nodes are removed only from runtime clones before bounds are computed. Original asset geometry, colors, materials, and textures remain in the files.

The CD group includes the raised disc and its sky/meadow/cloud/flower artwork, including the small red flower clusters. The outer player and fixed spindle hardware remain stationary. The notebook cover includes its original title and illustrations. Dynamic paper/steam/date surfaces are supplementary geometry; generated resources are released on unmount.

React Bits OptionWheel is the original JS-CSS registry source from https://reactbits.dev/r/OptionWheel-JS-CSS.json, byte-verified against retrieval, with source license retained at src/vendor/REACT-BITS-LICENSE.md. This package uses it as part of the ROOM TO BLOOM application. Original asset rights follow their owner; the included original synthesized WAV files and generator are CC0 as described in public/audio/LICENSE.txt.
