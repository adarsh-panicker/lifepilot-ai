# LifePilot AI — Hackathon Submission

## 1. Project Title & Tagline
- **Project Title:** LifePilot AI
- **Tagline:** An Alexa+ Inspired Personal Productivity Assistant Powered by Amazon Bedrock & Intelligent Tool Calling.

---

## 2. Track & Challenge Selections
- **Primary Track:** Alexa+ (Explicitly Permitted Simulated Alexa+ Web Experience Path)
- **Mini Challenge 1:** AWS Builder (Amazon Bedrock using the AWS SDK for JavaScript v3 Converse API)
- **Mini Challenge 2:** Open Source (MIT License, clean repository, comprehensive automated test suite)

---

## 3. Disclaimers & Clarifications (Honest Disclosure)
- **Simulated Alexa+ Path:** LifePilot AI provides a dedicated, fully functional web-based simulated Alexa+ experience (`/voice`). It demonstrates natural-language speech/text understanding, structured tool selection (`create_task`, `list_tasks`, `update_task`, `complete_task`, `get_daily_summary`, `generate_daily_plan`), server-side execution, and auditory response. It is **not** connected to an official Amazon Alexa hardware device or user account.
- **Amazon Bedrock Integration:** Real integration code using `@aws-sdk/client-bedrock-runtime` and `ConverseCommand` is implemented in `src/lib/ai/bedrock-client.ts`. The application features an explicit dual-mode system:
  1. **Bedrock Mode:** Makes real network requests to the AWS Bedrock Converse API with tool calling. Requires active AWS credentials and model access. Never silently falls back to fake text if Bedrock fails.
  2. **Demo Mode:** Runs 100% locally with a deterministic assistant engine so judges and developers can immediately test and evaluate every feature without requiring AWS credentials or incurring costs.

---

## 4. Key Features & Screens
1. **Executive Dashboard (`/`):** Real-time completion rates, pending workload hours, overdue alerts, today's top priorities, and quick voice launcher.
2. **LifePilot Voice Assistant (`/voice`):** Web Speech API microphone recognition with live audio wave visualizer, one-click preset prompts, audio speech synthesis, and an auditable **Assistant Activity** panel recording intent, tool invoked, validated JSON arguments, and execution confirmation.
3. **Conversational AI Assistant (`/assistant`):** Multi-turn chat with embedded tool execution cards, context-aware assistance, and prompt suggestions.
4. **Task Manager (`/tasks`):** Full CRUD modal, filtering by status (all/pending/completed), priority, category, search, sorting, and overdue warning badges backed by persistent SQLite storage.
5. **Smart Daily Planner (`/planner`):** Algorithmic, non-overlapping schedule timeline with customizable time budgets (1–10 hours), peak energy slot allocation for high-priority tasks, and automatic burnout-prevention breaks.
6. **Productivity Insights (`/insights`):** Workload velocity, priority distributions, category summaries, and actionable AI tips.
7. **Settings & Diagnostics (`/settings`):** Live Bedrock connection tester, AWS credential setup guide, and one-click demo data reset with relative dates.

---

## 5. Technology Stack
- **Framework:** Next.js 14.2 (App Router) with TypeScript
- **Frontend:** React 18, Tailwind CSS, Lucide Icons, Web Speech API
- **AI & Cloud:** AWS SDK for JavaScript v3 (`@aws-sdk/client-bedrock-runtime`), Bedrock Converse API (`ConverseCommand`, `toolConfig`)
- **Database:** SQLite via `better-sqlite3` with WAL mode
- **Testing:** Vitest (100% pass rate across 22 unit & integration tests)

---

## 6. Product Feedback for Tools Used

### Amazon Bedrock Converse API Feedback
1. **Strengths:**
   - The Converse API provides a unified schema (`toolConfig` and `toolUse` blocks) across different foundation models (Claude 3.5 Sonnet, Haiku, Amazon Nova). This eliminates model-specific prompt engineering hacks for tool calling.
   - Streaming and multi-turn message loops are straightforward to orchestrate server-side.
2. **Opportunities for Improvement:**
   - When tool calling is used with strict JSON schemas, TypeScript type definitions in `@aws-sdk/client-bedrock-runtime` could benefit from broader generic types (e.g., `DocumentType` type assertions can be finicky when handling generic records).
   - Local mock or offline sandbox utilities provided in the SDK would greatly enhance developer experience when building offline demo modes.
