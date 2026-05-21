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

1. Read `CONTEXT.md` — only `[active]` entries are relevant. Ignore `[resolved]` and `[superseded]`.
2. If `CONTEXT.md` line count exceeds the `context_max_lines` threshold in `CLAUDE.md` (default 150): run a prune pass before any other work — see Section 9 prune protocol.
3. Read `SESSION.db` to check if any relevant files are currently locked by another agent.
4. Ask clarifying questions before generating. Never assume scope.

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

1. Update `CONTEXT.md` if architectural decisions or technical debt changed — follow Section 9 update rules:
   - Before inserting any entry, scan for overlapping content. If found, update in place (change tag or text). Never duplicate.
   - `Current project state`: replace the entire section, never append.
   - Mark resolved debt or superseded decisions as `[resolved]` or `[superseded]` — never delete mid-session, let the prune pass clean them.
2. Update plan document — mark completed items with [x] and timestamp.
3. Release file locks in `SESSION.db`.
4. Report to user: what was done, what to validate, any deviations (minimum tokens).

---

## SECTION 5 — MODEL ROUTING AND ESCALATION

The agent never switches models autonomously. It assesses the task, makes a recommendation, and waits. The user controls the actual switch. This applies in both directions — cheaper and more capable.

### Configured models (set during wizard)

| Task type | Configured model |
| -- | -- |
| Planning | Q4.1 answer |
| Coding | Q4.2 answer |
| Simple tasks / user Q&A | Q4.3 answer |
| Escalation | Q4.4 answer |

### Pre-task assessment — recommend downgrade

Before starting any task, evaluate its complexity. If the task clearly fits the cheaper model (Q4.3) — answering a question, updating a comment, reading a file, running a command and reporting the result — open with:

> "This task looks simple enough for [Q4.3 model], which is faster and cheaper. Switch now and ask me to continue, or I'll proceed with the current model."

Then wait. Do not proceed until the user responds. If the user ignores the suggestion, proceed with the current model.

**What qualifies as a simple task:**

- Answering questions without code changes
- Updating documentation or comments only
- Checking implementation against a plan
- Running read-only commands and reporting results
- Summarizing or explaining existing code without modifying it

**What does not qualify (do not recommend downgrade):**

- Any file modification beyond comments or docs
- Tasks with ambiguous scope — assess first, then classify
- Planning sessions that may lead to implementation
- Anything that requires cross-file reasoning

### Failure escalation — recommend upgrade

When the agent has failed to resolve **the same problem** after reaching the retry threshold (default: 3, set in Q5):

1. Stop attempting. Do not try a fourth time.
2. Summarize what was attempted and why it failed.
3. Recommend upgrade:

> "I've attempted this [N] times without success. This problem may benefit from [Q4.4 model]. Switch and ask me to retry, or tell me how you'd like to proceed."

4. Wait for user response. Do not resume work on the same problem until the user either switches model and asks again, or gives explicit instruction to continue with the current model.
5. Each new distinct problem resets the attempt counter.

If escalation is disabled (Q5), step 3 becomes: inform the user of the failure and ask how to proceed. Same stop-and-wait behavior.

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

CREATE TABLE IF NOT EXISTS session_intentions (
    intention_id  TEXT PRIMARY KEY,
    agent_id      TEXT NOT NULL,
    scope_summary TEXT NOT NULL,
    target_paths  TEXT NOT NULL,     -- JSON array of files and folders
    status        TEXT DEFAULT 'in_progress',  -- in_progress | completed | cancelled
    started_at    TEXT NOT NULL,
    completed_at  TEXT               -- NULL while open
);
```

### Agent identity

Resolve `agent_id` using the first available source, in order:

1. `AGENT_ID` environment variable (set by the user or CI).
2. `.agents/.session_id` file in the project root (read on first use; created with a new UUID if absent).

Scripts read this automatically. Never generate a fresh UUID per call — that breaks lock ownership across hook invocations.

### File lock protocol

All lock operations are handled by pre-installed scripts in `.agents/scripts/`. Agents never implement lock logic inline — they call the scripts via Bash tool.

**Before starting work on any file:**

```bash
python .agents/scripts/acquire_lock.py "<file_path>" "<task_desc>"
```

- Exit code `0` — lock acquired, or already held by this agent (idempotent). Proceed.
- Exit code `1` — file is locked by another agent. Work on another file and inform user. If no other file is available for the current task, inform user and stop.
- Exit code `2` — usage error (check arguments).

**After completing work on a file:**

```bash
python .agents/scripts/release_lock.py "<file_path>"
```

**Lock `CONTEXT.md` too**: acquire a lock on `CONTEXT.md` before writing to it — same protocol as any other file. This prevents silent write conflicts when multiple agents update context simultaneously.

**Hook coverage**: the `PreToolUse:Write` hook calls `acquire_lock.py` directly, making lock acquisition atomic with every write. The agent's explicit `acquire_lock.py` call before a task cluster is idempotent — if the hook already acquired the lock, this is a no-op. See Section 13.

### Session intention protocol

Before starting any non-trivial task (code changes, refactors, multi-file edits):

**Step 1 — Check for conflicts:**

```bash
python .agents/scripts/check_intentions.py '["src/auth/", "CONTEXT.md"]'
```

- Exit `0` — no conflicts. Proceed to Step 2.
- Exit `1` — stale conflicts found (open intentions older than 30 min). Read the JSON output, present the conflicting agents and scopes to the user, and ask: *"Another session registered intent to modify these paths [X] min ago but has not finished. Is it safe to proceed?"*
  - If user confirms: close each stale intention with `python .agents/scripts/close_intention.py <id> cancelled`, then proceed to Step 2.
  - If user declines: stop and inform.
- Exit `2` — active conflicts (open intentions ≤ 30 min old). Inform user and stop. Do not proceed.

**Step 2 — Register own intention:**

```bash
python .agents/scripts/register_intention.py "Implement OAuth in auth module" '["src/auth/", "CONTEXT.md"]'
```

Capture the printed `intention_id` — you will need it to close the intention.

**Step 3 — Do the work** (acquire file locks as usual per the file lock protocol).

**Step 4 — Close intention when done:**

```bash
python .agents/scripts/close_intention.py <intention_id> completed
```

If the task is interrupted or cancelled before completion, close with `cancelled` status.

**Hook coverage**: the `.claude/settings.json` hooks automate part of this protocol (see Section 13):

| Hook event | Script | What it does |
| -- | -- | -- |
| `PreToolUse:Write` | `acquire_lock.py` | Acquires lock atomically before each write; blocks if locked by another agent |
| `PreToolUse:Bash` | `guard_bash.py` | Warns on dangerous shell patterns |
| `PostToolUse:Write` | `log_write.py` | Appends write to session audit log |
| `PostToolUse:Bash` | `log_bash.py` | Appends command + exit code to audit log |
| `Stop` | `release_locks.py` | Releases all file locks owned by this agent on session end |
| `Stop` | `close_intentions.py` | Cancels all open intentions owned by this agent on session end |

The agent still calls `acquire_lock.py` explicitly (to declare intent before a task cluster) and `release_lock.py` explicitly (to release individual files mid-task). When the hook fires on a write, it calls `acquire_lock.py` for the same file — idempotency ensures no double-acquisition if the agent already holds the lock. This closes the check-then-write race condition: lock acquisition is now atomic with each write operation.

---

## SECTION 9 — MEMORY AND CONTEXT

### CONTEXT.md structure

```markdown
# Project Context

<!-- Retention policy per section — see AGENT_FRAMEWORK.md Section 9. -->
<!-- Entry format: - [status] Description. (YYYY-MM-DD)               -->
<!-- Statuses: [active] | [resolved] | [superseded]                   -->

## Architecture decisions
<!-- Permanent. Never delete. Mark superseded ones [superseded].      -->

## Technical debt
<!-- Keep until [resolved]. Resolved entries removed on prune pass.   -->

## Current project state
<!-- Replace entirely on every update. Never append.                  -->

## Authorized fallbacks
<!-- Keep until explicitly revoked. Then mark [superseded].           -->

## Utility index
| Domain | Location |
| -- | -- |
```

### Retention policy per section

| Section | Retention | Removal trigger |
| -- | -- | -- |
| Architecture decisions | Permanent | Mark `[superseded]` when overridden; never delete |
| Technical debt | Until resolved | Mark `[resolved]` when fixed; removed on next prune |
| Current project state | Latest snapshot only | Replace entirely on every update |
| Authorized fallbacks | Until revoked | Mark `[superseded]` when revoked; removed on prune |
| Utility index | Permanent | Update in place |

### Entry status tags

Every entry in `Architecture decisions`, `Technical debt`, and `Authorized fallbacks` carries an inline status tag:

```markdown
- [active] Auth uses JWT with RS256 — chosen over sessions for stateless scaling. (2026-03-10)
- [superseded] Auth used session cookies — replaced by JWT. (2026-01-05)
- [resolved] N+1 query on product listing — fixed in db/queries.py. (2026-04-02)
```

- Agents read only `[active]` entries during a session.
- Never delete `[resolved]` or `[superseded]` mid-session — the prune pass does it.
- `Current project state` has no tags — it is always a full replacement, not a log.

### Update rules

- Read `CONTEXT.md` at the start of every planning or complex coding session. Only `[active]` entries are relevant.
- Update only when: new architectural decision, new technical debt, significant state change, new authorized fallback.
- **Before inserting**: scan for overlapping content. Update in place if found. Never duplicate.
- **`Current project state`**: replace the entire section body on every update. Never append lines to it.

### Prune protocol (triggered when line count exceeds `context_max_lines`)

Triggered at the start of a planning session when `wc -l CONTEXT.md` exceeds the threshold in `CLAUDE.md` (default: 150 lines).

1. Remove all `[resolved]` and `[superseded]` entries from all sections.
2. Review remaining `[active]` entries — mark any that are implicitly superseded or resolved.
3. Replace `Current project state` with a fresh summary of the current state.
4. Confirm the pruned file with the user before saving.
5. Acquire the `CONTEXT.md` lock before writing.

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
Step 22: Create .agents/scripts/register_intention.py from template below.
Step 23: Create .agents/scripts/close_intention.py from template below.
Step 24: Create .agents/scripts/close_intentions.py from template below.
Step 25: Create .agents/scripts/check_intentions.py from template below.
Step 26: If Q9 ≠ "Claude Code only" — create .vscode/tasks.json from template below.
         Add .github/copilot-instructions.md stub if Q9 includes Copilot.
Step 27: If Q9.1 = Yes — create .git/hooks/pre-commit from template below and make executable.
Step 28: Report all files created.
Step 29: Ask if user wants to review any file.
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
- Context max lines: 150 (prune trigger — see Section 9)

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
            "command": "python .agents/scripts/acquire_lock.py \"$TOOL_INPUT_PATH\" \"write:hook\" 2>&1"
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
          },
          {
            "type": "command",
            "command": "python .agents/scripts/close_intentions.py 2>/dev/null || true"
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
from pathlib import Path

_SESSION_ID_FILE = Path(".agents/.session_id")


def _resolve_agent_id() -> str:
    if env_id := os.environ.get("AGENT_ID"):
        return env_id
    try:
        if _SESSION_ID_FILE.exists():
            return _SESSION_ID_FILE.read_text().strip()
    except OSError:
        pass
    return "unknown"


def main() -> None:
    agent_id = _resolve_agent_id()
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
  0 — lock acquired, or already held by this agent (idempotent)
  1 — file is locked by another agent (do not proceed)
  2 — usage error
"""
import datetime
import os
import re
import sqlite3
import sys
import uuid
from pathlib import Path

_SAFE_PATH_RE = re.compile(r'^[\w./\-\\ :@#()+,=\[\]{}]+$')
_DB_PATH = "SESSION.db"
_SESSION_ID_FILE = Path(".agents/.session_id")
_MAX_RETRIES = 2


def _resolve_agent_id() -> str:
    """Return a stable agent ID for this session.

    Priority: AGENT_ID env var → .agents/.session_id file → new UUID written to file.
    Never generates a fresh UUID per call — that would break lock ownership across hook invocations.
    """
    if env_id := os.environ.get("AGENT_ID"):
        return env_id
    try:
        _SESSION_ID_FILE.parent.mkdir(parents=True, exist_ok=True)
        if _SESSION_ID_FILE.exists():
            return _SESSION_ID_FILE.read_text().strip()
        new_id = str(uuid.uuid4())
        _SESSION_ID_FILE.write_text(new_id)
        return new_id
    except OSError:
        return str(uuid.uuid4())  # Ephemeral fallback if filesystem write fails.


def main() -> None:
    if len(sys.argv) < 3:
        print("Usage: acquire_lock.py <file_path> <task_desc>", file=sys.stderr)
        sys.exit(2)

    file_path, task_desc = sys.argv[1], sys.argv[2]

    if not _SAFE_PATH_RE.match(file_path):
        print(f"WARNING: Cannot safely lock path '{file_path}' — special characters.", file=sys.stderr)
        sys.exit(0)

    agent_id = _resolve_agent_id()

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
                    if row and row[1] == agent_id:
                        sys.exit(0)  # This agent already holds the lock — idempotent.
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
import sqlite3
import sys
from pathlib import Path

_DB_PATH = "SESSION.db"
_SESSION_ID_FILE = Path(".agents/.session_id")


def _resolve_agent_id() -> str:
    if env_id := os.environ.get("AGENT_ID"):
        return env_id
    try:
        if _SESSION_ID_FILE.exists():
            return _SESSION_ID_FILE.read_text().strip()
    except OSError:
        pass
    return "unknown"


def main() -> None:
    if len(sys.argv) < 2:
        print("Usage: release_lock.py <file_path>", file=sys.stderr)
        sys.exit(1)

    file_path = sys.argv[1]
    agent_id = _resolve_agent_id()

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
"""Print the current SESSION.db state — file locks and session intentions.

Usage: python session_status.py
"""
import json
import sqlite3
import sys
from pathlib import Path

_DB_PATH = "SESSION.db"


def _print_locks(conn: sqlite3.Connection) -> None:
    rows = conn.execute(
        "SELECT file_path, agent_id, task_desc, status, locked_at "
        "FROM session_locks ORDER BY locked_at DESC"
    ).fetchall()
    print("\n=== File Locks ===")
    if not rows:
        print("  No locks.")
        return
    print(f"  {'Status':<12} {'Agent':<22} {'Locked at':<20} File")
    print("  " + "-" * 80)
    for file_path, agent_id, task_desc, status, locked_at in rows:
        print(f"  {status:<12} {agent_id[:22]:<22} {locked_at[:19]:<20} {file_path}")


def _print_intentions(conn: sqlite3.Connection) -> None:
    try:
        rows = conn.execute(
            "SELECT intention_id, agent_id, scope_summary, target_paths, status, started_at, completed_at "
            "FROM session_intentions ORDER BY started_at DESC"
        ).fetchall()
    except sqlite3.OperationalError:
        print("\n=== Session Intentions ===")
        print("  Table not found.")
        return
    print("\n=== Session Intentions ===")
    if not rows:
        print("  No intentions.")
        return
    for intention_id, agent_id, scope_summary, target_paths_raw, status, started_at, completed_at in rows:
        try:
            paths = json.loads(target_paths_raw)
            paths_display = ", ".join(paths[:3]) + (" …" if len(paths) > 3 else "")
        except (json.JSONDecodeError, TypeError):
            paths_display = str(target_paths_raw)
        end = completed_at[:19] if completed_at else "—"
        print(f"  [{status}] {agent_id[:16]} | {started_at[:19]} → {end}")
        print(f"    Scope: {scope_summary}")
        print(f"    Paths: {paths_display}")
        print(f"    ID:    {intention_id}")


def main() -> None:
    if not Path(_DB_PATH).exists():
        print("SESSION.db not found — no active sessions.")
        return
    try:
        with sqlite3.connect(_DB_PATH) as conn:
            _print_locks(conn)
            _print_intentions(conn)
    except Exception as exc:
        print(f"Error reading SESSION.db: {exc}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
```

### .agents/scripts/register_intention.py template

```python
"""Register a new session intention before starting a task.

Usage: python register_intention.py '<scope_summary>' '<paths_json>'
  scope_summary — short description of what the agent intends to do.
  paths_json    — JSON array of file/folder paths the agent plans to modify.

Prints the intention_id to stdout on success.

Exit codes:
  0 — intention registered
  1 — error
  2 — usage error
"""
import datetime
import json
import os
import sqlite3
import sys
import uuid
from pathlib import Path

_DB_PATH = "SESSION.db"
_SESSION_ID_FILE = Path(".agents/.session_id")


def _resolve_agent_id() -> str:
    if env_id := os.environ.get("AGENT_ID"):
        return env_id
    try:
        _SESSION_ID_FILE.parent.mkdir(parents=True, exist_ok=True)
        if _SESSION_ID_FILE.exists():
            return _SESSION_ID_FILE.read_text().strip()
        new_id = str(uuid.uuid4())
        _SESSION_ID_FILE.write_text(new_id)
        return new_id
    except OSError:
        return str(uuid.uuid4())


def main() -> None:
    if len(sys.argv) < 3:
        print("Usage: register_intention.py '<scope_summary>' '<paths_json>'", file=sys.stderr)
        sys.exit(2)

    scope_summary = sys.argv[1]
    try:
        target_paths = json.loads(sys.argv[2])
        if not isinstance(target_paths, list):
            raise ValueError("paths_json must be a JSON array")
    except (json.JSONDecodeError, ValueError) as exc:
        print(f"Invalid paths_json: {exc}", file=sys.stderr)
        sys.exit(2)

    agent_id = _resolve_agent_id()
    intention_id = str(uuid.uuid4())

    try:
        with sqlite3.connect(_DB_PATH) as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS session_intentions (
                    intention_id  TEXT PRIMARY KEY,
                    agent_id      TEXT NOT NULL,
                    scope_summary TEXT NOT NULL,
                    target_paths  TEXT NOT NULL,
                    status        TEXT DEFAULT 'in_progress',
                    started_at    TEXT NOT NULL,
                    completed_at  TEXT
                )
            """)
            conn.execute(
                "INSERT INTO session_intentions VALUES (?, ?, ?, ?, 'in_progress', ?, NULL)",
                (intention_id, agent_id, scope_summary, json.dumps(target_paths),
                 datetime.datetime.utcnow().isoformat()),
            )
            conn.commit()
        print(intention_id)
        sys.exit(0)
    except Exception as exc:
        print(f"ERROR: Could not register intention: {exc}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
```

### .agents/scripts/close_intention.py template

```python
"""Close a session intention by marking it completed or cancelled.

Usage: python close_intention.py <intention_id> <status>
  status — 'completed' or 'cancelled'

Exit codes:
  0 — intention closed
  1 — error
  2 — usage error
"""
import datetime
import sqlite3
import sys
from pathlib import Path

_DB_PATH = "SESSION.db"
_VALID_STATUSES = frozenset({"completed", "cancelled"})


def main() -> None:
    if len(sys.argv) < 3:
        print("Usage: close_intention.py <intention_id> <status>", file=sys.stderr)
        sys.exit(2)

    intention_id, status = sys.argv[1], sys.argv[2]

    if status not in _VALID_STATUSES:
        print(f"Invalid status '{status}'. Use: completed, cancelled", file=sys.stderr)
        sys.exit(2)

    if not Path(_DB_PATH).exists():
        print("SESSION.db not found.", file=sys.stderr)
        sys.exit(1)

    try:
        with sqlite3.connect(_DB_PATH) as conn:
            conn.execute(
                "UPDATE session_intentions SET status = ?, completed_at = ? "
                "WHERE intention_id = ?",
                (status, datetime.datetime.utcnow().isoformat(), intention_id),
            )
            conn.commit()
        sys.exit(0)
    except Exception as exc:
        print(f"ERROR: Could not close intention: {exc}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
```

### .agents/scripts/close_intentions.py template

```python
"""Cancel all open session intentions owned by the current agent at session stop.

Called by the Stop hook — runs automatically when the Claude Code session ends,
whether by normal exit, crash, or timeout. Ensures no stale open intentions
block other agents from proceeding after a 30-min threshold.
"""
import datetime
import os
import sqlite3
from pathlib import Path

_SESSION_ID_FILE = Path(".agents/.session_id")


def _resolve_agent_id() -> str:
    if env_id := os.environ.get("AGENT_ID"):
        return env_id
    try:
        if _SESSION_ID_FILE.exists():
            return _SESSION_ID_FILE.read_text().strip()
    except OSError:
        pass
    return "unknown"


def main() -> None:
    agent_id = _resolve_agent_id()
    try:
        with sqlite3.connect("SESSION.db") as conn:
            conn.execute(
                "UPDATE session_intentions SET status = 'cancelled', completed_at = ? "
                "WHERE status = 'in_progress' AND agent_id = ?",
                (datetime.datetime.utcnow().isoformat(), agent_id),
            )
            conn.commit()
    except Exception:
        pass


if __name__ == "__main__":
    main()
```

### .agents/scripts/check_intentions.py template

```python
"""Check for open session intentions that conflict with planned target paths.

Usage: python check_intentions.py '<paths_json>'
  paths_json — JSON array of file/folder paths the agent plans to modify.

Prints a JSON report to stdout. Exit code indicates urgency.

Exit codes:
  0 — no conflicts (safe to proceed)
  1 — stale conflicts (age > 30 min) — ask user for confirmation before proceeding
  2 — active conflicts (age ≤ 30 min) — do not proceed without resolution
"""
import datetime
import json
import os
import sqlite3
import sys
from pathlib import Path

_DB_PATH = "SESSION.db"
_SESSION_ID_FILE = Path(".agents/.session_id")
_STALE_THRESHOLD_MINUTES = 30


def _resolve_agent_id() -> str:
    if env_id := os.environ.get("AGENT_ID"):
        return env_id
    try:
        if _SESSION_ID_FILE.exists():
            return _SESSION_ID_FILE.read_text().strip()
    except OSError:
        pass
    return "unknown"


def _paths_overlap(a: str, b: str) -> bool:
    """Return True if a and b refer to the same location or one contains the other."""
    na, nb = a.rstrip("/"), b.rstrip("/")
    return na == nb or na.startswith(nb + "/") or nb.startswith(na + "/")


def _age_minutes(started_at: str) -> float:
    try:
        start = datetime.datetime.fromisoformat(started_at)
        return (datetime.datetime.utcnow() - start).total_seconds() / 60
    except ValueError:
        return 0.0


def main() -> None:
    if len(sys.argv) < 2:
        print("Usage: check_intentions.py '<paths_json>'", file=sys.stderr)
        sys.exit(2)

    try:
        target_paths: list[str] = json.loads(sys.argv[1])
    except json.JSONDecodeError as exc:
        print(f"Invalid JSON for target paths: {exc}", file=sys.stderr)
        sys.exit(2)

    my_agent_id = _resolve_agent_id()

    if not Path(_DB_PATH).exists():
        print(json.dumps({"clear": True, "conflicts": []}))
        sys.exit(0)

    try:
        with sqlite3.connect(_DB_PATH) as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS session_intentions (
                    intention_id  TEXT PRIMARY KEY,
                    agent_id      TEXT NOT NULL,
                    scope_summary TEXT NOT NULL,
                    target_paths  TEXT NOT NULL,
                    status        TEXT DEFAULT 'in_progress',
                    started_at    TEXT NOT NULL,
                    completed_at  TEXT
                )
            """)
            rows = conn.execute(
                "SELECT intention_id, agent_id, scope_summary, target_paths, started_at "
                "FROM session_intentions "
                "WHERE completed_at IS NULL AND status = 'in_progress' AND agent_id != ?",
                (my_agent_id,),
            ).fetchall()
    except Exception as exc:
        print(f"WARNING: Could not read intentions: {exc}", file=sys.stderr)
        print(json.dumps({"clear": True, "conflicts": []}))
        sys.exit(0)  # Fail open — do not block work on DB error.

    conflicts: list[dict] = []
    for intention_id, agent_id, scope_summary, target_paths_raw, started_at in rows:
        try:
            existing_paths: list[str] = json.loads(target_paths_raw)
        except json.JSONDecodeError:
            existing_paths = [target_paths_raw]

        if any(_paths_overlap(tp, ep) for tp in target_paths for ep in existing_paths):
            age = _age_minutes(started_at)
            conflicts.append({
                "intention_id": intention_id,
                "agent_id": agent_id,
                "scope_summary": scope_summary,
                "target_paths": existing_paths,
                "started_at": started_at,
                "age_minutes": round(age, 1),
                "stale": age > _STALE_THRESHOLD_MINUTES,
            })

    if not conflicts:
        print(json.dumps({"clear": True, "conflicts": []}))
        sys.exit(0)

    stale = [c for c in conflicts if c["stale"]]
    active = [c for c in conflicts if not c["stale"]]
    print(json.dumps({"clear": False, "conflicts": conflicts, "stale": stale, "active": active}))

    if active:
        sys.exit(2)
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
| `PreToolUse` | `Write` | `acquire_lock.py` | Atomically acquire lock before write; exit 1 blocks the write if locked by another agent |
| `PreToolUse` | `Bash` | `guard_bash.py` | Warn (non-blocking) on dangerous shell patterns |
| `PostToolUse` | `Write` | `log_write.py` | Append write record to session audit log |
| `PostToolUse` | `Bash` | `log_bash.py` | Append command + exit code to session audit log |
| `Stop` | `""` (all) | `release_locks.py` | Release all in-progress file locks owned by this agent |
| `Stop` | `""` (all) | `close_intentions.py` | Cancel all open session intentions owned by this agent |

**Hook execution is warn-only except `PreToolUse:Write`**. `acquire_lock.py` exits 1 to block the write if another agent holds the lock; it exits 0 (and is idempotent) if this agent already holds it. All other scripts exit 0 regardless — they warn but never block.

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

Version: 1.6.0
Source: <https://github.com/LeoBR84p/agent-framework>
Adapted for: generic multi-project use
License: MIT - <https://leobr.site>
