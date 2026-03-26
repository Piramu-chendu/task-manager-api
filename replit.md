# Workspace

## Overview

Full-stack Task Manager web application with JWT authentication, role-based access control (RBAC), and a complete REST API. The React frontend is served as static files from the Express backend.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + raw `pg` pool queries
- **Auth**: JWT (jsonwebtoken) + bcryptjs
- **Validation**: express-validator
- **Docs**: swagger-ui-express (static embedded spec)
- **Logging**: morgan + pino
- **Rate limiting**: express-rate-limit
- **Frontend**: React 18 via CDN (Babel standalone), single HTML file
- **Build**: esbuild (ESM bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   └── api-server/          # Express API server + React frontend
│       ├── src/
│       │   ├── app.ts               # Express app setup
│       │   ├── index.ts             # Entry point (PORT env var)
│       │   ├── config/
│       │   │   └── swaggerSpec.ts   # Embedded OpenAPI spec
│       │   ├── middleware/
│       │   │   ├── auth.ts          # JWT verify middleware
│       │   │   ├── roleCheck.ts     # Admin role guard
│       │   │   ├── errorHandler.ts  # Global error handler
│       │   │   └── validate.ts      # express-validator handler
│       │   ├── models/
│       │   │   ├── user.model.ts    # SQL queries for users
│       │   │   └── task.model.ts    # SQL queries for tasks
│       │   ├── controllers/
│       │   │   ├── auth.controller.ts
│       │   │   ├── tasks.controller.ts
│       │   │   └── admin.controller.ts
│       │   └── routes/
│       │       ├── index.ts         # Route barrel
│       │       ├── health.ts        # GET /api/healthz
│       │       └── v1/
│       │           ├── auth.routes.ts   # /api/v1/auth
│       │           ├── tasks.routes.ts  # /api/v1/tasks (JWT required)
│       │           └── admin.routes.ts  # /api/v1/admin (admin only)
│       └── public/
│           └── index.html           # React SPA (CDN-based, no build step)
├── lib/
│   ├── db/                  # PostgreSQL pool (DATABASE_URL)
│   └── ...                  # Orval/codegen libs (unused for this project)
└── scripts/
    └── src/seed.ts          # Creates DB tables + admin user
```

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/healthz | None | Health check |
| POST | /api/v1/auth/register | None | Register user |
| POST | /api/v1/auth/login | None | Login → JWT |
| GET | /api/v1/tasks | JWT | Get user's tasks |
| POST | /api/v1/tasks | JWT | Create task |
| PUT | /api/v1/tasks/:id | JWT | Update task |
| DELETE | /api/v1/tasks/:id | JWT | Delete task |
| GET | /api/v1/admin/users | JWT + Admin | List all users |
| DELETE | /api/v1/admin/users/:id | JWT + Admin | Delete user |
| GET | /api/v1/admin/tasks | JWT + Admin | List all tasks |
| GET | /api/docs | None | Swagger UI |

## Default Admin User

- Email: `admin@app.com`
- Password: `admin123`
- Role: `admin`

## Environment Variables (Replit Secrets)

- `DATABASE_URL` — PostgreSQL connection string (auto-provisioned by Replit)
- `JWT_SECRET` — JWT signing secret
- `PORT` — Server port (defaults to 3000)

## Running

```bash
# Seed database (creates tables + admin user)
pnpm --filter @workspace/scripts run seed

# Start development server
pnpm --filter @workspace/api-server run dev

# Build for production
pnpm --filter @workspace/api-server run build
```

## Database Schema

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(10) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'done')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Scalability Notes

- Modular MVC structure (controllers / models / routes / middleware)
- PostgreSQL connection pooling via `pg.Pool`
- Rate limiting via express-rate-limit (100 req/15min)
- JWT stateless auth — scales horizontally
- API versioning: `/api/v1/` prefix, ready for `/api/v2/`
