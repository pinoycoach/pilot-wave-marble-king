# The Build Standard, v2

The original seven points (facts in one sourced file, phases with stops, judgment calls named,
every commit gated, principles become tests, guards proven not just written, three-part phase
reports) held up completely on fengshui.mom. Nothing in them needs walking back. What follows is
what the seven points didn't cover — found because a real build hit each gap, not guessed in
advance. Use this alongside the original, not instead of it.

## 8. State the environment before anything is built

**The rule:** name the builder's OS, the runner's OS, and the deploy target's OS in CLAUDE.md,
explicitly, before Claude Code writes a line. If builder and runner differ, nothing is "done"
until it's been run on both.

**Why this is now a rule, not a suggestion:** I built the first version of fengshui.mom's tooling
on Linux. Napoleon runs Windows. That single mismatch caused three separate bugs before it was
named as a standing risk: CRLF line-ending churn in the golden-case generator, a path-separator
bug in the sitemap test (`\` vs `/`), and a `multiprocessing` re-exec bug (Windows uses `spawn`,
not `fork`, so code outside a `__main__` guard ran once per CPU core). All three were real,
all three shipped before anyone caught them, and all three trace to one unstated fact.

## 9. The verification harness must run the real pipeline, not a shortcut of it

**The rule:** a test-of-tests (a guard-proof, a mutation harness, anything that proves "the tests
can fail") must invoke the exact same sequence a real deploy does — build, then test — never test
alone against whatever happens to already be built.

**Why:** `guard-proof.mjs` initially ran `test.mjs` only. A mutation to `rules.json` or
`day-masters.json` only reaches the live behavior through a rebuild, so the harness was silently
validating a stale, already-committed bundle. Two real mutations went undetected before this was
caught. Fixed by making the harness call `build.mjs && test.mjs`, matching the actual gate.

## 10. A test written around a human workflow must simulate the workflow succeeding

**The rule:** when a test encodes a *current state* of a human process (nothing is signed yet, no
one has responded yet, the list is empty), also write the test for what happens when that state
changes as intended — don't just test the starting condition and assume it's permanent.

**Why:** the first sign-off test asserted "every required id is currently unsigned." That's true
on day one and false the moment anyone signs anything — meaning the test was guaranteed to break
the gate the first time the human workflow it existed to support actually worked. Rewritten to
check structure (every id present once, no unknown ids, signed entries carry signer/timestamp/hash)
instead of a snapshot of an empty state.

## 11. A verified constraint must be re-verified after any feature that touches the same surface

**The rule:** when a new feature is added to something that already passed a check (a layout fits,
a size floor holds, a page prints correctly), that check is not still valid by default. Re-run it
against the new state before calling the feature done.

**Why:** the card's text-size floor was measured and approved. Then a year-animal line was added to
the same card. Nobody re-measured until the mobile-audit tool was pointed at the *new* card and
found the printed version had grown past its target size. The fix (reposition the line, don't
shrink text) was cheap. Not re-checking would not have been.

## 12. Trust the live screen over the documentation, for anything account-specific

**The rule:** for third-party dashboards (DNS providers, email senders, hosting platforms),
treat searched documentation as a plausible starting guess, and the actual screen the person is
looking at as ground truth. When they conflict, the live screen wins, every time, without
argument.

**Why:** documentation review said Resend's subdomain verification needed "MX and TXT records."
The actual live Resend screen showed one TXT (DKIM) and two CNAME records — no MX at all, because
Receiving was off. Docs describe the general case; a specific account's actual configuration can
differ in ways that matter. Ask to see the real screen before writing instructions based on search
results alone.

## 13. When a check and a human disagree, the human wins, and the check gets investigated

**The rule:** if an automated verification tool reports one thing and a person looking directly
at the artifact reports another, believe the person, say so plainly, and treat the tool's
disagreement as a bug to find, not a result to defend.

**Why:** after a content fix deployed successfully (confirmed by commit hash on the live Netlify
build), an automated fetch check reported the old text, three times in a row, including with a
cache-busting query string. The honest move was to say the fetch tool looked untrustworthy, not
to declare the deploy broken. A private-browser check by the person confirmed the fix was live —
the fetch tool had been the wrong signal the whole time.

## 14. Independent content review is the same discipline as independent calculation review — just for judgment instead of arithmetic

**The rule:** anything in the build that is a *fact* (a calculation, a date, a formula) gets
checked against an independent implementation, per the original standard. Anything that is
*judgment* (how a claim is worded, whether a description overclaims, whether a term is used
correctly) gets checked against independent reviewers who have no stake in the work looking
finished. Both steps are mandatory before sign-off, not just the first one.

**Why:** the BaZi math was checked against an independent library across every possible day —
airtight. But the *wording* around the calculation (calling something a "supporting element,"
phrasing temperament descriptions as advice) had no equivalent check until three separate AI
reviewers were asked to critique it cold. All three converged on the same two real problems,
independently, that a single close reader — even a careful one — had missed. This is cheap
(minutes, not a build phase) and belongs in every project with public-facing copy, not just this
one.

## 15. The least-privileged credential goes in the live code path; anything broader is separate and rare

**The rule:** decide this before writing the integration, not after a limitation is discovered.
The API key embedded in code that runs on every request gets the narrowest scope the task allows.
Any action needing broader privilege (managing a mailing list, writing to an admin endpoint) uses
a second, separate credential, used rarely, ideally by a human directly rather than by the
always-running code path.

**Why:** the send function needed a Resend key scoped only to sending, from one verified
subdomain. It was created that way from the start on this project, but only after nearly reusing
a broader key out of convenience. Naming this as a standing rule removes the moment of temptation
next time.

## 16. Keep a single, live decisions log in the repo — not just in chat scrollback

**The rule:** open decisions (things blocking a gate, waiting on a person, or still under
discussion) live in one file in the project, e.g. `DECISIONS.md`, that both the planning
conversation and the coding tool read and update. Don't rely on carrying "N5 is still open, N9 is
resolved" by re-typing it into every instruction block from memory.

**Why:** across this build, several open items (N9's resolution, a stale wording claim on the
About page) were dropped from one instruction and had to be manually re-added later, purely
because they lived only in conversation history rather than a file either side could check. A
`DECISIONS.md` with one line per open item, and its resolution the moment it resolves, removes an
entire category of "did I actually tell it that" risk. Template in `templates/DECISIONS.md`.

## 17. End every build with a retro, before calling it done — not after someone asks

**The rule:** add a final phase to `HANDOVER.md`: after launch, list what actually broke during
the build (not what the plan predicted), what caught each thing, and what would have caught it
sooner. Fold the real answers into `CLAUDE.md`'s Lessons section as part of finishing, not as an
afterthought weeks later.

**Why:** this exact document is that retro, done properly for the first time on this project,
several days after launch, only because it was asked for directly. Doing it as a formal last phase
means the lessons are still fresh, and means the next project starts with them already folded in,
rather than repeating the discovery.

---

*Points 1–7 are the original standard, unchanged. Points 8–17 are what fengshui.mom's actual build
taught, kept in the same evidence-cited form: a rule, and the real incident that made it a rule.
When peso.credit (or the next build) finds something these seventeen don't cover, add it the same
way — a plain rule, one paragraph of why, cited against something that actually happened.*



## 18. A decisions file only governs the session that has the current copy of it

**The rule:** before a coding session starts real work, confirm the decisions file it just read is
the same one the last session wrote — not "probably close enough." If a chat-side conversation
resolved anything since the file on disk was last saved, get that resolution onto disk first. When
in doubt, paste the chat-side file over the disk copy before typing the first instruction.

**Why this is now a rule.** A planning conversation resolved three items — which module layout to
build into, an output-validator's error-handling behavior, and whether to route builds through an
alternate backend — writing them into a decisions file that existed only in that conversation's own
workspace. That file was never downloaded back onto the machine actually running the coding tool.
A separate coding session then started, read the decisions file that was actually on disk — which
still showed those three items unresolved — and, working correctly from what it could see, re-asked
one of them from scratch and assigned fresh IDs to its own new items. Those fresh IDs turned out to
be the exact IDs the planning conversation had already used for the resolved items nobody had told
it about. Two files, both internally consistent, silently diverging — the identical failure shape
this project's own classical citation work had already documented and fixed once, in a different
document, for a different reason (register items colliding across independent retrieval passes).
The fix there was a numbering crosswalk after the fact. The fix here is not letting it happen: a
decisions file is single-source-of-truth in name only if two tools can each hold a copy and neither
one is required to be current before it starts writing new decisions into it.

**Practical version:** if the coding tool and the planning conversation are different programs (a
chat interface and a local CLI tool, say), decisions live in a file that has exactly one location,
and every session — chat or code — starts by confirming it has that location's current content, not
a copy from before the last edit. If a project is in git, this is nearly free: commit the decisions
file after every session that touches it, and the next session's first move is `git pull` or
equivalent before it reads anything. If it isn't in git yet, that absence is itself worth naming as
the thing to fix, ahead of the next multi-session build.