# Portable Q5 spacing regression

`q5-spacing-repro.cjs` builds a synthetic, distributable reproduction of the
recorded spacing defect: centres `(47, 5.5)` and `(46.5, 12)` are about
6.519 m apart, below the saved 7 m minimum. The surrounding grid and wall are
synthetic. This is not the missing original Q5 engineering project.

Run from any directory with Node.js:

```powershell
node FramingStudio/source/tests/column-spacing325.cjs
```

The test checks move/copy rejection, valid movement, retained manual columns,
scheme generation/application, save/reopen and deletion records. It loads only
repository files by default, and does not read or write a user's saved project.

For an additional check of the original Q5 file, explicitly supply its path:

```powershell
$env:FRAMING_Q5_MODEL = 'C:/path/to/02_column_scheme_start.framing.json'
node FramingStudio/source/tests/column-spacing325.cjs
```

The optional project must have Framing `F05` with both saved minima equal to
7 m. A missing supplied file or failing assertion fails the test. Without that
file, output explicitly reports `original.status: "not supplied"`; a passing
synthetic reproduction must not be reported as a full original-model check.
