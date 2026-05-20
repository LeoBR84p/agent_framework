# agent_framework

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A universal agent framework for multi-IDE AI agents — Claude Code, Cursor, and GitHub Copilot.
Modular `.agents/` structure, hook-driven lock protocol, script templates, and an interactive installer wizard.

Compatible with any project type. Designed for teams running two or more AI agents simultaneously.

## Installation

Tell your agent:

```prompt
Install the agent framework from AGENT_FRAMEWORK.md
```

The agent will run an interactive wizard that configures your project and creates all required files automatically.

## What gets created

| File / Directory | Purpose |
|---|---|
| `CLAUDE.md` | Short project config stub with file pointers |
| `AGENTS.md` | Always-active behavioral rules and strategic guidelines |
| `.agents/INDEX.md` | Fast dispatch table to topic-specific instruction files |
| `.agents/planning.md` | Planning rules and document format |
| `.agents/coding.md` | Code hygiene, security, and testing standards |
| `.agents/reviewing.md` | Review checklist and scope control |
| `.agents/testing.md` | Coverage minimums and isolation rules |
| `.agents/finishing.md` | Delivery checklist |
| `.agents/concurrency.md` | Multi-agent lock protocol |
| `CONTEXT.md` | Persistent cross-session memory |
| `SESSION.db` | SQLite concurrency control for multi-agent locks |
| `.claude/settings.json` | Hooks configuration |
| `.agents/scripts/` | Helper scripts for hooks and automation |

## Reading strategy

An agent should **never** load all `.agents/` files on every run. Correct reading path per task:

1. `CLAUDE.md` — always (project config and model assignments)
2. `AGENTS.md` — always (always-active behavioral rules)
3. `.agents/INDEX.md` → dispatch to **one** specific file for the current task

This keeps token overhead proportional to the task.

## Model routing

| Task type | Default model |
|---|---|
| Planning | `claude-sonnet-4-6` |
| Coding | `claude-sonnet-4-6` |
| Simple commands / user Q&A | `claude-haiku-4-5` |
| Escalation after retry threshold | `claude-opus-4-7` (requires user approval) |

All model assignments are overridable during the wizard setup.

## Wizard setup questions

The interactive installer asks:

1. **Project type** — Python backend, Next.js, full-stack, data/ML, generic, or custom
2. **Primary language(s)** — Python, TypeScript/JavaScript, both, or custom
3. **Test coverage minimum** — 75% (default), 80%, 90%, or custom percentage
4. **Model assignments** — confirm or override planning, coding, Q&A, and escalation models
5. **Retry escalation** — disable, or enable with default (3 attempts) or custom threshold
6. **Documentation language** — English or match project convention
7. **Multi-agent concurrency** — which agents will work simultaneously (Claude Code, Cursor, Copilot)
8. **Memory strategy** — `CONTEXT.md` (recommended), manual, or custom
9. **IDE and agent ecosystem** — determines hook and task configuration

If multiple agents are selected in Q7/Q9, the installer also creates `.vscode/tasks.json` and offers a `pre-commit` Git hook for lock enforcement.

## Lock protocol

`SESSION.db` tracks which agent holds a lock on which file. Before editing any file, an agent must acquire the lock and release it when done. The `pre-commit` hook (optional) blocks commits when a lock conflict is detected.

## Documentation

- Full specification: [`AGENT_FRAMEWORK.md`](AGENT_FRAMEWORK.md)

## Contact

Questions, suggestions, and reports:

- Email: [bernardo.leandro@gmail.com](mailto:bernardo.leandro@gmail.com)
- **Always include the prefix `Agent Framework:` in the subject line** so the message is routed correctly.

## License

[MIT](LICENSE) © 2026 Bernardo Leandro. <http://leobr.site>
