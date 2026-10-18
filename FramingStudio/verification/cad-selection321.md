# CAD directional box selection on E2.316

Baseline: official main `3f84ffa0a11bd948d7be362b41257aeb2e6c7773` (E2.316 斜梁版). This is an independent UI patch; pending PR #24 and #26 are not merged. Native host/source/version remain the published E2.316 version; the bundled web UI and matching source carry the selection update.

## Behavior

- Drag left to right: select a member only when the complete physical footprint is inside the rectangle. Every piece of a slab must be enclosed.
- Drag right to left: select members that intersect or touch the rectangle. Slanted beams and polygon slabs use their real footprints, including empty-space rejection.
- The horizontal direction at the end of the drag controls the mode, independently of vertical direction. Blue solid window / green dashed crossing previews update during dragging.
- Apply the same rule to columns, the column move/copy page, walls, beam-layout MB/TB/CB/SB/slab selection and drawing-review members. Review uses displayed positions.
- Retain additive click/box selection, deduplication, category/visibility/current-floor filtering, reference-column exclusion and Review Shift removal. Esc cancels a live gesture without reselecting members on release.
- Area painting, load regions and SB-area drawing remain their original tools.

## Passed validation

Run `node FramingStudio/verification/cad-selection321.cjs` from the repository root. All **16** suites pass. The gate records its JSON and individual logs under the ignored temporary verification directory.

New geometry and real-pointer tests cover partial/full containment, both vertical directions, closed-edge contact, a box inside a member, disjoint slab pieces/holes, slanted/polygon footprint voids, final-direction reversal, cancel/Esc, additive clicks, reference exclusion, pan/zoom, main/secondary category filtering, the column move page and Review Shift/display offsets. Pointer selections preserve the project data.

Existing tests cover member selection, drawing offsets/SVG, column deletion, wall copy, diagonal beams/one-way slab loads and save/reopen, slab thickness/shared floors/self-weight/Undo, beam types, seven report-scale profiles with original print/PDF preservation, and 16-page report scrolling.

Two older tests deliberately encoded the superseded behavior: Review reverse drags required complete containment, and a tiny left-to-right slab marquee expected crossing selection. Review now asserts the exact crossing member set; the thickness test uses a right-to-left crossing gesture and retains all original editing/Undo/load assertions.

Preservation checks confirm:

- 67 production JS modules, all six CSS files, all 12 native Excel files, ExcelBridge, C# host, EXE, manifest and version are byte-identical to the official baseline.
- Existing Drawing plan/3D/elevation/SVG/picking functions remain byte-identical. Only selection helpers are appended. Non-UI beam-layout and Review geometry/print routines remain byte-identical.
- HTML/report/print content outside the four selection modules is byte-identical. All 42 marked modules are synchronized and all 44 executable inline scripts parse.
- Original A/B report content, formula presentation, layout, print and Excel/VBA are preserved. No native desktop launch or Excel generation is claimed.

Preview remains `http://127.0.0.1:8783/`; no user project/storage is cleared and no user tab is forcibly refreshed. The separately named CAD-selection package contains the E2.316 Windows host with updated UI, full corresponding tracked source, templates and verification evidence. Historical branches and packages are retained.
