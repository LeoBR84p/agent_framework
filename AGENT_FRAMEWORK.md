# AGENT_FRAMEWORK.md

> Universal agent framework for coding agents.
> To install: tell your agent **"install agent framework"** and it will run the setup wizard.

---

## HOW TO INSTALL

Say to your agent:

```prompt
Install the agent framework from AGENT_FRAMEWORK.md
```

The agent will:

1. Run the interactive wizard (questions below).
2. Create `CLAUDE.md` — short stub with project config and file pointers.
3. Create `AGENTS.md` — always-active behavioral rules and strategic guidelines.
4. Create `.agents/INDEX.md` — fast dispatch table to topic-specific instruction files.
5. Create `.agents/planning.md`, `.agents/coding.md`, `.agents/reviewing.md`, `.agents/testing.md`, `.agents/finishing.md`, `.agents/concurrency.md`.
6. Create `CONTEXT.md` for persistent cross-session memory.
7. Create `SESSION.db` (SQLite) for multi-agent concurrency control.
8. Create `.claude/settings.json` with hooks and `.agents/scripts/` helper scripts.
9. Confirm all files created and ask if you want to review each one.

### Reading strategy after install

An agent should **never** load all `.agents/` files on every run. Correct reading path per task:

1. `CLAUDE.md` — always (project config and model assignments).
2. `AGENTS.md` — always (always-active behavioral rules).
3. `.agents/INDEX.md` → dispatch to **one** specific file for the current task.

This ensures an agent loads only what it needs, keeping token overhead proportional to the task.

---

## REGISTERED MODELS

> Single source of truth for available models. Update as new models are released. The wizard reads from here.

| ID | Model string | Tier | Recommended for |
| -- | -- | -- | -- |
| 1 | `claude-sonnet-4-6` | capable | Planning, coding (default) |
| 2 | `claude-haiku-4-5` | fast | Simple commands, user Q&A, doc updates |
| 3 | `claude-opus-4-7` | top | Complex problem-solving (requires approval) |

### Default routing (overridable via wizard Q4)

| Task type | Model |
| -- | -- |
| Planning | `claude-sonnet-4-6` |
| Coding | `claude-sonnet-4-6` |
| Simple commands / user questions | `claude-haiku-4-5` |
| Error escalation after retry threshold | `claude-opus-4-7` (requires user approval) |

---

## WIZARD — SETUP QUESTIONS

When installing, ask the user the following questions using the interactive selector (present options, wait for answer before proceeding):

### Q1 — Project type

> What is the primary project type?

- Python backend / API
- Next.js / frontend web
- Full-stack (Python + Next.js)
- Data pipeline / ML
- Generic / I'll configure later
- Other — type your project type now

*If "Other": accept free-text input inline before proceeding to Q2.*

### Q2 — Primary language(s)

> Which languages will be used?

- Python
- TypeScript / JavaScript
- Both
- Other — type your language(s) now

*If "Other": accept free-text input inline before proceeding to Q3.*

### Q3 — Test coverage minimum

> Minimum test coverage per `.py` file?

- 75% (default)
- 80%
- 90%
- Other — type your percentage now
- No enforcement / I'll set manually

*If "Other": accept integer input (e.g. `85`) inline before proceeding to Q4.*

### Q4 — Model assignments

> The framework routes different task types to different models.
> Available models are listed in the REGISTERED MODELS section above.
> Confirm or override each assignment — ask one at a time.

**Q4.1 — Planning model** (default: `claude-sonnet-4-6`)

- claude-sonnet-4-6 (default)
- claude-haiku-4-5
- claude-opus-4-7
- Other — type model string now

*If "Other": accept free-text input and assert correct model name for registering before proceeding to Q4.2.*

**Q4.2 — Coding model** (default: `claude-sonnet-4-6`)

- claude-sonnet-4-6 (default)
- claude-haiku-4-5
- claude-opus-4-7
- Other — type model string now

*If "Other": accept free-text input and assert correct model name for registering before proceeding to Q4.3.*

**Q4.3 — Simple commands and user Q&A model** (default: `claude-haiku-4-5`)

- claude-haiku-4-5 (default)
- claude-sonnet-4-6
- Other — type model string now

*If "Other": accept free-text input and assert correct model name for registering before proceeding to Q4.4.*

**Q4.4 — Escalation top model** (default: `claude-opus-4-7`)

- claude-opus-4-7 (default)
- Other — type model string now

*If "Other": accept free-text input and assert correct model name for registering before proceeding to Q5.*

### Q5 — Retry escalation behavior

> When the agent fails to resolve the same problem after N consecutive attempts,
> it will offer to escalate to the top model (configured in Q4.4).
> Escalation always requires explicit user approval.

- Disable — always stay on assigned model
- Enable — use default threshold (3 attempts)
- Enable — set custom threshold - type threshold now

*If "Enable — set custom threshold - type threshold now": accept integer input (e.g. `2`) inline before proceeding to Q6.*

### Q6 — Documentation language

> Language for docstrings and inline comments?

- English (recommended)
- Match the project's existing convention

### Q7 — Multi-agent concurrency

> Other agents that may work simultaneously on this project?

- Only me (Claude Code)
- Claude Code + Cursor
- Claude Code + Cursor + Copilot
- All of the above + Claude app
- I'll configure manually

### Q8 — Memory strategy

> How should the agent persist context between sessions?

- CONTEXT.md in project root (recommended — lightweight, readable)
- I'll manage memory manually
- Other — describe your preferred strategy now

*If "Other": accept free-text input inline before proceeding to Q9.*

### Q9 — IDE and agent ecosystem

> Which AI tools will actively edit code in this project? (affects hook and task configuration)

- Claude Code only
- Claude Code + Cursor
- Claude Code + GitHub Copilot (VS Code)
- Claude Code + Cursor + GitHub Copilot
- All of the above + other agents

*Based on this answer: if any tool besides "Claude Code only" is selected, the installer will also create `.vscode/tasks.json` (Cursor/Copilot-compatible tasks) and ask Q9.1.*

**Q9.1 — Git hooks** *(only asked if Q9 ≠ "Claude Code only")*

> Create a `pre-commit` Git hook for lock check and lint enforcement?

- Yes — install as `.git/hooks/pre-commit` (protects all agents equally)
- No — skip Git hooks

---

## SECTION 1 — CORE BEHAVIORAL RULES (always active)

### Output minimization

- Respond with minimum tokens needed. No preamble, no repetition, no closing summaries.
- Never thank the user for reaching out. Never encourage further engagement.
- One question per response maximum. Ask before assuming.

### Ambiguity handling

- If information, specification, or intent is missing or ambiguous: **stop and ask**. Do not infer intent, choose "the most common path", or invent plausible defaults.
- Do: `"Column user_id appears as int in schema A and str in schema B. Which is the source of truth?"`
- Don't: assume `int` because "IDs are usually integers" and proceed.

### Scope control

- When encountering out-of-pattern existing code: alert and propose, only change after explicit confirmation. Maintain task scope.
- Every non-trivial technical decision (new dependency, public signature change, fallback use, schema migration) must be listed in the response with justification.

### Self-review before delivery

- Re-read everything generated before delivering. Focus on error paths, edge cases, auth, simplicity, error handling, proper documentation, adequate testing and protecting user data.
- Never deliver a snippet you cannot explain line by line.

---

## SECTION 2 — WHEN PLANNING (trigger: user requests a plan, architecture, or .md document)

### Required actions before writing

1. Read `CONTEXT.md` for existing architectural decisions and technical debt.
2. Read `SESSION.db` to check if any relevant files are currently locked by another agent.
3. Ask clarifying questions before generating. Never assume scope.

### Required format for planning documents

- Start with: `## Goal`, `## Scope`, `## Out of scope`
- List tasks with checkboxes: `- [ ] Task description`
- Mark completed tasks as: `- [x] Task description — implemented in <file> (<timestamp>)`
- When implementing a plan, update the plan file marking each item as done.
- When the whole plan is completed, update plan header H1 (#) with label 'FULLY IMPLEMENTED'
- All code blocks declare language: no bare ` ``` ` without a language identifier.

### Fallbacks require pre-authorization

- Every fallback needs: justification comment, `WARNING` log when triggered, associated metric, and **prior user approval**.
- Never implement a fallback because "information was missing in the spec". Ask.

---

## SECTION 3 — WHEN CODING (trigger: user requests code, refactoring, or file creation)

### Code hygiene — mandatory (all languages)

- **No dead code**: no unused imports, unread variables, unreachable branches, commented-out legacy code.
- **Precise names**: forbidden: `data`, `data2`, `temp`, `final`, `result_new`, `helper`, `process_stuff`. Names must reveal purpose and output type.
- **Comments explain why, never what**: justify non-obvious decisions, trade-offs, ticket/RFC references, or traps. Not descriptions of what the code does.
- **YAGNI**: no abstractions, base-classes, optional parameters, or extension points for hypothetical future use.
- **DRY with judgment**: extract on third real occurrence. Before creating a new helper, search for existing equivalents.
- **KISS — one function, one purpose**: if you need "and" to describe what it does, split it.
- **Dispatch over long if/elif/switch**: 3+ branches by type/category → dispatch map or polymorphism.
- **Composition over inheritance**: max 1 level of inheritance with justification. No multiple inheritance without explicit approval.

### Control flow and errors (all languages)

- **Early return**: max 2 nesting levels. Guard clauses at the top.
- **Every loop has explicit ceiling**: no unbounded loops. Always `max_iterations`, `max_attempts`, `timeout`.
- **Fail fast and loud**: validate input at the start. Do not program defensively to mask bugs.
- **No silent errors**: every exception/error is handled, logged, and propagated or converted to a domain error. Never swallow errors silently.
- **Always specific exception capture**: name the exact expected error class/type.
- **Typed domain errors**: own hierarchy of named error types. Never throw bare/untyped errors.
- **Asserts for invariants only**: not for flow control. Do not replace external input validation with asserts.

### Structure, state and side effects (all languages)

- **Static typing mandatory**: every public parameter and return typed. `any`/`Any` requires justification comment.
- **Immutability by default**: prefer immutable data structures. Forbidden: mutable default arguments.
- **State in smallest scope**: local > instance > module > global. Mutable globals forbidden. Dependencies injected by parameter.
- **Side effects explicit in name and signature**: IO, persistent mutation, network call, disk/DB write must be obvious from the function name.
- **Separate pure computation from IO**: pure logic at the core, side effects at the edges.
- **One layer of magic**: stacked decorators, metaclasses, monkey-patching, macro abuse prohibited without registered justification.

### Documentation (all languages)

- **Every complex public function/class has a docstring or JSDoc**: first line imperative, max 80 chars. Document raised exceptions. Keep aligned with KISS/DRY — simple functions need less.
- **Module/file header**: every public module starts with 1-3 line comment explaining responsibility and what does NOT belong here.

### Security (all languages)

- **Zero secrets in code**: no credentials, tokens, private keys, hardcoded connection strings with passwords in the repository.
- **Load secrets from environment**: use env vars or a secrets manager. Never hardcode.
- **Validate at the boundary**: all external input validated and typed at entry points.
- **No injection**: never build SQL, shell, LDAP, XPath, or regex via concatenation/f-string/template literal with external input.
- **Logs without PII or secrets**: never log passwords, tokens, CPF, credit cards, full emails, or auth payloads.
- **Audited and pinned dependencies**: every new dependency requires justification. Pin exact version.

### Performance, memory and IO (all languages)

- **Measure before optimizing**: no optimization without profiling.
- **Streaming over full load**: generators, streams, server-side cursors for large collections.
- **IO in batch and controlled concurrency**: no N+1 queries.
- **Resources always closed**: use structured resource management (`with`, `using`, `try-with-resources`).
- **Appropriate data structures**: key lookup: hash map/set (O(1)), not list scan (O(n)).
- **Large file downloads with resume flag**: file >100MB must include resume capability (`wget -c`, `curl -C -`).
- **Batch progress**: for long-running batch operations, use a progress display mechanism.

### Math and numeric correctness (all languages)

- **Money never in float**: use the language's exact numeric type.
- **Numeric comparison with tolerance**: never `a == b` between floats. Use language-appropriate epsilon comparison.
- **No silent mathematical simplification**: document max error, validity domain, and impact when approximating.
- **Explicit units and dimensions**: show units in name (`amount_usd`, `duration_seconds`) or type.
- **Controllable randomness with seed**: always accept `seed` as parameter.

### Testing and coverage (all languages)

- **Tests simultaneous with implementation**: no test = no delivery. When viable, write test first (TDD).
- **No fake tests**: never modify a test to make it pass when failure indicates a real bug.
- **Deterministic and isolated**: no network, real clock, execution order, global filesystem, or shared state.
- **Cover error paths and boundaries**: branches, exception paths, domain boundaries.
- **Respect the pyramid**: majority unit tests, middle integration, thin end-to-end.
- **Minimum coverage**: Q3 answer per source file (default 75%). No file delivered below minimum.

### Tooling, lint and static quality (all languages)

- **Warnings are errors**: zero warnings from first commit. Linter and static analysis blocking on violation.
- **Zero static type errors**: resolve 100% of diagnostics before delivering. Suppression only with specific rule code and justification.
- **Markdownlint zero errors**: every `.md` file passes without errors.
- **Discoverable helpers and utilities index**: maintain canonical location of utilities in `AGENTS.md`. Consult before creating new helper.

---

## SECTION 3.A — Python appendum

*Apply in addition to Section 3 when writing Python.*

- **Pythonic by definition**: use the language as intended — clarity, simplicity, idiomatic forms.
- **Dispatch tables**: 3+ branches by type → dispatch `dict`. Avoid long `if/elif` chains.
- **Dataclasses for data, functions for stateless behavior**: no single-method classes with no state.
- **Pythonic expressions**: comprehensions over manual loops. `dict`/`set` for lookup. `enumerate`, `zip`, `itertools` over index manipulation.
- **Pydantic for data models**: use Pydantic to define classes, validate structures, and type external data automatically.
- **Immutability**: prefer `tuple` over `list`, `frozenset` over `set`, `@dataclass(frozen=True)`.
- **Specific exception capture**: `except ExactError as e:`. Never bare `except:` or `except Exception:` without re-raise.
- **Typed domain errors**: `AppError` → `ValidationError`, `IntegrityError`, `ExternalServiceError`. Never raise bare `Exception`.
- **Google-style docstrings**: sections: `Args`, `Returns`, `Yields`, `Raises`, `Example`, `Note`. First line imperative.
- **Module docstring**: every public module starts with 1-3 line docstring.
- **`load_dotenv()` before first `os.getenv()`**: in every script using credentials.
- **Money**: `decimal.Decimal` with defined precision context.
- **Float comparison**: `math.isclose(a, b, rel_tol=1e-9)`.
- **Progress display**: use `rich` for batch progress — description, total, elapsed visible.
- **Tools**: `ruff check --fix . && ruff format .`, `mypy`/`pyright`, `bandit` — all zero warnings before delivery.
- **Pylance/Pyright**: zero errors and warnings. Suppression only with specific rule code + justification comment.
- **Max function length**: 60 lines as guideline. If you need "and" to describe it, split it.
- **Test quality**: test scripts must also be Pythonic, clean, and Pylance-proof.

---

## SECTION 3.B — TypeScript / JavaScript appendum

*Apply in addition to Section 3 when writing TypeScript or JavaScript. Prefer TypeScript.*

- **Strict TypeScript**: `strict: true` in `tsconfig.json`. No `any` without justification comment. Use `unknown` for untyped external input.
- **No `var`**: always `const`. Use `let` only when re-assignment is unavoidable and justified.
- **Explicit return types**: every public function and exported member typed explicitly.
- **Immutability**: `as const` for literal objects/arrays. `Readonly<T>` and `ReadonlyArray<T>` for function parameters.
- **Discriminated unions over class hierarchies**: for typed error/state modeling.
- **Zod for boundary validation**: validate all external input (API responses, env vars, form data) with Zod schemas.
- **No `console.log` in production code**: use a structured logger. Remove debug logs before delivery.
- **Error handling**: typed `Error` subclasses. Propagate or handle explicitly — never swallow.
- **ESLint + Prettier**: zero lint warnings. Format applied before delivery. Config in project root.
- **Tests**: Jest or Vitest. Same coverage rules as Section 3. `@testing-library` for UI components.
- **Async**: always `async/await`. No raw `.then()/.catch()` chains except at the outermost boundary.
- **Bundle analysis**: no new heavy dependency without bundle size justification.
- **Max function length**: 60 lines as guideline. Component render functions may be longer only if purely declarative JSX.

---

## SECTION 3.C — Markdown appendum

*Apply in addition to Section 3 when writing or editing `.md` files.*

- **markdownlint zero errors**: every `.md` file passes `markdownlint` before delivery.
- **H1 matches document intent**: every document starts with a single H1 matching its purpose.
- **Sequential heading levels**: never skip levels (e.g., H2 → H4 is forbidden).
- **Tables have header separator row**: delimiter row with at least two dashes per column.
- **Links must be valid**: no broken relative or absolute links. Anchor links must match heading text.
- **Max line length**: 120 characters unless configured otherwise.
- **Correct table format**: Write tables with `Delimiter Row` / `Header Separator` including only two dashes per column. Dashes cost tokens. Example with 3 columns: | -- | -- | -- |
- **Always declare what is inside Fenced Code Blocks**: `Programming langagues and scripting`: python, javascript, typescript, java, csharp, cpp, c, go, rust, ruby, php, swift, kotlin, scala, dart, perl, lua, haskell, clojure, elixir, erlang, ocaml, fsharp, r, matlab, julia, sas, stata, bash, sh, zsh, powershell, bat, awk, sed, assembly, nasm, wasm. | `Data formats, configuration and notes`: json, xml, yaml, toml, csv, ini, html, css, scss, sass, less, markdown, md. | `Queries and databases`: sql, mysql, postgresql, plsql, tsql, graphql, cypher, mongodb, kql, promql, elasticsearch. | `Diagrams and Code graphics`: mermaid, plantuml, dot, d3, svg, vega, vega-lite. | `Text, logs and system output`: text, plaintext, txt, console, shell-session, log, diff, ascii-art. | `Attributes and Metadata`: title, showLineNumbers, line-numbers, highlight-lines.

---

## SECTION 3.D — HTML / CSS appendum

*Apply in addition to Section 3 when writing HTML or CSS.*

- **Valid HTML5**: no deprecated tags (`<font>`, `<center>`, `<b>` as presentational).
- **Semantic tags**: use `<nav>`, `<main>`, `<article>`, `<aside>`, `<section>`, `<header>`, `<footer>` appropriately.
- **No inline styles for static values**: use CSS classes. Inline `style` only for runtime-dynamic values.
- **CSS custom properties for theming**: all colors, sizes, spacing in `--variables`.
- **Consistent naming methodology**: BEM or project-established convention. No mixed methodologies.
- **Accessibility mandatory**: `alt` text on images, `aria-label` on icon-only buttons, keyboard-navigable interactive elements, WCAG AA minimum contrast.
- **No unused CSS selectors**: remove dead rules. Use PurgeCSS or equivalent in build.
- **stylelint zero errors**: run before delivery.
- **Mobile-first media queries**: base styles for small screens, progressively enhanced.

---

## SECTION 4 — WHEN FINISHING A TASK (trigger: agent completes implementation)

### Mandatory post-task checklist

Silently verify before delivering (print only failures):

1. Ambiguities resolved via question, not assumption?
2. Out-of-scope changes authorized?
3. Read everything being delivered?
4. No generic `except`, `pass` in exception, or unauthorized fallback?
5. Helpers searched before created? In canonical location?
6. Names reveal purpose and unit? No `data2`, `temp`, `final`?
7. Every public function has correct documentation?
8. Full typing, zero static type errors, suppressions authorized and justified?
9. New tests cover error paths, written simultaneously, no mock-tricks?
10. No secret, PII in log, concatenated SQL, or unvalidated input?
11. Every script using credentials loads secrets from env first?
12. Large collections loaded entirely? N+1 IO? Resources without structured close on exception path?
13. Batch operation uses progress display with required params?
14. Large file download includes resume flag?
15. Long execution: alerted user, proposed checkpoint, idempotence, atomic write, resume?
16. Float for money, `==` between floats, randomness without seed?
17. Markdownlint passed on every altered `.md`?
18. Linter and formatter clean? (language-appropriate tools)
19. Non-trivial decisions and deviations listed in response?

### Post-task actions

1. Update `CONTEXT.md` if architectural decisions or technical debt changed.
2. Update plan document — mark completed items with [x] and timestamp.
3. Release file locks in `SESSION.db`.
4. Report to user: what was done, what to validate, any deviations (minimum tokens).

---

## SECTION 5 — MODEL ROUTING AND ESCALATION

### Task-based model routing

| Task type | Model | Authorization |
| -- | -- | -- |
| Planning | Q4.1 answer | — |
| Coding | Q4.2 answer | — |
| Simple commands, doc updates, user Q&A | Q4.3 answer | Autonomous downgrade |
| Escalation | Q4.4 answer | **User approval required** |

After a trivial task: return to planning/coding model automatically.

### What counts as a trivial task (autonomous downgrade)

- Updating documentation or comments
- Checking implementation vs plan
- Answering questions without code changes
- Executing commands and reporting results
- Read-only queries and inspections

### Retry escalation protocol

When the agent has failed to resolve **the same problem** after reaching the configured retry threshold (default: 3, set in Q5):

1. Stop attempting with the current model.
2. Inform the user using interactive selector: `"I have attempted this [N] times without success. I can escalate to [Q4.4 model]. Approve? - Yes | - No, keep trying - Cancel activity."`
3. Wait for explicit approval before switching.
4. After resolving: return to default model for subsequent tasks.
5. Each new problem resets the attempt counter.

If escalation is disabled (Q5), inform the user of the repeated failure and ask how to proceed — do not switch models autonomously.

---

## SECTION 6 — RESILIENCE FOR LONG EXECUTIONS

Any script/job with estimated time >5 minutes, many items, or significant IO:

1. Alert user about interruption risk before implementing.
2. Present resilience plan: duration estimate, checkpoint points, state format, resume and Ctrl+C behavior.
3. Wait for confirmation before coding.
4. Implement: idempotent processing per item, incremental persistence, atomic output via write-temp-then-rename, graceful shutdown via signal handling, retry with exponential backoff and ceiling, explicit memory limits.

---

## SECTION 7 — COST AND AUTHORIZATION CONTROL

- Never execute API calls without explicit user confirmation before execution.
- Never run batch scripts or pipelines automatically without explicit user approval listing scripts, order, and estimated cost.
- Exception: read-only scripts without side effects may run without additional confirmation when user already requested the verification.
- Destructive IO/script operations (delete, overwrite, reset) always require explicit authorization.

---

## SECTION 8 — MULTI-AGENT CONCURRENCY CONTROL

### Session tracking via SQLite

File: `SESSION.db` in project root.

```sql
CREATE TABLE IF NOT EXISTS session_locks (
    file_path     TEXT PRIMARY KEY,
    agent_id      TEXT NOT NULL,
    task_desc     TEXT,
    status        TEXT DEFAULT 'in_progress',
    locked_at     TEXT NOT NULL,
    completed_at  TEXT
);
```

### Agent protocol

All lock operations are handled by pre-installed scripts in `.agents/scripts/`. Agents never implement lock logic inline — they call the scripts via Bash tool.

**Before starting work on any file:**

```bash
python .agents/scripts/acquire_lock.py "<file_path>" "<task_desc>"
```

- Exit code `0` — lock acquired. Proceed.
- Exit code `1` — file is locked by another agent. Work on another file and inform user. If no other file is available for the current task, inform user and stop.
- Exit code `2` — usage error (check arguments).

**After completing work on a file:**

```bash
python .agents/scripts/release_lock.py "<file_path>"
```

**Lock `CONTEXT.md` too**: acquire a lock on `CONTEXT.md` before writing to it — same protocol as any other file. This prevents silent write conflicts when multiple agents update context simultaneously.

**Agent identity**: resolve `agent_id` via env var `AGENT_ID` if set; otherwise generate a UUID once per session with `str(uuid.uuid4())` and reuse it for all locks in that session. Scripts read `AGENT_ID` automatically.

**Hook coverage**: the `.claude/settings.json` hooks automate part of this protocol (see Section 13):

| Hook event | Script | What it does |
| -- | -- | -- |
| `PreToolUse:Write` | `check_lock.py` | Blocks writes to locked files before they happen |
| `PreToolUse:Bash` | `guard_bash.py` | Warns on dangerous shell patterns |
| `PostToolUse:Write` | `log_write.py` | Appends write to session audit log |
| `PostToolUse:Bash` | `log_bash.py` | Appends command + exit code to audit log |
| `Stop` | `release_locks.py` | Releases all locks owned by this agent on session end |

The agent still calls `acquire_lock.py` explicitly (to declare intent before a task cluster) and `release_lock.py` explicitly (to release individual files mid-task). The hooks complement rather than replace explicit acquisition.

---

## SECTION 9 — MEMORY AND CONTEXT

### CONTEXT.md structure

```markdown
# Project Context

## Architecture decisions

## Technical debt

## Current project state

## Authorized fallbacks

## Utility index
| Domain | Location |
| -- | -- |
```

### Update rules

- Read `CONTEXT.md` at the start of every planning or complex coding session.
- Update only when: new architectural decision, new technical debt, significant state change, new authorized fallback.
- Keep lean — read every session. Avoid verbosity.

---

## SECTION 10 — RUNNING TESTS

At the end of a big implementation or major refactor, run tests with coverage. Alert user if any test fails or if coverage is below minimum user-defined threshold `Q3`.

Use the project's configured test runner (e.g. `pytest --cov` for Python, `vitest run --coverage` for TypeScript). Never silence failing tests. Report: number of tests run, failed, coverage percentage, and which files are below threshold.

---

## SECTION 11 — CODE REVIEW (trigger: user asks to review, audit, or check code)

### Pre-review setup

1. Read `CONTEXT.md` for project conventions and authorized deviations.
2. Read `CLAUDE.md` for project-specific thresholds (coverage %, typing requirements).
3. Identify and confirm review scope: single file, PR diff, or full module.
4. **Never modify files during a review pass.** Only report with precise and objective diagnostic, marked with numbered itens. Never output codes or premature solutions. User should decide what fixes are priority and If fixes are requested after the review, follow Section 3 rules.

### Review dimensions (check all)

1. **Correctness** — logic errors, off-by-one, missing edge cases, wrong algorithm, incorrect assumptions.
2. **Security** — SQL/shell injection, hardcoded secrets, PII in logs, unvalidated input, missing auth checks.
3. **Code hygiene** — dead code, vague names, YAGNI violations, unnecessary abstraction, AI slop.
4. **Type safety** — missing types, untyped `any`/`Any`, improper casts, wrong type at boundary.
5. **Error handling** — silently swallowed errors, missing propagation, bare generic catches.
6. **Test coverage** — untested paths, fake tests, insufficient boundary coverage.
7. **Performance** — N+1 queries, unbounded loops, full in-memory load of large collections.
8. **Documentation** — missing docstrings, outdated comments, broken references.
9. **Dependencies** — unpinned, unjustified new deps, license risk.

### Severity levels

| Level | Meaning |
| -- | -- |
| `BLOCKING` | Must be fixed before delivery — security issue, correctness bug, data loss risk |
| `REQUIRED` | Must be fixed — missing types, missing tests, code hygiene violation |
| `SUGGESTED` | Recommended but optional — style, minor refactors, minor perf |
| `NOTE` | Informational only — no action required |

### Report format

````markdown
## Code Review — [file or PR] — [date]

### Summary
[1–3 sentence overall assessment.]

### Findings
| Severity | File | Line | Issue |
| -- | -- | -- | -- |
| BLOCKING | auth.py | 42 | SQL built via f-string with user input |
| REQUIRED | utils.py | 18 | Missing return type on public function |
| SUGGESTED | models.py | 91 | Extract to helper — third occurrence |

### Details

#### BLOCKING — auth.py:42 — SQL injection
> Code: `query = f"SELECT * FROM users WHERE id = {user_id}"`
> Issue: User-controlled input directly interpolated into SQL string.
> Fix: Use parameterised query.
````

### Review rules

- Group findings by file for readability.
- Be specific: cite line numbers, quote problematic code.
- Do not re-flag items explicitly authorized in `CONTEXT.md` as authorized deviations.
- After a complete review, summarize: total `BLOCKING`, `REQUIRED`, `SUGGESTED` counts.

---

## SECTION 12 — WIZARD INSTALLER SCRIPT

When the user says "install agent framework":

```text
Step 1:  Run Q1-Q9 wizard questions (one at a time, wait for each answer).
Step 2:  Create CLAUDE.md (stub) from template below.
Step 3:  Create AGENTS.md from template below.
Step 4:  Create .agents/INDEX.md from template below.
Step 5:  Create .agents/planning.md — compose from Section 1 + Section 2 + context update rules from Section 9.
Step 6:  Create .agents/coding.md — compose from Section 1 + Section 3 (core) + applicable appendums:
         - Always include Section 3.C (Markdown) and 3.D (HTML/CSS).
         - Include Section 3.A (Python) if Q2 includes Python.
         - Include Section 3.B (TypeScript/JS) if Q2 includes TypeScript/JavaScript.
Step 7:  Create .agents/reviewing.md — compose from Section 1 + Section 11.
Step 8:  Create .agents/testing.md — compose from Section 1 + Section 10 + "Testing and coverage" subsection from Section 3.
Step 9:  Create .agents/finishing.md — compose from Section 1 + Section 4 + Section 5 + Section 7.
Step 10: Create .agents/concurrency.md — compose from Section 6 + Section 8 + Section 13.
Step 11: Create CONTEXT.md with empty sections from template below.
Step 12: Create SESSION.db with schema from Section 8.
Step 13: Create .claude/settings.json from template below.
Step 14: Create .agents/scripts/acquire_lock.py from template below.
Step 15: Create .agents/scripts/release_lock.py from template below.
Step 16: Create .agents/scripts/release_locks.py from template below.
Step 17: Create .agents/scripts/check_lock.py from template below.
Step 18: Create .agents/scripts/guard_bash.py from template below.
Step 19: Create .agents/scripts/log_write.py from template below.
Step 20: Create .agents/scripts/log_bash.py from template below.
Step 21: Create .agents/scripts/session_status.py from template below.
Step 22: If Q9 ≠ "Claude Code only" — create .vscode/tasks.json from template below.
         Add .github/copilot-instructions.md stub if Q9 includes Copilot.
Step 23: If Q9.1 = Yes — create .git/hooks/pre-commit from template below and make executable.
Step 24: Report all files created.
Step 25: Ask if user wants to review any file.
```

> **Composition instruction**: when the step says "compose from Section X + Section Y", read those sections
> from this file verbatim and write them sequentially into the output file, preceded by the file header below.
> Always include the `## Always-active rules` block (Section 1) at the top of task files so each file is self-contained.

### CLAUDE.md template

```markdown
# CLAUDE.md — [PROJECT NAME]

> Generated by AGENT_FRAMEWORK.md wizard on [DATE].
> To regenerate: re-run the installer (`install agent framework`).

## Project

- Type: [Q1]
- Languages: [Q2]
- Test coverage minimum: [Q3]%
- Documentation language: [Q6]

## Model assignments

| Task type | Model |
| -- | -- |
| Planning | [Q4.1] |
| Coding | [Q4.2] |
| Simple commands / user Q&A | [Q4.3] |
| Escalation (top model) | [Q4.4] |

## Escalation policy

[Q5 — enabled/disabled and threshold]

## Active agents

[Q7]

## Memory strategy

[Q8]

## Canonical utility locations

| Domain | Location |
| -- | -- |
| (to be filled) | |

## Authorized fallbacks

(none)

## Quick reference

| Need | Read |
| -- | -- |
| Behavioral rules | `AGENTS.md` |
| Task instructions | `.agents/INDEX.md` |
| Project context | `CONTEXT.md` |
```

### AGENTS.md template

```markdown
# AGENTS.md — [PROJECT NAME]

> Always read this file. Contains always-active behavioral rules for all tasks.
> For task-specific rules, read `.agents/INDEX.md` and follow the dispatch.

## Always-active rules

### Output minimization

- Respond with minimum tokens needed. No preamble, no repetition, no closing summaries.
- Never thank the user for reaching out. Never encourage further engagement.
- One question per response maximum. Ask before assuming.

### Ambiguity handling

- If information, specification, or intent is missing or ambiguous: **stop and ask**. Do not infer intent, choose "the most common path", or invent plausible defaults.
- Do: `"Column user_id appears as int in schema A and str in schema B. Which is the source of truth?"`
- Don't: assume `int` because "IDs are usually integers" and proceed.

### Scope control

- When encountering out-of-pattern existing code: alert and propose, only change after explicit confirmation. Maintain task scope.
- Every non-trivial technical decision (new dependency, public signature change, fallback use, schema migration) must be listed in the response with justification.

### Self-review before delivery

- Re-read everything generated before delivering. Focus on error paths, edge cases, auth, simplicity, error handling, proper documentation, adequate testing and protecting user data.
- Never deliver a snippet you cannot explain line by line.

## Utility locations

(filled during project setup or as helpers are created)

| Domain | Location |
| -- | -- |
| (to be filled) | |
```

### .agents/INDEX.md template

```markdown
# .agents/INDEX.md — [PROJECT NAME]

> Always read CLAUDE.md and AGENTS.md first.
> Then read exactly ONE file from this table based on your current task.
> Never load all files on a single run.

## Dispatch

| When you are... | Read |
| -- | -- |
| Planning, designing architecture, or creating `.md` plan documents | `.agents/planning.md` |
| Writing, modifying, or refactoring code | `.agents/coding.md` |
| Reviewing code — PR review, audit, checking an implementation | `.agents/reviewing.md` |
| Writing or running tests, checking coverage | `.agents/testing.md` |
| Finishing a task, releasing locks, reporting to user | `.agents/finishing.md` |
| Multi-agent coordination, concurrent sessions, long-running jobs | `.agents/concurrency.md` |
```

### .agents/ file headers

Each task file is composed from Section 1 plus the relevant sections (see composition instructions). Prefix each file with the appropriate header:

**planning.md header:**

```markdown
# .agents/planning.md — [PROJECT NAME]

> Read when: planning, designing architecture, or creating `.md` plan documents.
> Always read CLAUDE.md and AGENTS.md first.

```

**coding.md header:**

```markdown
# .agents/coding.md — [PROJECT NAME]

> Read when: writing, modifying, or refactoring code.
> Always read CLAUDE.md and AGENTS.md first.
> Language appendums: apply only the sections that match [Q2].

```

**reviewing.md header:**

```markdown
# .agents/reviewing.md — [PROJECT NAME]

> Read when: reviewing code, auditing a PR, or checking an implementation.
> Always read CLAUDE.md and AGENTS.md first.

```

**testing.md header:**

```markdown
# .agents/testing.md — [PROJECT NAME]

> Read when: writing or running tests, checking coverage.
> Always read CLAUDE.md and AGENTS.md first.

```

**finishing.md header:**

```markdown
# .agents/finishing.md — [PROJECT NAME]

> Read when: completing a task, releasing locks, or reporting to user.
> Always read CLAUDE.md and AGENTS.md first.

```

**concurrency.md header:**

```markdown
# .agents/concurrency.md — [PROJECT NAME]

> Read when: working in multi-agent mode, managing SESSION.db, or running long jobs.

```

### CONTEXT.md template

```markdown
# Project Context

## Architecture decisions

## Technical debt

## Current project state

## Authorized fallbacks

## Utility index

| Domain | Location |
| -- | -- |
```

### .claude/settings.json template

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write",
        "hooks": [
          {
            "type": "command",
            "command": "python .agents/scripts/check_lock.py \"$TOOL_INPUT_PATH\" 2>/dev/null || echo 'WARNING: File may be locked by another agent'"
          }
        ]
      },
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "python .agents/scripts/guard_bash.py \"$TOOL_INPUT_COMMAND\" 2>&1 || true"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Write",
        "hooks": [
          {
            "type": "command",
            "command": "python .agents/scripts/log_write.py \"$TOOL_INPUT_PATH\" \"$TOOL_RESPONSE_STATUS\" 2>/dev/null || true"
          }
        ]
      },
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "python .agents/scripts/log_bash.py \"$TOOL_INPUT_COMMAND\" \"$TOOL_RESPONSE_EXIT_CODE\" 2>/dev/null || true"
          }
        ]
      }
    ],
    "Stop": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "python .agents/scripts/release_locks.py 2>/dev/null || true"
          }
        ]
      }
    ]
  }
}
```

### .agents/scripts/check_lock.py template

```python
"""Check whether a file is locked in SESSION.db before a write operation."""
import re
import sqlite3
import sys

# Only allow characters safe in filesystem paths; reject anything that could inject shell commands.
_SAFE_PATH_RE = re.compile(r'^[\w./\-\\ :@#()+,=\[\]{}]+$')


def main() -> None:
    path = sys.argv[1] if len(sys.argv) > 1 else ""
    if not path or not _SAFE_PATH_RE.match(path):
        sys.exit(0)  # Cannot safely validate; allow write to proceed.
    try:
        with sqlite3.connect("SESSION.db") as conn:
            row = conn.execute(
                "SELECT status FROM session_locks WHERE file_path = ?", (path,)
            ).fetchone()
        if row and row[0] == "in_progress":
            sys.exit(1)
    except Exception:
        pass
    sys.exit(0)


if __name__ == "__main__":
    main()
```

### .agents/scripts/release_locks.py template

```python
"""Release all in-progress locks owned by the current agent at session stop."""
import datetime
import os
import sqlite3


def main() -> None:
    agent_id = os.environ.get("AGENT_ID", "unknown")
    try:
        with sqlite3.connect("SESSION.db") as conn:
            conn.execute(
                "UPDATE session_locks SET status = 'done', completed_at = ? "
                "WHERE status = 'in_progress' AND agent_id = ?",
                (datetime.datetime.utcnow().isoformat(), agent_id),
            )
            conn.commit()
    except Exception:
        pass


if __name__ == "__main__":
    main()
```

### .agents/scripts/acquire_lock.py template

```python
"""Acquire an exclusive lock on a file in SESSION.db.

Usage: python acquire_lock.py <file_path> <task_desc>

Exit codes:
  0 — lock acquired successfully
  1 — file is locked by another agent (do not proceed)
  2 — usage error
"""
import datetime
import os
import re
import sqlite3
import sys
import uuid

_SAFE_PATH_RE = re.compile(r'^[\w./\-\\ :@#()+,=\[\]{}]+$')
_DB_PATH = "SESSION.db"
_MAX_RETRIES = 2


def main() -> None:
    if len(sys.argv) < 3:
        print("Usage: acquire_lock.py <file_path> <task_desc>", file=sys.stderr)
        sys.exit(2)

    file_path, task_desc = sys.argv[1], sys.argv[2]

    if not _SAFE_PATH_RE.match(file_path):
        # Unsafe path characters — warn and allow to proceed rather than block.
        print(f"WARNING: Cannot safely lock path '{file_path}' — special characters.", file=sys.stderr)
        sys.exit(0)

    agent_id = os.environ.get("AGENT_ID") or str(uuid.uuid4())

    try:
        with sqlite3.connect(_DB_PATH) as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS session_locks (
                    file_path TEXT PRIMARY KEY, agent_id TEXT NOT NULL,
                    task_desc TEXT, status TEXT DEFAULT 'in_progress',
                    locked_at TEXT NOT NULL, completed_at TEXT
                )
            """)
            for _ in range(_MAX_RETRIES):
                try:
                    conn.execute(
                        "INSERT INTO session_locks VALUES (?, ?, ?, 'in_progress', ?, NULL)",
                        (file_path, agent_id, task_desc, datetime.datetime.utcnow().isoformat()),
                    )
                    conn.commit()
                    sys.exit(0)  # Lock acquired.
                except sqlite3.IntegrityError:
                    row = conn.execute(
                        "SELECT status, agent_id FROM session_locks WHERE file_path = ?",
                        (file_path,),
                    ).fetchone()
                    if row and row[0] == "done":
                        # Stale lock — clean and retry.
                        conn.execute("DELETE FROM session_locks WHERE file_path = ?", (file_path,))
                        conn.commit()
                        continue
                    owner = row[1] if row else "unknown"
                    print(f"LOCKED: '{file_path}' is locked by agent '{owner}'.", file=sys.stderr)
                    sys.exit(1)
    except Exception as exc:
        print(f"WARNING: Lock acquisition failed: {exc}", file=sys.stderr)
        sys.exit(0)  # Fail open.

    sys.exit(1)  # Exhausted retries.


if __name__ == "__main__":
    main()
```

### .agents/scripts/release_lock.py template

```python
"""Release the lock held by this agent on a single file.

Usage: python release_lock.py <file_path>
"""
import datetime
import os
import sys
import sqlite3

_DB_PATH = "SESSION.db"


def main() -> None:
    if len(sys.argv) < 2:
        print("Usage: release_lock.py <file_path>", file=sys.stderr)
        sys.exit(1)

    file_path = sys.argv[1]
    agent_id = os.environ.get("AGENT_ID", "unknown")

    try:
        with sqlite3.connect(_DB_PATH) as conn:
            conn.execute(
                "UPDATE session_locks SET status = 'done', completed_at = ? "
                "WHERE file_path = ? AND agent_id = ?",
                (datetime.datetime.utcnow().isoformat(), file_path, agent_id),
            )
            conn.commit()
    except Exception as exc:
        print(f"WARNING: Could not release lock: {exc}", file=sys.stderr)


if __name__ == "__main__":
    main()
```

### .agents/scripts/guard_bash.py template

```python
"""Warn (non-blocking) on dangerous shell command patterns before execution.

Called by PreToolUse:Bash hook. Always exits 0 — warns only, never blocks.
Usage: python guard_bash.py <command>
"""
import re
import sys

# Pattern, human-readable description.
_DANGEROUS: list[tuple[re.Pattern[str], str]] = [
    (re.compile(r'\brm\b.*\B-\w*[rf]\w*\b|\brm\b\s+-rf\b'), "recursive force delete (rm -rf)"),
    (re.compile(r'\bgit\s+push\b.*--force\b'), "force push (git push --force)"),
    (re.compile(r'\bgit\s+reset\s+--hard\b'), "hard reset (git reset --hard)"),
    (re.compile(r'\bgit\s+clean\b.*-f\b'), "force clean (git clean -f)"),
    (re.compile(r'\bgit\s+push\b.*--delete\b'), "remote branch delete"),
    (re.compile(r'\bDROP\s+(TABLE|DATABASE|SCHEMA)\b', re.IGNORECASE), "destructive SQL DDL"),
    (re.compile(r'\bTRUNCATE\s+TABLE\b', re.IGNORECASE), "TRUNCATE TABLE"),
    (re.compile(r'\bchmod\b.*\b777\b'), "world-writable permissions (chmod 777)"),
]


def main() -> None:
    command = sys.argv[1] if len(sys.argv) > 1 else ""
    for pattern, description in _DANGEROUS:
        if pattern.search(command):
            print(
                f"WARNING: Dangerous command detected — {description}. "
                "Requires explicit user approval before proceeding.",
                file=sys.stderr,
            )
    sys.exit(0)  # Never block — warn only.


if __name__ == "__main__":
    main()
```

### .agents/scripts/log_write.py template

```python
"""Append a write record to the session audit log.

Called by PostToolUse:Write hook.
Usage: python log_write.py <file_path> [<status>]
"""
import datetime
import os
import sys
from pathlib import Path

_LOG_DIR = Path(".agents/logs")


def main() -> None:
    file_path = sys.argv[1] if len(sys.argv) > 1 else "unknown"
    status = sys.argv[2] if len(sys.argv) > 2 else "ok"
    agent_id = os.environ.get("AGENT_ID", "unknown")
    try:
        _LOG_DIR.mkdir(parents=True, exist_ok=True)
        log_file = _LOG_DIR / f"session-{datetime.date.today().isoformat()}.log"
        ts = datetime.datetime.utcnow().isoformat(timespec="seconds")
        with log_file.open("a") as fh:
            fh.write(f"{ts} WRITE agent={agent_id} status={status} path={file_path}\n")
    except Exception:
        pass


if __name__ == "__main__":
    main()
```

### .agents/scripts/log_bash.py template

```python
"""Append a bash command record to the session audit log.

Called by PostToolUse:Bash hook.
Usage: python log_bash.py <command> [<exit_code>]
"""
import datetime
import os
import sys
from pathlib import Path

_LOG_DIR = Path(".agents/logs")
_MAX_CMD_LEN = 200  # Truncate very long commands to keep the log readable.


def main() -> None:
    command = sys.argv[1] if len(sys.argv) > 1 else "unknown"
    exit_code = sys.argv[2] if len(sys.argv) > 2 else "?"
    agent_id = os.environ.get("AGENT_ID", "unknown")
    truncated = command[:_MAX_CMD_LEN] + "…" if len(command) > _MAX_CMD_LEN else command
    try:
        _LOG_DIR.mkdir(parents=True, exist_ok=True)
        log_file = _LOG_DIR / f"session-{datetime.date.today().isoformat()}.log"
        ts = datetime.datetime.utcnow().isoformat(timespec="seconds")
        with log_file.open("a") as fh:
            fh.write(f"{ts} BASH agent={agent_id} exit={exit_code} cmd={truncated!r}\n")
    except Exception:
        pass


if __name__ == "__main__":
    main()
```

### .agents/scripts/session_status.py template

```python
"""Print the current SESSION.db lock table — which files are locked and by which agents.

Usage: python session_status.py
"""
import sqlite3
import sys
from pathlib import Path

_DB_PATH = "SESSION.db"


def main() -> None:
    if not Path(_DB_PATH).exists():
        print("SESSION.db not found — no active sessions.")
        return
    try:
        with sqlite3.connect(_DB_PATH) as conn:
            rows = conn.execute(
                "SELECT file_path, agent_id, task_desc, status, locked_at "
                "FROM session_locks ORDER BY locked_at DESC"
            ).fetchall()
        if not rows:
            print("No locks in SESSION.db.")
            return
        print(f"{'Status':<12} {'Agent':<22} {'Locked at':<20} File")
        print("-" * 90)
        for file_path, agent_id, task_desc, status, locked_at in rows:
            print(f"{status:<12} {agent_id[:22]:<22} {locked_at[:19]:<20} {file_path}")
    except Exception as exc:
        print(f"Error reading SESSION.db: {exc}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
```

### .vscode/tasks.json template *(create if Q9 ≠ "Claude Code only")*

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "agent: view session status",
      "type": "shell",
      "command": "python .agents/scripts/session_status.py",
      "group": "none",
      "presentation": { "reveal": "always", "panel": "shared" }
    },
    {
      "label": "agent: release my locks",
      "type": "shell",
      "command": "python .agents/scripts/release_locks.py",
      "group": "none",
      "presentation": { "reveal": "always", "panel": "shared" }
    },
    {
      "label": "agent: run coverage",
      "type": "shell",
      "command": "[Q2 Python: pytest --cov | Q2 TypeScript: npx vitest run --coverage]",
      "group": "test",
      "presentation": { "reveal": "always", "panel": "shared" }
    },
    {
      "label": "agent: check context",
      "type": "shell",
      "command": "cat CONTEXT.md",
      "group": "none",
      "presentation": { "reveal": "always", "panel": "shared" }
    }
  ]
}
```

*Substitute the correct `run coverage` command for Q2 language before writing the file.*

### .git/hooks/pre-commit template *(create if Q9.1 = Yes; `chmod +x .git/hooks/pre-commit`)*

```sh
#!/bin/sh
# Agent Framework — pre-commit hook
# Blocks commits on files actively locked by an agent and runs the linter.

set -e

if [ -f "SESSION.db" ]; then
    STAGED=$(git diff --cached --name-only 2>/dev/null)
    for f in $STAGED; do
        python .agents/scripts/check_lock.py "$f" 2>/dev/null
        if [ $? -ne 0 ]; then
            echo "ERROR: '$f' is locked by an active agent session."
            echo "       Run task 'agent: release my locks' or wait for the agent to finish."
            exit 1
        fi
    done
fi

# Linter (adjust command to project tooling):
# python: ruff check . && ruff format --check .
# typescript: npx eslint . --max-warnings 0

exit 0
```

### .github/copilot-instructions.md stub *(create if Q9 includes Copilot)*

```markdown
# GitHub Copilot Instructions — [PROJECT NAME]

> Generated by AGENT_FRAMEWORK.md wizard on [DATE].

## Before editing files

1. Read `CLAUDE.md` for project config and model assignments.
2. Read `AGENTS.md` for always-active behavioral rules.
3. Read `.agents/INDEX.md` and dispatch to the correct task file.
4. Run `python .agents/scripts/acquire_lock.py "<file_path>" "<task_desc>"` via terminal before editing.
   - Exit 0: proceed. Exit 1: file is locked — work on another file.

## After finishing a task

Run `python .agents/scripts/release_lock.py "<file_path>"` for each file you edited.
To see active session locks: use VS Code task "agent: view session status".
```

---

## SECTION 13 — HOOKS AND IDE INTEGRATION

### Claude Code hooks (`.claude/settings.json`)

Claude Code is the only tool with a native hook system. Hooks run shell commands automatically on tool events. All hooks call scripts from `.agents/scripts/` — no inline code.

| Hook event | Matcher | Script | Purpose |
| -- | -- | -- | -- |
| `PreToolUse` | `Write` | `check_lock.py` | Block writes to files actively locked by another agent |
| `PreToolUse` | `Bash` | `guard_bash.py` | Warn (non-blocking) on dangerous shell patterns |
| `PostToolUse` | `Write` | `log_write.py` | Append write record to session audit log |
| `PostToolUse` | `Bash` | `log_bash.py` | Append command + exit code to session audit log |
| `Stop` | `""` (all) | `release_locks.py` | Release all in-progress locks owned by this agent |

**Hook execution is warn-only except `PreToolUse:Write`**. A lock check failure returns exit code 1 (blocks the write). All other scripts exit 0 regardless — they warn but never block.

### Cursor integration

Cursor has no hook system. It participates in the lock protocol through:

1. **Instructions via `.cursorrules`** (or `.cursor/rules/`): direct Cursor to call `acquire_lock.py` and `release_lock.py` via its Bash tool before and after file edits.
2. **VS Code tasks** (`tasks.json`): Cursor can trigger named tasks (see below) — view session status, release locks, run coverage.
3. **`SESSION.db`**: Cursor reads and writes to the same SQLite database. Claude Code's `PreToolUse:Write` hook will catch any write Cursor attempts on a locked file (since they share the same filesystem).

### GitHub Copilot (VS Code) integration

Copilot has no hook system. It participates through:

1. **Workspace instructions** (`.github/copilot-instructions.md`): direct Copilot to read `.agents/INDEX.md` before each task and call lock scripts via terminal.
2. **VS Code tasks** (`tasks.json`): Copilot agent mode can invoke tasks. Add to `.github/copilot-instructions.md`: *"Before editing files, run the 'agent: acquire lock' task. After finishing, run 'agent: release my locks'."*
3. **`SESSION.db`**: same shared database — Claude Code hooks protect it at write time.

### VS Code tasks (`.vscode/tasks.json`)

Created when Q9 ≠ "Claude Code only". Enables Cursor and Copilot to interact with the framework via Ctrl+Shift+P → "Tasks: Run Task".

Tasks defined:

| Label | Command | Purpose |
| -- | -- | -- |
| `agent: view session status` | `session_status.py` | Show locked files and owning agents |
| `agent: release my locks` | `release_locks.py` | Release all locks owned by `$AGENT_ID` |
| `agent: run coverage` | Q2-specific test command | Run tests with coverage report |
| `agent: check context` | `cat CONTEXT.md` | Print current project context |

### Git hooks (`.git/hooks/pre-commit`)

Created when Q9.1 = Yes. Enforces safety for all agents equally — fires on every `git commit` regardless of which tool is being used.

**What `pre-commit` does:**

1. For each staged file, calls `check_lock.py` — blocks the commit if the file is actively locked by an agent (prevents committing in-progress work).
2. Optionally runs the project linter on staged files.

**Important**: Git hooks live in `.git/hooks/` which is not committed to the repository. The installer creates the file and makes it executable. Team members running a fresh clone must re-run the installer or manually copy the hook.

> To share git hooks with the team: use a tool like `husky` or `lefthook`, or add a `scripts/install-hooks.sh` and document it in README.

---

## CONFLICT RESOLUTION

When sections conflict: the more restrictive principle prevails.

---

## FRAMEWORK VERSION

Version: 1.2.0
Source: <https://github.com/LeoBR84p/agent-framework>
Adapted for: generic multi-project use
License: MIT - <https://leobr.site>
