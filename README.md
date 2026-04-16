# BugXYZ - AI-Enhanced Bug Tracking System

A production-ready, full-stack bug tracking system with 15 AI-powered features, built with Java Spring Boot, React + TypeScript, and PostgreSQL.

## Quick Start

```bash
docker compose up --build
```

That's it. The entire system starts with one command:

| Service    | URL                           | Credentials                          |
| ---------- | ----------------------------- | ------------------------------------ |
| Frontend   | http://localhost:3000          | admin@bugxyz.com / password          |
| Backend    | http://localhost:8080/swagger-ui.html | JWT Bearer token           |
| pgAdmin    | http://localhost:5050          | admin@bugxyz.com / admin             |
| PostgreSQL | localhost:5432                 | bugxyz / bugxyz_secret               |

### Demo Users (seeded automatically)

| Email                | Password | Role      |
| -------------------- | -------- | --------- |
| admin@bugxyz.com     | password | ADMIN     |
| dev1@bugxyz.com      | password | DEVELOPER |
| dev2@bugxyz.com      | password | DEVELOPER |
| tester@bugxyz.com    | password | TESTER    |

## Architecture

```
bugxyz/
├── docker-compose.yml        # 4 services: postgres, pgadmin, backend, frontend
├── backend/                  # Java 21 + Spring Boot 3.4 + Maven
│   ├── Dockerfile            # Multi-stage: JDK build -> JRE runtime
│   └── src/main/
│       ├── java/com/bugxyz/
│       │   ├── config/       # Security, CORS, OpenAPI
│       │   ├── controller/   # REST controllers (Auth, Bug, Project, User, Analytics, AI)
│       │   ├── dto/          # Request/Response DTOs
│       │   ├── entity/       # 10 JPA entities
│       │   ├── enums/        # Status, Severity, Priority, Role, etc.
│       │   ├── exception/    # Global error handling
│       │   ├── repository/   # Spring Data JPA repos
│       │   ├── security/     # JWT auth (jjwt)
│       │   └── service/
│       │       ├── ai/       # 10 AI/heuristic services
│       │       └── *.java    # Business logic
│       └── resources/
│           └── db/migration/ # Flyway V1-V11 migrations + seed data
└── frontend/                 # React 18 + TypeScript + Vite
    ├── Dockerfile            # Multi-stage: Node build -> nginx serve
    ├── nginx.conf            # API proxy + SPA fallback
    └── src/
        ├── api/              # Axios client with JWT interceptor
        ├── components/       # shadcn/ui + custom components
        ├── hooks/            # React Query wrappers
        ├── pages/            # 11 route pages
        ├── store/            # Auth context
        └── types/            # TypeScript interfaces
```

## Tech Stack

### Backend
- **Java 21** + **Spring Boot 3.4**
- **Spring Security** with JWT (jjwt 0.12.6) - stateless auth
- **Spring Data JPA** + Hibernate with JPA Specifications for dynamic filtering
- **PostgreSQL 16** with full-text search (GIN indexes, tsvector), array columns, JSONB
- **Flyway** for database migrations
- **SpringDoc OpenAPI** for Swagger UI

### Frontend
- **React 18** + **TypeScript 5** + **Vite 6**
- **TailwindCSS 3.4** with shadcn/ui-style components
- **TanStack React Query v5** for server state management
- **React Router v6** for routing
- **Recharts** for data visualization
- **Axios** with JWT interceptor and token refresh queue

## Database Schema

10 core entities with 11 Flyway migrations:

- **users** - Authentication, roles (ADMIN/DEVELOPER/TESTER)
- **projects** - Bug containers with unique keys
- **project_members** - Many-to-many with roles
- **bugs** - 25+ columns including tags (text[] with GIN), full-text search index
- **comments** - Threaded discussion per bug
- **attachments** - File uploads with metadata
- **activity_log** - Full audit trail with JSONB details
- **bug_relations** - BLOCKS/BLOCKED_BY/DUPLICATE_OF/RELATED_TO/PARENT_OF/CHILD_OF
- **ai_suggestions** - Stored AI recommendations
- **environment_snapshots** - OS/browser/device per bug
- **bug_confirmations** - Reproducibility confirmations

## 15 AI Features (No External APIs)

All AI features use local heuristics - no API keys, no external services:

1. **Smart Duplicate Detection** - Custom TF-IDF engine with cosine similarity. PostgreSQL full-text search finds candidates, TF-IDF reranks by semantic similarity.

2. **Automatic Severity Prediction** - Keyword-weighted scoring: critical words (crash, data loss, security) = 5 pts, high (error, broken) = 3 pts. Stack trace detection bonus.

3. **Reproducibility Score** - Multi-factor: confirmation ratio (40%), environment diversity (20%), reporter credibility (15%), steps quality (15%), self-reported (10%).

4. **Time-to-Fix Prediction** - Statistical model using median fix duration by (severity, type, project) from historical data.

5. **Developer Load Balancer** - Multi-factor scoring: workload (40%), expertise via tag overlap (30%), velocity (20%), recency (10%).

6. **Environment Snapshot** - Capture OS, browser, device type, resolution, app version per bug report.

7. **Bug Relationship Graph** - Track BLOCKS, BLOCKED_BY, DUPLICATE_OF, RELATED_TO, PARENT_OF, CHILD_OF with automatic inverse creation.

8. **Reproduction Steps Recorder** - Structured steps-to-reproduce with expected vs. actual behavior tracking.

9. **Auto Regression Detection** - TF-IDF similarity against recently closed bugs; flag potential regressions above 0.6 threshold.

10. **Fix Impact Analysis** - BFS through bug relations (depth 3), count blocked bugs, find max severity in dependency chain.

11. **Smart Release Notes Generator** - Auto-generate markdown release notes from resolved bugs grouped by type.

12. **Stale Bug Auto-Detection** - Scheduled daily: mark bugs with no activity > 14 days as stale.

13. **Productivity Insights Dashboard** - Developer stats: open/resolved counts, avg fix time, reopen rates.

14. **Conversational Bug Creation** - Natural language parsing: regex extraction of title, severity keywords, OS/browser patterns, numbered steps.

15. **Technical Debt Tagging** - Categorize and track technical debt bugs with trend analysis.

## API Endpoints

### Authentication
| Method | Endpoint               | Description          |
| ------ | ---------------------- | -------------------- |
| POST   | /api/v1/auth/register  | Register new user    |
| POST   | /api/v1/auth/login     | Login, get JWT       |
| POST   | /api/v1/auth/refresh   | Refresh access token |
| GET    | /api/v1/auth/me        | Current user profile |

### Bugs
| Method | Endpoint                        | Description             |
| ------ | ------------------------------- | ----------------------- |
| GET    | /api/v1/bugs                    | List bugs (filtered)    |
| POST   | /api/v1/bugs                    | Create bug              |
| GET    | /api/v1/bugs/{id}               | Get bug detail          |
| PUT    | /api/v1/bugs/{id}               | Update bug              |
| PATCH  | /api/v1/bugs/{id}/status        | Change status           |
| PATCH  | /api/v1/bugs/{id}/assign        | Assign bug              |
| GET    | /api/v1/bugs/{id}/comments      | List comments           |
| POST   | /api/v1/bugs/{id}/comments      | Add comment             |
| GET    | /api/v1/bugs/{id}/attachments   | List attachments        |
| POST   | /api/v1/bugs/{id}/attachments   | Upload file             |
| GET    | /api/v1/bugs/{id}/history       | Activity history        |
| GET    | /api/v1/bugs/{id}/relations     | Bug relations           |
| POST   | /api/v1/bugs/{id}/relations     | Add relation            |
| GET    | /api/v1/bugs/{id}/confirmations | Reproducibility confirms|
| POST   | /api/v1/bugs/{id}/confirmations | Confirm/deny bug        |
| GET    | /api/v1/bugs/{id}/environment   | Environment snapshots   |
| POST   | /api/v1/bugs/{id}/environment   | Add env snapshot        |

### AI Features
| Method | Endpoint                          | Description              |
| ------ | --------------------------------- | ------------------------ |
| POST   | /api/v1/ai/detect-duplicates      | Find similar bugs        |
| POST   | /api/v1/ai/predict-severity       | Predict severity/priority|
| POST   | /api/v1/ai/parse-natural-language | Parse NL bug description |
| GET    | /api/v1/ai/predict-fix-time/{id}  | Estimate fix duration    |
| GET    | /api/v1/ai/suggest-assignee/{id}  | Recommend developer      |
| GET    | /api/v1/ai/release-notes/{pid}    | Generate release notes   |
| GET    | /api/v1/ai/fix-impact/{id}        | Analyze fix impact       |

### Analytics
| Method | Endpoint                          | Description              |
| ------ | --------------------------------- | ------------------------ |
| GET    | /api/v1/analytics/dashboard       | Dashboard summary        |
| GET    | /api/v1/analytics/mttf            | Mean time to fix         |
| GET    | /api/v1/analytics/throughput      | Weekly open/resolved     |
| GET    | /api/v1/analytics/aging           | Bug aging distribution   |
| GET    | /api/v1/analytics/developer-stats | Developer productivity   |
| GET    | /api/v1/analytics/stale-bugs      | Stale bugs list          |
| GET    | /api/v1/analytics/tech-debt       | Tech debt overview       |

## Frontend Pages

1. **Login/Register** - JWT authentication with demo credentials
2. **Dashboard** - Stats cards, pie/bar charts, recent bugs, activity feed
3. **Projects** - Card grid, create project, member management
4. **Project Detail** - Bugs table, members, analytics (charts)
5. **Bugs List** - Filterable table with search, status, severity filters, pagination
6. **Create Bug** - AI conversational creator, duplicate detection, severity prediction
7. **Bug Detail** - 2-column layout: description, comments, history, relations, attachments + sidebar with actions, details, reproducibility gauge, AI insights
8. **Edit Bug** - Pre-filled form for updating bug fields
9. **Users Management** - Role management, activate/deactivate (admin only)
10. **Analytics** - 6 tabs: MTTF, Throughput, Aging, Developers, Stale Bugs, Tech Debt
11. **Release Notes** - AI-generated release notes by project and version

## Development

### Local Development (without Docker)

Backend:
```bash
cd backend
./mvnw spring-boot:run
```

Frontend:
```bash
cd frontend
npm install
npm run dev
```

### Environment Variables

See `.env.example` for all configurable values:
- `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`
- `JWT_SECRET` (min 32 chars)
- `PGADMIN_DEFAULT_EMAIL`, `PGADMIN_DEFAULT_PASSWORD`

## License

MIT
