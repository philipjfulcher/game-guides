# Parsing guide

Detailed instructions and heuristics for the parse-guide agent. Loaded as additional context alongside `system-prompt.md`.

The agent's job is to turn an arbitrary text walkthrough into the JSON shape defined by `output-schema.json`. Work through the four passes below in order.

---

## Pass 1 — Identify the section-marker convention

Walkthrough authors all use different conventions. Before parsing, scan the first 5–10% of the document **and** the table of contents (if one exists) to determine which marker style this guide uses. The marker is whatever consistent pattern the author uses to introduce a new chapter, area, or major step.

Common conventions you will encounter (non-exhaustive):

| Convention | Example | Detection |
|---|---|---|
| End-of-line slash | `Speedy Recovery                     /` | Line ends with whitespace + `/` |
| ASCII rule with embedded title | `<<------PRE-JOURNEY------>>` | Line begins `<<` and ends `>>` |
| Bracketed numeric IDs | `Terra's Story                  [1400]` | Line ends with `[NNNN]`; trailing-zero codes mark sections, non-zero mark steps within them |
| Underlined headers | Two consecutive lines: title, then `=` or `-` of equal length | Line N+1 is all `=`/`-` and `len(N+1) == len(N)` |
| Markdown headers | `## Tantegel`, `**4/6 M**` | Standard markdown |
| Numbered chapters | `Chapter 1: ...`, `1.0 ...`, `I. ...` | Regex on line start |

If the document mixes conventions (e.g., ASCII rules for chapters and underlined headers for steps), record both — they're your two tiers in Pass 2.

If you cannot identify any convention after a thorough scan, fall back to splitting on long stretches of blank lines (3+ consecutive blank lines as a section break) and use the first non-blank line of each chunk as the title. This is a last resort.

## Pass 2 — Build the hierarchy

**Default**: each top-level marker becomes a section. The section gets a single step whose `title` matches the section title and whose `content` is everything between this marker and the next.

**Use a two-tier hierarchy** only when the source clearly has one. Signals:
- The TOC shows two levels of indentation.
- Two distinct marker styles are used at different "depths" (e.g., `<<--CHAPTERS-->>` plus underlined sub-headers).
- Bracketed ID codes group naturally: `[1400]`, `[1401]`, `[1402]` — the `1400` is a section, `1401`/`1402` are steps within it.
- Roman numerals for outer level, Arabic numerals for inner level (`I. ... 1. ...`).

When using a two-tier scheme, every section must have at least one step. If a section has no inner markers, synthesize one step with the section title.

### Sections to skip

These appear in nearly every GameFAQs guide but are not walkthrough content. Drop them — do not emit a section for them:

- Introduction / Foreword / Preface
- Controls / Basics / Battle Mechanics
- Game Mechanics / Tips / General Strategy
- Legal / Copyright / Disclaimer
- Version History / Revision History / Updates
- Credits / Acknowledgements / Thanks
- FAQ / Frequently Asked Questions
- Contact / Support

Use judgment. Sections explaining an in-game system that the player references during the walkthrough (e.g., a fusion chart, a social-link table) may still be worth keeping. When in doubt, keep it.

## Pass 3 — Clean step content

The raw text between markers contains formatting noise that doesn't render well in markdown. Apply these transformations to every step's `content`:

### Drop

- **Stray ASCII separator lines** that aren't part of a box: lines made up only of `_`, `¯`, `-`, `=`, `*`, plus whitespace. These are visual rules between sections.
- **Page-break artifacts** common to GameFAQs: rows of `=` 60–80 chars long, "[Page N]" markers, repeated table-of-contents references.

### Wrap, don't drop

- **ASCII boxes around tables.** A box looks like a top border (` ____...____ `), a content body using `|` walls, and a bottom border (`\____...____/`). Wrap the entire box in a triple-backtick code fence. Keep the contents verbatim — do not try to convert the box to a markdown table. Example:

  ```
   ______________________________________________________________________________
  /                                                                              \
  | EQUIPMENT SHOP                            ITEM SHOP                          |
  | -------------------------------           -----------------------------      |
  | Bamboo Spear               10G            Medicinal Herb           10G       |
  ...
  \______________________________________________________________________________/
  ```

  becomes the same content surrounded by ` ``` ` on the lines before and after.

### Convert

- **Underlined headers** inside a step (text + same-length underline of `-` or `=`) → `## Text`.
- **Bracketed checkboxes** `[ ]` at line start → `* `.
- **Bullet characters** `•` at line start → `* `.
- **Inline section markers** that should stand out — `BOSS:`, `Floor N`, `Boss Battle:`, `Sub-Boss:` at line start → wrap the line in `**...**`.

### Preserve

- **Hard-wrapped paragraphs.** The source wraps at ~78 chars. Keep those line breaks; do not reflow. Markdown renders this fine.
- **Blank lines** between paragraphs.
- **Lists** the source already wrote with `-` or `*` markers.
- **Existing markdown** (links, bold, italics, code spans).

### Trim

- Trailing whitespace on every line.
- Leading and trailing blank lines from the whole `content` field.

## Pass 4 — Generate `id` fields

For each title:

1. Lowercase.
2. Replace whitespace runs with `-`.
3. Strip these characters entirely: `. , : ; ! ? ' " “ ” ` (period, comma, colon, semicolon, exclamation, question mark, straight and curly quotes).
4. Collapse runs of `-` to a single `-`.
5. Trim leading/trailing `-`.

Section id = `{order}-{kebab-title}` (with the section's 0-based index prepended).
Step id = `{kebab-title}` (no index prefix; order lives in the frontmatter).

### Optional / parenthetical suffixes

Some titles carry markers like `(OPTIONAL)`, `(MISSABLE)`, `(POST-GAME)`:

- Strip the suffix from the displayed `title`.
- Set `optional: true` on the step (or section, but typically step) when the source flags it as skippable.

### Collisions

If two steps in the same section produce the same id, append `-2` to the second, `-3` to the third, etc. Update the affected step's id only — the title remains untouched.

### gameId

Derive `gameId` from the guide's title block at the top of the document, or from the input filename if a title block isn't obvious. Apply the same kebab-case rules. Examples:

- `Dragon Quest (Switch) Walkthrough` → `dragon-quest`
- `dragon-quest-1.txt` → `dragon-quest-1`
- `Metroid Prime Remastered FAQ/Walkthrough` → `metroid-prime-remastered`

When both title and filename suggest different ids, prefer the filename's specificity (e.g., `dragon-quest-1` over `dragon-quest` when there's a series).

---

## Worked example

Input: see `examples/dragon-quest-1-excerpt.txt` (the first 130 lines of the Dragon Quest 1 walkthrough — covers PRE-JOURNEY, TANTEGEL, GRIND 1, and the start of ERDRICK'S CAVE).

Expected output: see `examples/dragon-quest-1-output.json`.

Notes on what the example demonstrates:

- The marker convention is **ASCII rule with embedded title** (`<<------TITLE------>>`).
- The source has only one tier of markers (no nested chapters), so the **default Pass 2 rule** applies: each marker → one section, one step. The output has three sections: `0-pre-journey`, `1-tantegel`, `2-grind-1`.
- The `(OPTIONAL)` suffix on `ERDRICK'S CAVE (OPTIONAL)` is stripped from the title and the step's `optional` flag is set to `true`. (This appears at the tail of the excerpt, even though the body of that section is truncated.)
- The TANTEGEL section contains an ASCII box describing shop prices — it's preserved verbatim inside a code fence.
- Hard-wrapped paragraphs are preserved exactly as in the source.
