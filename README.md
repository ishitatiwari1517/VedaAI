<div align="center">

<img src="https://img.shields.io/badge/VedaAI-Assessment_Creator-E8442A?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPgo8cGF0aCBkPSJNMTIgMkwyIDdsIDEwIDUgMTAtNS0xMC01ek0yIDE3bDEwIDUgMTAtNU0yIDEybDEwIDUgMTAtNSIvPgo8L3N0cm9rZT4KPC9zdmc+" />

# VedaAI Assessment Creator

**AI-powered question paper generator for teachers — built for VedaAI's hiring assignment.**

[![Next.js](https://img.shields.io/badge/Next.js_14-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org/)
[![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=flat-square&logo=socket.io)](https://socket.io/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://mongodb.com/)
[![Redis](https://img.shields.io/badge/Redis-DC382D?style=flat-square&logo=redis&logoColor=white)](https://redis.io/)
[![BullMQ](https://img.shields.io/badge/BullMQ-FF6C37?style=flat-square)](https://docs.bullmq.io/)

</div>

---

## What makes this different

| Feature | This submission | Typical submission |
|---|---|---|
| **Question generation** | Live streaming — questions appear one by one | Spinner → wall of text |
| **Output quality** | Validates & auto-repairs LLM output | Render whatever LLM returns |
| **PDF export** | Print-perfect A4 exam paper | Webpage screenshot |
| **Form UX** | Auto-distribute marks, duplicate detection, live totals | Basic form |
| **Architecture** | BullMQ + WebSocket + Redis cache | Direct HTTP call with timeout |

---

## Live Demo

> 🔗 **Frontend**: [https://veda-ai-frontend.vercel.app](https://veda-ai-frontend.vercel.app)  
> 🔗 **Backend API**: [https://veda-ai-backend.railway.app](https://veda-ai-backend.railway.app)

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         TEACHER'S BROWSER                        │
│  Next.js 14 + Zustand + Socket.io-client + CSS Modules          │
└────────────────┬───────────────────────────┬────────────────────┘
                 │ HTTP POST /api/assignments  │ WebSocket events
                 ▼                             ▼
┌────────────────────────────────────────────────────────────────┐
│                      EXPRESS + SOCKET.IO                        │
│  Routes → MongoDB (create assignment) → BullMQ (enqueue job)   │
│  Socket.io rooms keyed by jobId                                 │
└────────────────────────┬───────────────────────────────────────┘
                          │ Worker picks up job
              ┌───────────▼──────────┐
              │   BullMQ Worker      │
              │  (generationWorker)  │
              └───────────┬──────────┘
                          │ Streams tokens
              ┌───────────▼──────────┐
              │  Claude Sonnet API   │
              │  (Streaming enabled) │
              └───────────┬──────────┘
                          │ Emits per section/question
              ┌───────────▼──────────┐       ┌─────────────┐
              │   Validation Pass    │──────▶│  Auto-Repair │
              │  (schema + marks)    │       │  (if needed) │
              └───────────┬──────────┘       └─────────────┘
                          │
              ┌───────────▼──────────┐
              │  MongoDB Atlas       │
              │  (GeneratedPaper)    │
              └──────────────────────┘
```

---

## Core Flow

```
1. Teacher fills form → clicks "Generate Question Paper"
2. Backend creates Assignment doc in MongoDB (status: queued)
3. BullMQ job enqueued → jobId returned to frontend
4. Frontend subscribes to WebSocket room by jobId
5. Worker calls Claude with streaming enabled
6. As each section completes parsing → emits section_start + question_ready events
7. Frontend renders questions in real time with staggered fade-in animations
8. Validation runs: checks question count, marks total, difficulty tags, answer key
9. If validation fails → auto-repair prompt sent to Claude
10. Paper saved to MongoDB → generation_done emitted
11. Teacher sees complete paper with PDF download option
```

---

## Feature 1: Live Streaming Output (Primary Differentiator)

Questions appear on screen **one by one** as the AI generates them — not a spinner followed by a wall of text.

**How it works:**
- BullMQ worker calls `anthropic.messages.stream()` 
- As the JSON response streams in, it's accumulated and parsed
- Each completed section triggers `section_start` → multiple `question_ready` events
- Frontend Zustand store `appendQuestion(sectionId, question)` updates state incrementally
- CSS `animation-delay: calc(var(--question-index) * 60ms)` creates cascade effect

```typescript
// Worker emits as each question parses
socket.to(jobId).emit('question_ready', {
  jobId, section: 'A',
  question: { number: 1, text: '...', difficulty: 'easy', marks: 2 }
})

// Frontend Zustand store — incremental append
appendQuestion: (sectionId, question) =>
  set(state => ({
    sections: state.sections.map(s =>
      s.id === sectionId
        ? { ...s, questions: [...s.questions, question] }
        : s
    )
  }))
```

---

## Feature 2: LLM Output Validation + Auto-Repair

The system never blindly renders LLM output. After generation:

```typescript
interface ValidationResult {
  totalQuestionsMatch: boolean    // requested 25, got 25?
  totalMarksMatch: boolean        // requested 60 marks, got 60?
  allSectionsPresent: boolean     // all question types have a section?
  allDifficultyTagged: boolean    // every question has easy/moderate/hard?
  answerKeyPresent: boolean       // answer for every question?
  passed: boolean
  errors: string[]
}
```

If validation fails, a targeted repair prompt is sent:
```
"The question paper has these issues: [errors].
Return ONLY the corrected paper in the same JSON format."
```

Teacher sees: *"Validating output quality... ✓ All checks passed"* or *"✓ Issues fixed automatically"*

---

## Feature 3: Print-Perfect PDF Export

"Download as PDF" produces a real exam paper — not a webpage screenshot.

- `@media print` hides all UI chrome: sidebar, navbar, badges, buttons
- A4 page size with 2.5cm margins via `@page` CSS
- School header on every page, `Times New Roman` font for exam authenticity  
- `page-break-before: always` on each section
- `document.title` set to exam name so saved PDF is named correctly

---

## Feature 4: Smart Form UX

- **Live marks total**: Updates as teacher adjusts question counts/marks
- **Mismatch warning**: ⚠ "Total marks (65) exceeds target (60)" shown in real time
- **Auto-distribute ⚡**: One click evenly distributes target marks across all question types proportionally
- **Duplicate detection**: Inline error if same question type added twice

---

## Design System

Built with custom CSS variables (not Tailwind utility classes) for full design control:

```css
:root {
  --color-primary: #E8442A;        /* VedaAI orange-red */
  --color-primary-light: #FFF0EE;  /* hover backgrounds */
  --font-sans: 'Plus Jakarta Sans', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  /* ... full token system */
}
```

Animations — questions cascade in with 60ms stagger:
```css
@keyframes questionReveal {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
.question-card {
  animation: questionReveal 0.3s ease-out both;
  animation-delay: calc(var(--question-index) * 60ms);
}
```

---

## Design Decisions

| Decision | Rationale |
|---|---|
| **BullMQ over direct LLM call** | Generation takes 8-20s. Direct HTTP times out and can't resume. BullMQ lets us queue, retry, and track progress independently. |
| **Zustand over Redux** | One primary data flow. Redux boilerplate isn't justified. Zustand delivers same reliability with 80% less code. |
| **Streaming parse over full-response** | Parsing the stream section-by-section enables progressive display AND catches malformed JSON early instead of failing after 15s. |
| **Validation + repair loop** | LLMs occasionally miscalculate marks or omit difficulty tags. Auto-repair is cheaper than full regeneration and delivers consistent output. |
| **CSS Modules over Tailwind** | Scoped styles, no specificity conflicts, full control over design tokens. Tailwind is still present for layout utilities where needed. |
| **Socket.io rooms by jobId** | Each teacher's tab connects to exactly their job room — no cross-contamination between concurrent generations. |

---

## Setup

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier)
- Upstash Redis account (free tier)  
- Anthropic API key

### Backend

```bash
cd backend
cp .env.example .env
# Fill in MONGODB_URI, REDIS_URL, ANTHROPIC_API_KEY

npm install
npm run dev
# Server starts on http://localhost:5000
```

### Frontend

```bash
cd frontend
cp .env.example .env.local
# NEXT_PUBLIC_BACKEND_URL=http://localhost:5000

npm install
npm run dev
# App starts on http://localhost:3000
```

### Environment Variables

**Backend (`backend/.env`):**
```
MONGODB_URI=mongodb+srv://...
REDIS_URL=rediss://...
ANTHROPIC_API_KEY=sk-ant-...
FRONTEND_URL=http://localhost:3000
PORT=5000
```

**Frontend (`frontend/.env.local`):**
```
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
```

---

## Project Structure

```
vedaAI/
├── frontend/                    # Next.js 14 App Router
│   └── src/
│       ├── app/
│       │   ├── page.tsx               # Dashboard (empty + filled)
│       │   ├── create/page.tsx        # Assignment creation form
│       │   └── assignments/[id]/      # Output page (live streaming)
│       ├── components/
│       │   ├── layout/Sidebar.tsx
│       │   ├── layout/TopBar.tsx
│       │   ├── dashboard/EmptyState.tsx
│       │   ├── dashboard/AssignmentCard.tsx
│       │   ├── create/AssignmentForm.tsx
│       │   ├── create/QuestionTypeRow.tsx
│       │   ├── create/MarksValidator.tsx
│       │   └── output/
│       │       ├── GenerationProgress.tsx  ← The live streaming bar
│       │       ├── QuestionSection.tsx
│       │       ├── QuestionCard.tsx
│       │       ├── AnswerKey.tsx
│       │       └── ExportButton.tsx
│       ├── stores/assignmentStore.ts  # Zustand store
│       ├── hooks/useWebSocket.ts      # Socket.io event handlers
│       └── lib/api.ts
│
└── backend/
    └── src/
        ├── index.ts                   # Express + Socket.io server
        ├── routes/assignments.ts      # REST API
        ├── workers/generationWorker.ts  ← LLM call + streaming
        ├── services/
        │   ├── llmService.ts          # Claude streaming API
        │   └── validationService.ts   # Schema validation + repair
        ├── queues/
        │   ├── generationQueue.ts     # BullMQ queue
        │   └── redisConnection.ts     # Redis + job state cache
        ├── socket/socketServer.ts     # Socket.io rooms
        └── models/
            ├── Assignment.ts
            └── GeneratedPaper.ts
```

---

## WebSocket Event Protocol

```typescript
// Client → Server
'join_job_room'    { jobId: string }

// Server → Client  
'job_queued'       { jobId: string; position: number }
'generation_start' { jobId: string; totalQuestions: number }
'section_start'    { jobId: string; section: string; title: string }
'question_ready'   { jobId: string; section: string; question: Question }
'section_complete' { jobId: string; section: string; questionCount: number }
'validation_start' { jobId: string }
'validation_done'  { jobId: string; passed: boolean; repaired: boolean }
'generation_done'  { jobId: string; paperId: string }
'generation_error' { jobId: string; message: string }
```

---

<div align="center">
Built with ❤️ for VedaAI — <em>Every UX decision saves a teacher time.</em>
</div>
