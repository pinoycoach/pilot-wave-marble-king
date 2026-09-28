# DECISIONS

The live record of open and resolved decisions for this project. Both the planning conversation
and the coding tool read this before acting, and update it the moment something changes — never
just in chat scrollback. Keep it short: one line to open an item, one line to close it.

Format per item: `<ID> — <one-line question> — STATUS — <resolution, if any>`

Status is one of: **OPEN** (blocks nothing yet, but unresolved) · **BLOCKING** (a real gate can't
pass without this) · **RESOLVED** (decided, with the answer recorded) · **REVISIT** (decided once,
worth reconsidering if circumstances named here change).

---

## Open

- N1 — <question> — OPEN

## Blocking

- N2 — <question that blocks release/launch> — BLOCKING

## Resolved

- N0 — <question> — RESOLVED — <the actual answer, in one line, dated>

## Revisit

- N-1 — <a decision made for now> — REVISIT — <what would trigger reconsidering it>

---

*When Claude Code (or any coding tool) reports "still open" items in a phase report, they should
match this file exactly — if they don't, this file is stale and gets fixed first, before more work
lands on top of a decision nobody can see the current status of.*
