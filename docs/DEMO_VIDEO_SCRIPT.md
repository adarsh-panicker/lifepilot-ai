# LifePilot AI — Hackathon Video Demonstration Script

**Target Duration:** 2 minutes 35 seconds (Budget limit: 2 minutes 45 seconds)  
**Primary Track:** Alexa+ (Simulated Experience Path)  
**Mini Challenges:** AWS Builder (Amazon Bedrock) & Open Source  

---

### [00:00 - 00:20] Hook & Product Overview
- **Visual:** Browser showing LifePilot AI Dashboard (`http://localhost:3000`) with dark navy theme, subtle violet/cyan glows, live KPI metrics (Completion Rate, Pending Tasks, Overdue alerts).
- **Spoken:**  
  *"Hi everyone! This is LifePilot AI — an Alexa+ inspired personal productivity assistant built for the Amazon Developer Hackathon. Busy professionals, students, and creators constantly struggle with overloaded schedules and shifting priorities. LifePilot bridges natural conversational language with practical task execution and intelligent time-blocking."*

---

### [00:20 - 00:45] Track Clarification & Architecture
- **Visual:** Navigate to `/voice` (LifePilot Voice Assistant). Zoom briefly on the primary disclaimer badge and Settings toggle showing Demo vs Amazon Bedrock mode.
- **Spoken:**  
  *"For this hackathon, we built the explicitly permitted simulated Alexa+ experience path. This is a dedicated, fully working web assistant capable of speech recognition, natural intent interpretation, server-side tool execution, and auditory response. It integrates Amazon Bedrock using the AWS SDK Converse API, with an offline deterministic Demo mode so judges can run and verify all features with zero friction."*

---

### [00:45 - 01:20] Conversational Voice Request & Tool Invocation
- **Visual:** On `/voice`, click microphone or the one-click prompt: *"Plan my day. I have an assignment due tonight."* The voice wave animation pulses. The assistant responds with a structured, encouraging message and highlights the invoked tool: `generate_daily_plan`.
- **Spoken:**  
  *"Let's test a natural language request: 'Plan my day. I have an assignment due tonight.'  
  Watch what happens in real time: the assistant interprets the intent, queries our SQLite database, and calls the `generate_daily_plan` tool. Notice the live Activity panel on the right — it records the exact validated parameters, non-overlapping time slots, and execution confirmation."*

---

### [01:20 - 01:50] Natural Language Task Creation & Task Manager
- **Visual:** Click or speak: *"Add a task to finish my project report by 8 PM with high priority."*  
  Show the assistant reply confirming creation. Click navigation to `/tasks` to show the newly created task immediately appearing at the top of the queue with the RED High Priority badge and today's 8:00 PM deadline.
- **Spoken:**  
  *"Next, let's create a task: 'Add a task to finish my project report by 8 PM with high priority.'  
  The assistant invokes `create_task`. In the Task Manager, we see the task immediately persisted in SQLite with full metadata, priority tags, and duration estimates. All updates persist across reloads."*

---

### [01:50 - 02:15] Smart Daily Planner & Non-Overlapping Schedule
- **Visual:** Click into `/planner`. Adjust available hours slider to 4 hours and click "Regenerate Schedule". Point out the timeline with non-overlapping blocks, color-coded priority nodes, and the automated "Brain Break & Hydration" rest slots.
- **Spoken:**  
  *"In the Smart Daily Planner, LifePilot calculates a mathematically non-overlapping schedule. It places urgent and high-priority tasks during peak energy blocks, explains the reasoning behind each choice, and automatically inserts rest intervals to prevent burnout."*

---

### [02:15 - 02:35] Productivity Insights & Amazon Bedrock
- **Visual:** Click into `/insights` (showing completion rate, workload hours, category breakdown), then click into `/settings` showing Bedrock diagnostics.
- **Spoken:**  
  *"In Productivity Insights, users get analytical feedback on completed workload and velocity. Finally, under Settings, you can inspect our Amazon Bedrock Converse integration using Claude 3.5 Sonnet, or run in Demo mode with one-click demo data reset."*

---

### [02:35 - 02:45] Conclusion & Open Source
- **Visual:** Switch back to Dashboard, show GitHub repository link with MIT license and comprehensive test suite.
- **Spoken:**  
  *"LifePilot AI is completely open source under the MIT License with 100% passing automated tests. Thank you!"*
