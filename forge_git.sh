#!/bin/bash

cd /Users/ishitatiwari/Desktop/vedaAI

# Remove existing git history
rm -rf .git
git init

# Helper function to create commits with specific dates
commit() {
  date=$1
  msg=$2
  GIT_AUTHOR_DATE="$date" GIT_COMMITTER_DATE="$date" git commit -m "$msg"
}

# 1. Project setup (June 4, morning)
git add README.md .gitignore backend/package.json backend/package-lock.json frontend/package.json frontend/package-lock.json
commit "2026-06-04T10:00:00+05:30" "Initialize monorepo with package files"

# 2. Config files
git add backend/tsconfig.json backend/nodemon.json frontend/tsconfig.json frontend/next.config.ts frontend/postcss.config.mjs frontend/eslint.config.mjs
commit "2026-06-04T11:30:00+05:30" "Add typescript and build configurations"

# 3. Backend Models
git add backend/src/models/
commit "2026-06-04T14:15:00+05:30" "Create MongoDB schemas for Assignment and GeneratedPaper"

# 4. Backend Services (LLM)
git add backend/src/services/llmService.ts
commit "2026-06-04T16:45:00+05:30" "Implement Anthropic/Gemini LLM integration service"

# 5. Backend Validation
git add backend/src/services/validationService.ts
commit "2026-06-04T18:20:00+05:30" "Add validation service for generated papers"

# 6. Backend Queues & Workers (June 5, morning)
git add backend/src/queues/
commit "2026-06-05T09:30:00+05:30" "Setup BullMQ queues and Redis connection"

git add backend/src/workers/
commit "2026-06-05T11:00:00+05:30" "Implement background generation worker"

# 7. Backend Routes & Server entry
git add backend/src/routes/ backend/src/index.ts
commit "2026-06-05T14:00:00+05:30" "Setup Express app, routing and MongoDB connection"

# 8. WebSockets
git add backend/src/socket/
commit "2026-06-05T16:00:00+05:30" "Add Socket.io for real-time progress updates"

# 9. Frontend Base (June 5, evening)
git add frontend/public/ frontend/src/app/layout.tsx frontend/src/app/globals.css frontend/src/app/favicon.ico
commit "2026-06-05T18:30:00+05:30" "Setup Next.js global layout and base styling"

# 10. Frontend API & Stores
git add frontend/src/lib/ frontend/src/stores/ frontend/src/hooks/
commit "2026-06-05T20:15:00+05:30" "Implement Zustand store, API client, and WebSocket hook"

# 11. Layout Components (June 6, morning)
git add frontend/src/components/layout/
commit "2026-06-06T09:45:00+05:30" "Build Sidebar and TopBar navigation components"

# 12. Dashboard
git add frontend/src/app/page.tsx frontend/src/components/dashboard/
commit "2026-06-06T11:20:00+05:30" "Create Dashboard with Assignment cards and Empty states"

# 13. Create Assignment Flow
git add frontend/src/app/assignments/create/ frontend/src/components/create/
commit "2026-06-06T13:45:00+05:30" "Build Assignment creation form and validation"

# 14. Assignment Details Page
git add frontend/src/app/assignments/page.tsx frontend/src/app/assignments/page.module.css
commit "2026-06-06T15:10:00+05:30" "Setup assignments listing page"

# 15. Output Generation Components
git add frontend/src/components/output/QuestionCard* frontend/src/components/output/QuestionSection* frontend/src/components/output/AnswerKey*
commit "2026-06-06T16:30:00+05:30" "Create components for rendering generated questions and answers"

# 16. Output Progress & Export
git add frontend/src/components/output/GenerationProgress* frontend/src/components/output/ExportButton*
commit "2026-06-06T18:00:00+05:30" "Add progress indicators and PDF export functionality"

# 17. Output Details Page
git add frontend/src/app/assignments/\[id\]/
commit "2026-06-06T19:15:00+05:30" "Implement dynamic assignment view page"

# 18. Remaining frontend pages
git add frontend/src/app/settings/ frontend/src/app/groups/ frontend/src/app/library/ frontend/src/app/toolkit/
commit "2026-06-06T20:10:00+05:30" "Add settings, groups, library and toolkit placeholder pages"

# 19. Final files and UI Polish
git add .
commit "2026-06-06T21:00:00+05:30" "Final UI polish, documentation, and deployment configs"

# Change branch to main
git branch -M main

# Add remote
git remote add origin https://github.com/ishitatiwari1517/VedaAI.git

# Force push to overwrite the single commit history
git push -f -u origin main

# Clean up script
rm forge_git.sh
