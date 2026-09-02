# 102025 · collab-messages Frontend

Part of **collab.codes**.

`102025` is the **frontend of collab-messages** — the chat / task / agent
interface of collab.codes. It is a `lib` project (`projectType: "lib"`,
declared in `mls-base/config.json` as a workspace dependency), consumed by the
Studio and by the runtime shell rather than run on its own.

## What lives here

Flat under `l2/`, by filename prefix:

| prefix | what it is |
|---|---|
| `collabMessages*` (~197 files) | the messaging UI: threads, prompt input, tags, filters, rich-text parsing, settings, modals, apps menu |
| `collabMessagesTask*` | task panel: details, info, preview of an agent run (tools, raw output, result) |
| `collabTasks*` | task sidebar, list and empty states |
| `aiAgent*` | agent-facing pieces of the UI |
| `widgetQuestions*`, `toolSchema*` | question widgets and tool schema rendering |

Tests sit next to their source (`*.test.ts`).

## Related

- [`102036`](../mls-102036) — collab-messages base frontend (environment
  contract + IndexedDB), used underneath this project.
- `collab-messages/` (outside `mls-base`) — the backend.
