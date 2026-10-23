# LifePilot AI — Architectural Design & Security Specification

LifePilot AI is architected as an intelligent personal productivity assistant with an **Alexa+ inspired conversational workflow** and server-side **Amazon Bedrock Converse API** integration.

---

## 1. High-Level Architecture Diagram

```
+-----------------------------------------------------------------------------------+
|                                Client-Side (React / Next.js)                      |
|                                                                                   |
|  +----------------+   +----------------------+   +---------------+   +---------+  |
|  | Dashboard UI   |   | LifePilot Voice      |   | Task Manager  |   | Planner |  |
|  | (Metrics, Quick|   | Assistant (Alexa+    |   | (CRUD, filter,|   | & Daily |  |
|  |  Actions, Pins)|   |  Simulation & Wave)  |   |  sort, status)|   | Timeline|  |
|  +----------------+   +----------------------+   +---------------+   +---------+  |
|                               |                                                   |
|                         HTTP REST API (JSON)                                      |
+-------------------------------|---------------------------------------------------+
                                v
+-----------------------------------------------------------------------------------+
|                         Server-Side (Next.js App Router API)                      |
|                                                                                   |
|    +--------------------+       +--------------------------------------------+    |
|    | /api/chat          |       | /api/tasks & /api/plan & /api/seed         |    |
|    +--------------------+       +--------------------------------------------+    |
|              |                                        |                           |
|              v                                        |                           |
|    +----------------------------------------+         |                           |
|    | Dual-Engine Orchestration Layer        |         |                           |
|    |                                        |         |                           |
|    |  [Demo Mode Engine]                    |         |                           |
|    |  • Deterministic NLP Parser            |         |                           |
|    |  • Zero AWS Credentials Needed         |         |                           |
|    |                                        |         |                           |
|    |  [Amazon Bedrock Converse Engine]      |         |                           |
|    |  • AWS SDK BedrockRuntimeClient        |         |                           |
|    |  • Converse API with toolConfig        |         |                           |
|    |  • Multi-turn tool execution loop      |         |                           |
|    +----------------------------------------+         |                           |
|                        |                              |                           |
|                        v                              |                           |
|    +--------------------------------------------------+                      |    |
|    | Application Tool Layer (Validated & Sandboxed)   |                      |    |
|    |                                                  |                      |    |
|    |  • create_task        • update_task              |                      |    |
|    |  • list_tasks         • complete_task            |                      |    |
|    |  • get_daily_summary  • generate_daily_plan      |                      |    |
|    +--------------------------------------------------+                      |    |
|                        |                                                          |
|                        v                                                          |
|    +--------------------------------------------------+                      |    |
|    | SQLite Persistent Storage (better-sqlite3)       |                      |    |
|    |  • Table: tasks (Schema & Relational Index)      |                      |    |
|    |  • Table: activity_logs (Alexa+ Audit Trail)     |                      |    |
|    +--------------------------------------------------+                      |    |
+-----------------------------------------------------------------------------------+
```

---

## 2. Decoupled Dual-Engine Architecture

To satisfy both hackathon testing and real cloud integration:

1. **Demo Mode (Deterministic Local Assistant Engine)**:
   - Zero credentials required.
   - Parses natural-language intents into structured arguments.
   - Executes the exact same server-side application tools as the LLM.
   - Ideal for local development, automated testing, and offline demonstration.

2. **Bedrock Mode (Live Amazon Bedrock Converse API)**:
   - Uses `@aws-sdk/client-bedrock-runtime` and `ConverseCommand`.
   - Tool calling via `toolConfig` passing JSON schema definitions.
   - Handles multi-turn tool calling: receives `toolUse` blocks from Bedrock, executes them on the server, feeds back `toolResult` blocks, and returns final synthesized natural language.
   - **No Silent Fallback**: If Bedrock credentials or model access fail, the server returns an explicit `502 BEDROCK_FAILED` error with diagnostic context, allowing the user to either fix credentials or switch to Demo Mode.

---

## 3. Sandboxed Application Tools

LifePilot does **not** allow arbitrary code execution or raw SQL execution by the model. All actions are dispatched through strictly typed, validated tools:

| Tool Name | Purpose | Validated Arguments |
|---|---|---|
| `create_task` | Adds new task | `title` (sanitized string), `priority` (high/medium/low), `category`, `dueDate`, `estimatedMinutes` (5-480) |
| `list_tasks` | Queries database | `status` (all/pending/completed), `priority`, `category`, `search` |
| `complete_task` | Marks completed | `id` (verified task ID) or `titleQuery` (fuzzy lookup) |
| `update_task` | Updates properties | `id` (required), sanitized field updates |
| `get_daily_summary` | Computes metrics | None |
| `generate_daily_plan` | Non-overlapping time blocker | `availableHours` (1-12), `startHour` (0-23), `focusArea` |

Every tool invocation automatically records an entry into the SQLite `activity_logs` table, providing an auditable trace in the **Assistant Activity** panel.

---

## 4. Security & Data Protection

- **Server-Only Credentials**: AWS access keys and tokens are read solely within server runtime (`src/lib/ai/bedrock-client.ts`). They are never injected into Next.js client bundles or exposed via public endpoints.
- **Input Sanitization**: Length validation (max 2000 chars on queries) to prevent buffer overflows or denial-of-service.
- **Strict SQL Parameterization**: All database queries use `better-sqlite3` parameterized statements (`?` and `@named`) preventing SQL injection.
- **No Production Secrets in Git**: Sensitive values reside in `.env.local` which is excluded via `.gitignore`.
- **Fictional Demo Data**: Seed data uses fictional personas and tasks relative to current system time.
