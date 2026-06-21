# VoiceGuard AI — Call Quality Auditing Platform

> Enterprise-grade, AI-powered call centre compliance platform. Automatically transcribes agent calls using Deepgram, validates them against your custom compliance ruleset, and surfaces results inside a real-time audit workspace.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Prerequisites](#prerequisites)
3. [Getting Started — Run the Project](#getting-started--run-the-project)
4. [Ingesting Audio Calls](#ingesting-audio-calls)
5. [Deepgram AI Transcription](#deepgram-ai-transcription)
6. [Defining Agent vs Customer in Transcripts](#defining-agent-vs-customer-in-transcripts)
7. [Compliance Rule Management](#compliance-rule-management)
8. [Audit Workspace](#audit-workspace)
9. [Dashboard — Mock Data & Visualisations](#dashboard--mock-data--visualisations)
10. [User & Role Management](#user--role-management)
11. [Full API Reference](#full-api-reference)

---

## Architecture Overview

VoiceGuard is a monorepo built with [NPM Workspaces](https://docs.npmjs.com/cli/v7/using-workspaces), structured into three packages:

```
voiceguard/
├── apps/
│   ├── api/          # NestJS backend (REST API, BullMQ workers, TypeORM, Deepgram)
│   └── web/          # Next.js frontend (Audit Workspace, Dashboard, Settings)
└── packages/
    └── shared/       # Shared TypeScript types and enums (AuditStatus, Role, etc.)
```

**Infrastructure (via Docker Compose):**
- **PostgreSQL 15** — primary database on port `5434`
- **Redis 7** — message broker for background job queues (BullMQ) on port `6379`

---

## Prerequisites

Before running the project, make sure you have installed:

- [Node.js](https://nodejs.org/) v18+
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for Postgres + Redis)
- A valid **Deepgram API Key** (obtain one free at [deepgram.com](https://deepgram.com))

---

## Getting Started — Run the Project

Follow these **5 commands in order** from the project root:

### Step 1 — Start infrastructure (database + message broker)

```bash
docker compose up
```

This starts:
- **PostgreSQL** on `localhost:5434` (database: `voiceguard_db`, user: `voiceguard_user`, password: `voiceguard_password`)
- **Redis** on `localhost:6379`

> Leave this terminal running. Open a new terminal for subsequent commands.

---

### Step 2 — Build shared types

```bash
npm run build -w @voiceguard/shared
```

Compiles the shared TypeScript package (`AuditStatus`, `Role`, `User`, `CallRecord` interfaces) that both the API and web app depend on. This **must** be run before the API or web can start.

---

### Step 3 — Install the static file server dependency

```bash
npm install @nestjs/serve-static -w api --legacy-peer-deps
```

This installs the NestJS module that serves uploaded audio files from the `./uploads` directory so the frontend can stream them directly. The `--legacy-peer-deps` flag is required to avoid version conflicts with the existing NestJS tree.

---

### Step 4 — Start the API server

```bash
npm run start:dev -w api
```

Starts the NestJS backend in watch mode on **http://localhost:3001**.

> **Required:** Before starting the API, create the file `apps/api/.env` and add your Deepgram key:
> ```
> DEEPGRAM_API_KEY=your_key_here
> ```

---

### Step 5 — Start the web application

```bash
npm run dev -w web
```

Starts the Next.js frontend in dev mode on **http://localhost:3000**.

You are now fully up and running! Navigate to `http://localhost:3000` to access the VoiceGuard platform.

---

## Ingesting Audio Calls

VoiceGuard supports **two methods** for ingesting audio recordings into the auditing pipeline:

---

### Option 1 — Manual Upload (via the Dashboard UI)

1. Navigate to the **Dashboard** at `http://localhost:3000`
2. Locate the **Manual Call Upload** widget on the right-hand side
3. Drag and drop (or click to browse) an **MP3** or **WAV** audio file
4. Click **"Ingest Call for Audit"**

When you click ingest, the system will:
- Upload the file to the `apps/api/uploads/` directory on disk
- Immediately call the Deepgram API to transcribe the audio **synchronously** (no background delay)
- Save the full transcript and run automated compliance checks against your active ruleset
- Redirect you to the **Audit Workspace** to review results

> **Note:** Only MP3 and WAV files are currently supported.

---

### Option 2 — Programmatic API Ingestion (via HTTP POST)

You can push calls programmatically from any external system (CRM, telephony platform, IVR, etc.) using the following REST endpoint:

```
POST http://localhost:3001/ingestion/upload
Content-Type: multipart/form-data
```

**Form field:**
| Field    | Type   | Description                      |
|----------|--------|----------------------------------|
| `file`   | binary | The MP3/WAV audio recording file |

**Example using cURL:**
```bash
curl -X POST http://localhost:3001/ingestion/upload \
  -F "file=@/path/to/call-recording.mp3"
```

**Example using JavaScript (fetch):**
```js
const formData = new FormData();
formData.append('file', audioBlob, 'call.mp3');

const response = await fetch('http://localhost:3001/ingestion/upload', {
  method: 'POST',
  body: formData,
});
const { id, externalId } = await response.json();
```

The API responds with the newly created `CallRecord` object including its `id`, which you can use to navigate to the workspace.

---

### Option 3 — Webhook Ingestion (Advanced)

For enterprise telephony integrations, VoiceGuard also exposes a webhook endpoint that accepts a call record payload directly:

```
POST http://localhost:3001/ingestion/webhook
Content-Type: application/json
```

```json
{
  "externalId": "CALL-12345",
  "audioUrl": "https://your-storage.com/recordings/call.mp3",
  "agentId": "agent-007",
  "source": "FIVE9"
}
```

---

## Deepgram AI Transcription

VoiceGuard uses **Deepgram's Nova-2 model** for speech-to-text transcription. Deepgram was chosen for:
- **Speed** — near real-time transcription (<5 seconds for a typical 1-minute call)
- **Accuracy** — industry-leading WER (Word Error Rate) for call centre audio
- **Speaker Diarisation** — automatic detection of who is speaking at any given moment
- **Punctuation & Formatting** — outputs clean, readable sentence-formatted text

When a call is ingested, the API reads the audio file from disk, streams it directly to Deepgram's `/v1/listen` endpoint with the following settings:
- **Model**: `nova-2`
- **Diarize**: `true` (identifies unique speakers)
- **Punctuate**: `true`
- **Smart Format**: `true`

The resulting `transcript` (a structured JSON object containing word-level timestamps and speaker labels) is stored in the `CallRecord` database row.

---

## Defining Agent vs Customer in Transcripts

Deepgram's diarisation assigns each spoken word a `speaker` number (e.g., `0`, `1`, `2`). VoiceGuard maps these automatically using the following convention:

> **Speaker 0** is assumed to be the **agent** (the call centre representative).
> **Speaker 1** is assumed to be the **customer** (the caller).

This works because call recordings typically begin with the agent greeting the customer, meaning the first voice heard is always the agent.

In the **Audit Workspace transcript panel**, speaker labels are rendered with distinct colours:
- 🟠 **AGENT** — orange label
- 🔵 **CUSTOMER** — blue label

Each turn also displays its timestamp in `MM:SS` format, allowing auditors to click any turn to jump to that exact point in the audio player.

> **Customisation:** If your recording format starts with the customer, you can invert the mapping in `apps/api/src/audit/stt/deepgram.provider.ts` by swapping the `speaker === 0` condition.

---

## Compliance Rule Management

Navigate to **Compliance** in the left sidebar to manage your organisation's checklist rules.

### How Rules Work

Each rule defines a **required phrase** — a keyword or partial phrase that must appear in the transcript for the call to pass that criterion. The system performs **case-insensitive substring matching** against the full transcript text.

**Rule fields:**
| Field            | Description                                                  |
|------------------|--------------------------------------------------------------|
| `name`           | Human-readable label shown in the Audit Workspace            |
| `description`    | Explains what the auditor is checking for                    |
| `requiredPhrase` | The keyword/phrase that must appear in the transcript        |
| `category`       | Groups rules (e.g., Greeting, Process, Closing, Compliance) |
| `points`         | Score awarded when the rule passes                           |
| `isCriticalFail` | If checked, failing this rule heavily penalises the overall score |

### Default Seeded Rules

When you first load a workspace, the system automatically seeds three baseline rules if none exist in the database:

| Rule             | Match Phrase | Points | Critical |
|------------------|--------------|--------|----------|
| Greeting Check   | `name is`    | 10     | No       |
| Booking Process  | `email`      | 15     | Yes      |
| Closing Check    | `thank`      | 5      | No       |

You can freely add, edit, or delete rules from the **Compliance → Rule Management** page. Changes take immediate effect on all future call audits.

---

## Audit Workspace

After a call is ingested and transcribed, click **"Open Workspace"** from the Dashboard to enter the Audit Workspace.

### Audio Player
- Full playback controls (play/pause, skip forward/back 10s)
- **Clickable waveform** — click anywhere to seek
- **Volume slider** — click anywhere on the volume bar to adjust
- Dynamic waveform visualisation generated deterministically from the audio filename

### Call Transcript Panel
- Full speaker-diarised transcript with `MM:SS` timestamps
- Export to `.VTT` (WebVTT subtitle format)
- Clicking a transcript turn seeks the audio player to that timestamp

### Acceptance Criteria Panel
- Real-time compliance score calculated from automated rule matches
- **Compliance %** — percentage of active rules passed
- **Policy Score** — weighted score across all rules
- Each criterion shows `PASS` / `FAIL` / `PEND` status
- Click the **⚙ settings icon** to reveal inline override controls — auditors can manually override any automated pass/fail decision

### Manage Criteria Button
Clicking **"Manage Criteria"** in the top-right of the workspace navigates directly to the **Compliance Rule Management** page where you can add, edit, and delete rules.

### Submit Final Report
Click **"Submit Final Report"** to mark the audit as complete.

---

## Dashboard — Mock Data & Visualisations

The main Dashboard (`http://localhost:3000`) includes pre-populated **mock data** to showcase the platform's full visualisation capabilities before real data accumulates in production:

### Call Volume Heatmap
A GitHub-style activity calendar heatmap showing call volume intensity by day across the last 90 days. The colour intensity of each square represents how many calls were ingested that day. This is pre-filled to demonstrate how the visual looks at scale.

### Live Feed
The **Live Feed** widget simulates a real-time stream of incoming calls as they would appear on a busy call centre day — showing call IDs, agents, timestamps, and status badges. It will automatically replace mock entries with live database records as real calls are ingested.

### Summary Metrics
Top-level KPI cards (total calls, average compliance score, active agents) are pre-filled with realistic mock values to illustrate the intended state of a live deployment.

> All mock data is isolated to the Dashboard UI layer only. The Audit Workspace and Compliance modules operate exclusively on real database records.

---

## User & Role Management

Navigate to **Users** in the sidebar to manage team members.

| Role                  | Permissions                                                  |
|-----------------------|--------------------------------------------------------------|
| `ADMIN`               | Full access — manage users, rules, override decisions        |
| `AUDITOR`             | Review workspaces, override pass/fail, submit reports        |
| `COMPLIANCE_OFFICER`  | Manage compliance rules and view all reports                 |

---

## Full API Reference

| Method   | Endpoint                          | Description                                      |
|----------|-----------------------------------|--------------------------------------------------|
| `POST`   | `/ingestion/upload`               | Upload audio file (multipart/form-data)          |
| `POST`   | `/ingestion/webhook`              | Ingest call via JSON payload                     |
| `GET`    | `/audit/calls`                    | List all call records                            |
| `GET`    | `/audit/workspace/:id`            | Get workspace data (call + rules + results)      |
| `POST`   | `/audit/workspace/:id/override`   | Submit manual pass/fail override for a rule      |
| `POST`   | `/audit/workspace/:id/note`       | Add a timestamped note to a call                 |
| `POST`   | `/audit/workspace/:id/submit`     | Mark a call audit as submitted                   |
| `POST`   | `/audit/workspace/:id/delete`     | Delete a call record                             |
| `GET`    | `/audit/checklist-rules`          | List all active compliance rules                 |
| `POST`   | `/audit/checklist-rules`          | Create a new compliance rule                     |
| `PUT`    | `/audit/checklist-rules/:id`      | Update an existing compliance rule               |
| `DELETE` | `/audit/checklist-rules/:id`      | Delete a compliance rule                         |
| `GET`    | `/users`                          | List all users                                   |
| `POST`   | `/users`                          | Create a new user                                |
| `PATCH`  | `/users/:id/role`                 | Update a user's role                             |
| `DELETE` | `/users/:id`                      | Delete a user                                    |

---

## Environment Variables

Create `apps/api/.env` with the following:

```env
# Required — obtain from https://deepgram.com
DEEPGRAM_API_KEY=your_deepgram_api_key_here
```

All database and Redis connection details are pre-configured to match `docker-compose.yml` and require no changes for local development.

---

*Built with ❤️ using NestJS, Next.js, Deepgram, TypeORM, PostgreSQL, Redis, and BullMQ.*
