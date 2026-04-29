# parse-guide agent

An AI agent that converts a raw text video-game walkthrough (typically a GameFAQs-style plaintext file) into structured JSON describing sections, steps, and cleaned content. A downstream service (today: a future backend; tomorrow: anything that consumes the JSON schema) materializes that JSON into the on-disk markdown layout the [game-guides](../../apps/game-guides) app already understands.

This replaces the per-game TypeScript parsers under [libs/plugin/src/generators/parse-guide](../../libs/plugin/src/generators/parse-guide), which hard-code each game's section markers and content-cleaning rules and don't generalize to new guides.

**This phase is prompt + instructions only.** No backend, no SDK harness. The pieces here are everything the agent needs to read; running it is the next phase.

## Files

| File | Purpose |
|---|---|
| [system-prompt.md](system-prompt.md) | Agent's system prompt — role, I/O contract, hard rules. Concise. |
| [parsing-guide.md](parsing-guide.md) | Detailed parsing knowledge. Loaded as additional context alongside the system prompt. |
| [output-schema.json](output-schema.json) | JSON Schema for the agent's output. Used by the post-processor to reject malformed responses. |
| [examples/dragon-quest-1-excerpt.txt](examples/dragon-quest-1-excerpt.txt) | Worked-example input: first ~140 lines of [guides/dragon-quest-1.txt](../../guides/dragon-quest-1.txt). |
| [examples/dragon-quest-1-output.json](examples/dragon-quest-1-output.json) | Worked-example output for the excerpt above. |

## Manual run (until a backend exists)

1. Open a fresh Claude conversation (web, API playground, or your tool of choice).
2. Set the system prompt to the concatenation of [system-prompt.md](system-prompt.md) and [parsing-guide.md](parsing-guide.md).
3. Send the guide text as the user message.
4. The model returns a single JSON document.
5. Validate it against [output-schema.json](output-schema.json).
6. (For now) hand-write or script the markdown file emission per the mapping in `system-prompt.md`.

## Future backend

The intended pipeline:

```
upload (txt/md) ──▶ parse-guide agent ──▶ JSON ──▶ schema validator ──▶ writer ──▶ markdown/{gameId}/...
```

The writer is mechanical given the schema:
- `markdown/{gameId}/{section.id}/index.md` — frontmatter `{title, subtitle}`, body `#### {title}`
- `markdown/{gameId}/{section.id}/steps/{step.id}.md` — frontmatter `{title, order, optional?, automatic?, parent?}`, body = `step.content`

Frontmatter shape mirrors [apps/game-guides/app/models/markdown-structure.ts](../../apps/game-guides/app/models/markdown-structure.ts), which the runtime loaders ([acts.ts](../../apps/game-guides/app/data/acts.ts), [steps.ts](../../apps/game-guides/app/data/steps.ts)) consume by walking the directory tree.

## Reference: existing parsers

The TypeScript parsers under [libs/plugin/src/generators/parse-guide](../../libs/plugin/src/generators/parse-guide) are the ground truth for the conversion rules encoded in [parsing-guide.md](parsing-guide.md). When in doubt about a transformation (which characters get stripped from ids, which prefixes get bolded, how ASCII boxes are wrapped), consult those parsers — particularly [metroid-prime.parser.ts](../../libs/plugin/src/generators/parse-guide/metroid-prime.parser.ts), [dq1.parser.ts](../../libs/plugin/src/generators/parse-guide/dq1.parser.ts), and [kh-bbs.parser.ts](../../libs/plugin/src/generators/parse-guide/kh-bbs.parser.ts).

The existing parsers will keep working; this is additive.
