# Job Application Tracker

Track job applications, manage resumes, and get AI-powered resume analysis to understand your fit for each role—all in one place.

**Try it:** [Job-Application-Tracker](https://job-application-tracker-frontend-green.vercel.app) | **Code:** [GitHub](https://github.com/bhardwaj-shubham/job-application-tracker)

> **Note:** The backend is hosted on Render and may take **30–40 seconds to wake up** after inactivity. Please wait briefly if the first request takes longer than usual.

## Features

- **Job Application Management** – Create, track, and organize applications with status, dates, and job descriptions
- **Resume Management** – Upload, view, replace, and delete resumes for each application
- **AI Resume Analysis** – Get a match score, identify missing skills, and receive improvement suggestions powered by Google Gemini
- **Notes Management** – Keep application-specific notes organized and accessible
- **User Authentication** – Signup/login with JWT-based authentication
- **Responsive Design** – Works seamlessly on desktop and mobile

## Demo

A short walkthrough of the main application flow.

**Watch the demo:** <video src="https://github.com/bhardwaj-shubham/job-application-tracker/releases/download/v0.1-demo/Job-Tracker-App-Demo.mp4" controls width="100%"></video>

## Quick Start

### Prerequisites

- **Node.js** 22+
- **PostgreSQL** 16+
- **Redis** 8+
- **pnpm**

### Local Setup with Docker

```bash
# Start PostgreSQL and Redis using Docker Compose
docker-compose up -d

# PostgreSQL → localhost:5432
# Redis      → localhost:6379
```

### Installation

```bash
# Clone repository
git clone https://github.com/bhardwaj-shubham/job-application-tracker.git
cd job-application-tracker

# Backend setup
cd backend
pnpm install

# Create .env file from .env.example
# Required: DATABASE_URL, REDIS_URL, JWT_SECRET,
# CLOUDINARY_*, GEMINI_API_KEY, FRONTEND_URL, NODE_ENV

# Run migrations
pnpm prisma migrate dev

# Terminal 1: Start API server
pnpm dev

# Terminal 2: Start background worker
pnpm run worker

# Frontend setup
cd ../frontend
pnpm install

# Create .env.local
# Required: VITE_API_URL=http://localhost:3000/api/v1

# Terminal 3: Start frontend
pnpm dev
```

Visit `http://localhost:5173`.

## Tech Stack

### Frontend

- **React 19** + **TypeScript** – Type-safe UI
- **Vite** – Build and development tooling
- **React Router** – Client-side routing
- **Tailwind CSS** + **shadcn/ui** – Styling and UI components
- **TanStack Table** – Application data tables
- **Zod** – Client-side validation

### Backend

- **Node.js** + **Express** – REST API server
- **JavaScript** – Backend application code
- **PostgreSQL** + **Prisma** – Relational database and ORM
- **Redis** + **BullMQ** – Background job processing
- **Zod** – Request validation
- **Vitest** + **Supertest** – Unit and integration testing

### Services

- **Cloudinary** – Document storage
- **Google Gemini** – AI resume analysis

## Architecture

```text
                        ┌──────────────────┐
                        │  React 19 + TS   │
                        │    Frontend      │
                        └────────┬─────────┘
                                 │ HTTPS
                                 ▼
                        ┌──────────────────┐
                        │  Node + Express  │
                        │    Backend (JS)  │
                        └─────┬──┬──┬──────┘
                              │  │  │
                   ┌──────────┘  │  └─────────────┐
                   ▼             ▼                ▼
            ┌────────────┐ ┌──────────┐    ┌────────────┐
            │ PostgreSQL │ │  Redis   │    │ Cloudinary │
            │   Prisma   │ │  BullMQ  │    │  Documents │
            └────────────┘ └────┬─────┘    └────────────┘
                                 │
                                 ▼
                          ┌──────────────┐
                          │    Worker    │
                          │  (BullMQ)    │
                          └──────┬───────┘
                                 │
                                 ▼
                          ┌──────────────┐
                          │    Gemini    │
                          │ AI Analysis  │
                          └──────────────┘
```

## Resume Analysis Flow

1. User uploads a PDF resume and adds a job description.
2. API validates the request and creates an analysis job.
3. BullMQ stores the job in Redis.
4. Worker processes the job asynchronously.
5. Resume text is extracted and selected PII is sanitized.
6. Worker sends the sanitized resume and job description to Gemini.
7. Analysis results are stored in PostgreSQL.
8. Frontend polls for the analysis status and displays the result.

## Engineering Decisions

### Async Resume Analysis

Resume analysis can take several seconds because it involves PDF extraction and an external Gemini API call. I didn't want to keep the API request open for the whole operation.

The API creates an analysis job and returns `202`. A BullMQ worker picks it up and processes it separately. The frontend polls the analysis status until the result is available.

This keeps the API responsive.

---

### Redis + BullMQ

I used Redis as the backing store for BullMQ because the analysis work needs to happen outside the API process.

The queue also gives the worker retry support and lets the API and worker scale independently.

---

### Job Retries and Failure Handling

Gemini or other parts of the analysis pipeline can fail temporarily, so a failed job shouldn't immediately be treated as permanently failed.

Analysis jobs get up to 3 attempts with exponential backoff. Jobs that still fail are moved to a separate failed-job queue, and stalled jobs are handled by BullMQ's worker configuration.

The goal here was to make failure behavior explicit instead of simply catching an error and losing the job.

---

### Rate Limiting and Distributed Throttling

There are different limits for different parts of the API:

- Global IP request limit
- Login attempts
- Signup attempts
- Per-user API quota
- Resume-analysis quota

The analysis endpoint has a stricter per-user limit because it triggers an external AI request.

For Gemini itself, I needed a limit shared across workers, so I used Redis rather than an in-memory limiter.

---

### Token Bucket for Gemini

The Gemini throttle uses a Redis-backed token bucket.

It has a capacity of 3 tokens and refills 1 token every 5 seconds. Token updates are performed atomically with a Lua script.

Using Redis means multiple workers see the same bucket instead of maintaining separate limits in each process.

---

### PII Sanitization

A resume contains information that Gemini doesn't need for the analysis, such as the candidate's email address and phone number.

Before sending the extracted resume text to Gemini, I replace those values with `[EMAIL]` and `[PHONE]`.

This is a small step, but it reduces the amount of personal information sent to the external AI service.

---

### Ownership Checks

Every application-related resource is associated with a user.

When fetching or modifying a resource, the backend checks both the resource ID and the authenticated user's ID. I don't rely on the frontend to prevent users from accessing another user's resources.

This keeps the ownership check close to the actual database operation.

---

### PostgreSQL + Prisma

The application has several related entities: users, applications, notes, documents, and analyses.

PostgreSQL fits this relationship-heavy data well, while Prisma handles the schema, migrations, relationships, and database access.

I also use database constraints where they are useful, such as enforcing the one-to-one relationship between an application and its resume analysis.

## Project Structure

```text
job-application-tracker/
├── backend/                        Backend API (JavaScript)
│   ├── src/
│   │   ├── config/
│   │   ├── constants/
│   │   ├── controllers/            HTTP request handlers
│   │   ├── integrations/           External services: Gemini, Cloudinary, Redis
│   │   ├── middleware/
│   │   ├── queues/                 BullMQ queue
│   │   ├── repositories/
│   │   ├── routes/
│   │   ├── services/               Business logic
│   │   ├── utils/
│   │   ├── validators/
│   │   ├── workers/                Background job workers
│   │   └── app.js                  Express application setup
│   │
│   ├── prisma/
│   │   ├── migrations/             Database migrations
│   │   └── schema.prisma           Database schema
│   │
│   ├── tests/                      Unit and integration tests
│   │
│   ├── scripts/                    Production and utility scripts
│   ├── server.js                   Server entry point
│   └── docker-compose.yml
│
├── frontend/                       Frontend application (TypeScript + React)
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── lib/
│   │   ├── pages/
│   │   ├── schemas/
│   │   ├── services/               API communication
│   │   ├── utils/
│   │   ├── App.tsx
│   │   └── main.tsx
│   │
│   ├── public/
│   ├── index.html
│   └── vercel.json
│
├── LICENSE
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
└── README.md
```

## Testing

Backend: **118 tests across 9 test files**

```bash
cd backend

pnpm test
pnpm test:watch
```

Test coverage includes:

- Authentication
- Application CRUD
- Document operations
- Resume analysis pipeline
- Rate-limit enforcement
- Ownership protection

## Environment Variables

### Backend `.env`

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/job_tracker

# Redis
REDIS_URL=redis://localhost:6379

# Auth
JWT_SECRET=your-secret-key-min-32-characters
JWT_EXPIRES_IN=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Gemini
GEMINI_API_KEY=your-gemini-api-key

# CORS
FRONTEND_URL=http://localhost:5173

# Environment
NODE_ENV=development
```

### Frontend `.env.local`

```env
VITE_API_URL=http://localhost:3000/api/v1
```

Never commit environment files containing secrets.

## Deployment

The application is deployed as separate frontend, API, worker, database, Redis, and document-storage services.

| Component         | Service       |
| ----------------- | ------------- |
| Frontend          | Vercel        |
| API               | Render        |
| Background worker | Render        |
| PostgreSQL        | Neon          |
| Redis             | Upstash       |
| Document storage  | Cloudinary    |
| AI analysis       | Google Gemini |

The frontend communicates with the backend API over HTTPS, while resume analysis is processed asynchronously by the background worker.

## What I Learned

This project provided hands-on experience with:

- JWT-based authentication
- REST API design and error handling
- Relational database design and migrations
- Background job processing
- Job retries and failure handling
- Rate limiting and quotas
- Distributed throttling with Redis
- Authorization and ownership protection
- Unit and integration testing
- Cloud storage integration
- Asynchronous AI processing

## Project Status

The MVP is complete and demonstrates the core application and backend architecture, including authentication, relational data management, document storage, asynchronous AI processing, job retries, rate limiting, distributed throttling, and resource ownership protection.

The project is intentionally kept focused rather than expanded into a full production SaaS. Further improvements may be explored as part of continued backend and system-design learning.

## License

MIT – See [LICENSE](LICENSE).

---

Built by [Shubham Bhardwaj](https://github.com/bhardwaj-shubham) to learn backend engineering and full-stack development.
