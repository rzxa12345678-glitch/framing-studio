# E2.329 / PR #29 release verification

Baseline: E2.324 `70c1ee165395324d90611d58cd049e3bda1340ca`. Reviewed PR head: `a1ce3230d2f04785892430bfe09261acc9152531`.

The added patch makes the Q5 spacing regression self-contained and portable.
It reproduces the recorded 6.519 m pair under a 7 m minimum, verifies candidate
generation/apply/reopen and deleted records, and rejects retained invalid pairs
without modifying input. The original private Q5 project was not available;
this does not claim that its complete engineering model passed. Supply
`FRAMING_Q5_MODEL` for the separate original-model check.

31 validation checks passed (including the historical-baseline comparison),
plus 82 isolated browser and 82 Windows
WebView2 UI assertions. The browser suite also exercised actual keyboard/mouse
selection and grid-copy actions. No original user tab was reloaded. No test
automatically accepted a confirmation dialog.

Column/wall polygon boundaries, triangular slabs/secondary beams, CAD geometry,
column tributary loads, report caching, report scroll stability and original
A/B screen/print/PDF pixels were covered. Complete unaffected SB/TB audit
outputs and solver/model counts match E2.324. 47 protected calculation,
Excel/VBA and report files remain byte-identical; 45 embedded modules match
their source. All 190 production files and the Windows EXE remain
identical to the reviewed E2.329 PR; only tests and verification documentation
were added before merging.

Historical test limitations are retained in `merge329.json`: an E2.159 test
lacks its untracked fixtures, an E2.118 slab fixture has the same failure on
E2.324, and an E2.246 golden audit hash is obsolete. These are not reported as
passing tests. Current focused tests and complete E2.324 output comparisons
cover the affected behaviours. Initial missing runner arguments/Git path and
PDF module MIME configuration were corrected in the isolated test harness.

This pass did not rerun native Excel/VBA recalculation or native A/B PDF export.
Native menu/file chooser/dirty-close/recovery confirmations were not rerun;
the host implementation is unchanged apart from version labels. Native UI
results use `uiOK=true`; `ok=false` deliberately skips the old automatic
confirmation sweep and causes its legacy host to exit with code 1.

See `source/tests/fixtures/README.md` for the portable test command and optional
original-model command. No private project is included in this release.
