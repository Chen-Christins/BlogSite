# BlogSite

A personal blog platform. Frontend built with React (Vite + SPA), backend built with Go (Gin + GORM + PostgreSQL).

Status: **backend steps 1–3 and frontend steps 4–5 are complete**.

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend | Vite 5, React 18, TypeScript, React Router 6, TanStack Query, Zustand, TailwindCSS 4 |
| Frontend Markdown | react-markdown + remark-gfm + rehype-highlight (highlighting/copy) + rehype-slug (TOC) |
| Backend | Go 1.26, Gin, GORM, PostgreSQL 16, golang-jwt, zerolog, viper |
| Markdown | goldmark (GFM, renders `content_html` server-side for SEO / future SSR) |
| Storage | `Storage` abstraction, local disk by default, S3/OSS reserved |
| Images | `disintegration/imaging` compression on upload + thumbnail generation |

## Directory Layout

```
BlogSite/
├── backend/
│   ├── cmd/server/          # entrypoint
│   ├── internal/
│   │   ├── config/ logger/ database/ model/ repository/
│   │   ├── service/ handler/ middleware/ router/
│   │   ├── storage/         # storage abstraction (local / s3)
│   │   └── util/            # markdown / slug / jwt / response
│   ├── migrations/          # reference SQL (golang-migrate compatible)
│   ├── config.yaml.example
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── api/             # axios client + all endpoints + types
│   │   ├── stores/          # auth / theme
│   │   ├── hooks/           # useSettings
│   │   ├── components/      # Markdown / Toc / PostCard / Comments + layout
│   │   ├── pages/public/    # home / post / archive / tags / search / about
│   │   ├── pages/admin/     # login / dashboard / posts / editor / media / comments / taxonomy / settings
│   │   └── router/          # routes + guards
│   ├── vite.config.ts       # dev proxy for /api and /uploads to :8080
│   └── package.json
└── docker-compose.yml
```

## Quick Start

### Option 1: Docker Compose (recommended)

```bash
docker compose up -d --build
curl http://localhost:8080/api/health   # {"status":"ok"}
```

### Option 2: Run locally

```bash
# 1. Start PostgreSQL (or reuse an existing instance)
docker run -d --name blogsite-pg \
  -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=blogsite \
  -p 5432:5432 postgres:16-alpine

# 2. Configure and start the backend
cd backend
cp config.yaml.example config.yaml   # edit as needed
BLOG_ADMIN_PASSWORD=admin123 go run ./cmd/server
```

On first start the service creates the tables, sets up the full-text search trigger, and writes default site settings.

## Frontend

```bash
cd frontend
npm install
npm run dev      # http://localhost:5173, proxies /api and /uploads to :8080
npm run build    # output goes to frontend/dist
```

Start the backend first (see above). The build output is a pure static bundle that can be hosted on Nginx/CDN with `/api` and `/uploads` reverse-proxied to the backend.

- Reader routes: `/` (home), `/posts/:slug`, `/archive`, `/tags`, `/tags/:slug`,
  `/category/:slug`, `/search?q=`, `/about`
- Admin routes: `/admin/login`, `/admin` (dashboard), `/admin/posts`, `/admin/posts/new`,
  `/admin/posts/:id`, `/admin/media`, `/admin/comments`, `/admin/categories`,
  `/admin/tags`, `/admin/settings` (all except login require authentication)
- Features: dark mode (persisted in localStorage, flicker-free), live-preview Markdown editor,
  media library picker / drag-and-drop upload, scroll-spy TOC, code copy, threaded comments and moderation.

## Configuration

Config file `config.yaml`; environment variables override it (prefix `BLOG_`, dots replaced by `_`),
e.g. `BLOG_DATABASE_HOST`, `BLOG_ADMIN_PASSWORD`, `BLOG_JWT_SECRET`.

Key options:

| Option | Description |
|---|---|
| `admin.username` / `admin.password` | Admin credentials (password is bcrypt-hashed at startup) |
| `admin.password_hash` | Pre-computed bcrypt hash (takes precedence over the plaintext) |
| `jwt.secret` | JWT signing key, must be changed in production |
| `storage.driver` | `local` or `s3` (s3 reserved) |
| `storage.local.dir` / `base_url` | Local upload directory and public URL prefix |
| `comment.auto_approve` | Whether comments are auto-approved (default false) |
| `comment.rate_limit_per_min` | Per-IP comment submission rate limit per minute |

## API

Unified response body: `{ "code": 0, "message": "ok", "data": ... }`; paginated responses return
`{ list, total, page, size, pages }`.

### Public

```
GET  /api/health
GET  /api/settings
GET  /api/posts?page=&size=&category=&tag=&q=
GET  /api/posts/:slug
GET  /api/search?q=
GET  /api/categories
GET  /api/tags
GET  /api/comments?post_id=          # approved comments only (nested tree)
POST /api/comments                   # submit a comment (rate limited, pending by default)
GET  /uploads/...                    # static files from local storage
```

### Admin (requires `Authorization: Bearer <token>`)

```
POST   /api/admin/login
GET    /api/admin/me

GET    /api/admin/posts?status=&page=&size=
POST   /api/admin/posts
GET    /api/admin/posts/:id
PUT    /api/admin/posts/:id
DELETE /api/admin/posts/:id
POST   /api/admin/posts/:id/publish
POST   /api/admin/posts/:id/unpublish

GET/POST        /api/admin/categories
PUT/DELETE      /api/admin/categories/:id
GET/POST        /api/admin/tags
PUT/DELETE      /api/admin/tags/:id

GET    /api/admin/comments?status=
PUT    /api/admin/comments/:id/status    # pending | approved | spam
DELETE /api/admin/comments/:id

POST   /api/admin/upload                  # multipart field name: file
GET    /api/admin/media
DELETE /api/admin/media/:id

GET    /api/admin/stats/overview          # totals / 30-day trend / top 10 posts
PUT    /api/admin/settings
```

## Features

Backend:

- Markdown rendering to HTML, reading time, summary, auto unique slug (CJK friendly)
- Categories (one-to-many) and tags (many-to-many), draft/published states
- PostgreSQL `tsvector` full-text search (weighted title/summary/body + GIN index + trigger)
- Comments: threading, honeypot + keyword blacklist + rate limiting, moderation
- Media: upload validation, image compression (max edge 1920), automatic thumbnails, storage abstraction
- View counts: async increments on detail view + per-day aggregation; dashboard trend and top posts
- Single-admin JWT auth (bcrypt-stored password)

Frontend:

- Reader: home pagination, post detail (TOC / highlighted code with copy / comments), archive,
  tag/category filtering, full-text search, about page, responsive layout, dark mode
- Admin: login, dashboard (trend chart / top posts), post list with filters,
  Markdown editor (live preview + media insertion + cover selection), media library
  (drag-and-drop upload / copy link / delete), comment moderation (approve / spam / delete),
  category and tag management, site settings

## Possible Extensions

- SEO: dynamic `sitemap.xml` / `rss.xml` (backend), `react-helmet-async` for meta tags, or prerendering
- Object storage: implement `storage.driver=s3` (S3/OSS/MinIO compatible)
- Frontend: route-level lazy loading, PWA, image lazy loading

## Notes

- `vendor/` is not committed; the Docker build downloads modules via `GOPROXY` (override with `--build-arg GOPROXY=...`).
- `storage.driver=s3` is only an interface placeholder; implement `internal/storage/s3.go` before switching.
- The frontend `vite.config.ts` splits vendor chunks; `npm run build` runs `tsc` type checking first.

## License

[MIT](./LICENSE) © 2026 Christins
