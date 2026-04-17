# MSK Suggestions Board

An admin dashboard for viewing and managing musculoskeletal (MSK) wellbeing suggestions given to employees by VIDA.

Built as a technical task for Vitrue. The brief asks for one or two small, well-chosen slices of functionality that clearly demonstrate the technical approach, so this project deliberately stays narrow.

## Chosen Scope

1. **Viewing suggestions** — paginated table with server-side filtering by status, type, and employee
2. **Updating status** — click a row to open a detail panel, change status and notes, save

Together these cover a full read-write round trip across the stack (UI → HTTP → validation → store → response → cache invalidation), which shows more about how the codebase is structured than a third slice would.

## Tech Stack

- **Frontend:** Next.js 16 (App Router), React 19, TanStack Query, Tailwind CSS v4, shadcn/ui
- **Backend:** Express 4, Zod for validation
- **Data:** In-memory store seeded from `data/sample-data.json`
- **Language:** TypeScript throughout, with shared types between client and server

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Installation

```bash
# Install root dependencies (concurrently, husky, lint-staged, prettier)
npm install

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### Running the Application

From the project root:

```bash
npm run dev
```

This starts both the Express API (port 3001) and the Next.js frontend (port 3000) concurrently.

Visit [http://localhost:3000](http://localhost:3000) to view the dashboard.

### Individual Services

```bash
npm run dev:server   # Express API only (port 3001)
npm run dev:client   # Next.js frontend only (port 3000)
```

### Quality Checks

```bash
npm run type-check   # tsc --noEmit across client and server
npm run lint         # ESLint + Prettier + type-check
```

Husky and lint-staged run ESLint and Prettier against staged files on commit.

## Project Structure

```
msk-board/
├── client/                    # Next.js App Router frontend
│   └── src/
│       ├── app/               # Route (single page)
│       ├── components/        # UI components (table, filter bar, detail sheet, etc.)
│       ├── hooks/             # TanStack Query hooks and useMediaQuery
│       └── lib/api.ts         # Fetch wrappers
├── server/                    # Express API
│   └── src/
│       ├── routes/            # suggestions.ts, employees.ts
│       ├── data/store.ts      # In-memory store (seeded from sample data)
│       ├── middleware/        # Error handler
│       └── types/             # Shared types (imported by client)
├── data/sample-data.json      # Seed data
└── docs/brief.txt             # Original task brief
```

## API Reference

All responses are JSON. Errors follow a consistent shape: `{ "error": { "message": string, "code": string } }`.

### `GET /api/suggestions`

Returns a paginated list of suggestions enriched with employee name, department, and risk level.

Query parameters (all optional, validated with Zod):

| Param        | Type                                                      | Notes              |
| ------------ | --------------------------------------------------------- | ------------------ |
| `status`     | `pending` \| `in_progress` \| `completed` \| `overdue`    | Filter by status   |
| `type`       | `equipment` \| `exercise` \| `behavioural` \| `lifestyle` | Filter by type     |
| `employeeId` | UUID                                                      | Filter by employee |
| `page`       | positive integer                                          | Defaults to `1`    |
| `limit`      | 1..100                                                    | Defaults to `20`   |

Response:

```json
{
  "data": [
    /* SuggestionWithEmployee[] */
  ],
  "pagination": { "page": 1, "limit": 20, "total": 13, "totalPages": 1 }
}
```

### `PATCH /api/suggestions/:id`

Updates a suggestion's `status` and/or `notes`. Both fields are optional; `dateUpdated` is set on every write and `dateCompleted` is set when status becomes `completed`.

Request body:

```json
{ "status": "in_progress", "notes": "Employee confirmed start date" }
```

Returns the updated record (with employee details) or `404` if the id does not exist.

### `GET /api/employees`

Returns all employees (used to populate the employee filter).

### `GET /api/health`

Liveness probe. Returns `{ "status": "ok" }`.

## Features

- **Paginated table** of MSK suggestions enriched with employee data
- **Server-side filtering** by status, suggestion type, and employee
- **Filter state in URL** — views are shareable and survive refresh
- **Detail panel** to edit status and notes, with toast feedback on success/error
- **Responsive layout** — side panel on desktop, bottom sheet on mobile (shadcn Sheet)
- **Loading and error states** — skeletons while fetching, clear error message on failure
- **Consistent visual hierarchy** — priority indicators and status badges for fast scanning

## Assumptions

- **No authentication.** The dashboard is treated as single-admin. Adding auth would not demonstrate anything that is not already shown elsewhere.
- **Data resets on server restart.** The in-memory store is seeded from `data/sample-data.json`, which is acceptable for a demo.
- **Sample dataset is representative of shape, not scale.** The API and UI are built for a realistic dataset (pagination, server-side filtering) even though the sample only contains 13 rows.
- **`overdue` is a valid status.** The sample data includes one suggestion with `status: "overdue"`, so it is accepted alongside `pending`, `in_progress`, and `completed` throughout the stack.
- **Single-user.** No real-time updates, no concurrency control, no optimistic conflict handling.
- **British English** for user-facing copy, American English for protocol fields (`behavioural` is kept as-is to match the sample data).

## Architectural Decisions

### Overall shape

Two packages in one repo: `server/` (Express REST API) and `client/` (Next.js App Router). In dev, the client proxies `/api/*` to the Express server via a Next.js rewrite, so the browser only ever calls its own origin. TypeScript types are defined once in `server/src/types/` and imported by the client via a `@server/types` path alias.

### Backend

- Three endpoints: list suggestions (filtered + paginated), patch a suggestion, list employees. Plus a health check.
- **Zod** validates every query string and request body. Any validation failure surfaces as a `400 VALIDATION_ERROR` with the first failing message.
- **In-memory store** (`server/src/data/store.ts`) is seeded at import time and exposes `getEmployees`, `getSuggestions`, `getSuggestionById`, and `updateSuggestion`. The interface mirrors what a repository over a real database would look like, so swapping to SQLite/Postgres means changing only the store internals.
- `getSuggestions` applies filters, then paginates, then enriches each row with an `employee` projection using a prebuilt `Map` for O(1) lookup.

### Frontend

- **TanStack Query** owns all server state. Query keys include filter inputs, so changing a filter triggers a new request and caches it separately. The update mutation invalidates the suggestions list on success.
- **shadcn/ui** provides the primitives (Table, Select, Sheet, Button, Badge, Separator, Skeleton, Sonner toast). The codebase adds only thin feature components on top.
- **URL search params** hold filter and page state. A user can bookmark or share a filtered view.
- **Responsive detail panel** uses shadcn Sheet with `side="right"` on desktop and `side="bottom"` on mobile, toggled with a matchMedia hook.

### Error handling

- **Server:** a custom `AppError` class (statusCode + code + message) is caught by a single error-handling middleware that returns the standard `{ error: { message, code } }` shape. Unhandled errors are logged and returned as `500 INTERNAL_ERROR` without leaking internals.
- **Client fetch layer (`lib/api.ts`):** parses the error body where present and throws an `Error` with the server's message, so hooks and components always see a clean message.
- **Component layer:** TanStack Query exposes `isError` on the table, which renders a friendly fallback. The update mutation surfaces failures via a toast (`sonner`).
- **Validation:** Zod is the single source of truth for both the status enum and the type enum, imported by the client for filter controls so there is no drift between valid values on the wire and valid values in the UI.

## Trade-offs

### Separate Express server vs Next.js API routes

I chose a standalone Express API over Next.js API routes to make the frontend/backend separation explicit. This demonstrates clear full-stack thinking: the API is independently testable, deployable, and could serve other clients (mobile, other services). The trade-off is additional setup (two processes, a proxy rewrite, CORS config) and slightly more complexity for what could be a simpler single-process app.

### In-memory store vs database

An in-memory store keeps the project easy to run with zero external dependencies, which is appropriate for a demo. The store exposes a clean interface (`getSuggestions`, `updateSuggestion`) that mirrors what a database repository would look like, so swapping in SQLite/Postgres would only require changing the store internals. The trade-off is that data resets on every server restart and there is no concurrency safety, which would be unacceptable in production.

### Server-side filtering and pagination vs client-side

With only 13 sample records, client-side filtering would be simpler and eliminate several API query parameters. I chose server-side to demonstrate how this would work at real scale, where sending thousands of records to the client is not viable. The trade-off is more code on both sides (Zod query validation, pagination metadata, URL param sync) for a benefit that is only visible with larger datasets.

### TypeScript path alias vs shared package

Importing types directly from the server via a `tsconfig.json` path alias is the simplest way to share types without a monorepo tool (Turborepo, Nx) or a third `shared/` package. The trade-off is that the client has a direct filesystem dependency on the server, which would not work if the two were in separate repositories. For a single-repo project of this size, the simplicity is worth it.

### URL search params for filter state vs component state

Storing filters in URL search params makes filtered views shareable and survives page refreshes. The trade-off is slightly more wiring (reading/writing URLSearchParams, syncing with React state) compared to a simple `useState`. For an admin dashboard where users might share links to specific filtered views, this is the right default.

### Invalidate-on-success vs optimistic updates

The update mutation invalidates the suggestions query on success rather than optimistically patching the cache. With a single-admin scenario and a fast in-memory API, the perceived latency is negligible and the code is simpler. The trade-off is a brief refetch after saving; swapping to `onMutate` + rollback would be straightforward if the API were slower.

### shadcn Sheet for detail panel vs custom drawer

shadcn's Sheet component provides an accessible, animated slide-in panel with minimal code. Using `side="right"` on desktop and `side="bottom"` on mobile gives the responsive behaviour we need. The trade-off is that detecting the viewport to switch sides requires a resize listener and a `useState`, which is a small amount of imperative code in an otherwise declarative component. A more robust approach would use a CSS-only solution or a dedicated responsive sheet library, but this works well for the scope.

### Responsive table vs mobile card view

On narrow viewports the suggestions table hides the Type and Description columns, leaving Employee, Priority, and Status; tapping a row opens the detail sheet with the full record. A dedicated card layout per suggestion would arguably feel more native on mobile, but the brief favours smaller, simpler solutions, and the detail sheet already surfaces everything a card would duplicate. Reusing the same table component across breakpoints keeps the codebase small.

### Scope: two slices vs broader coverage

The brief explicitly asks for "one or two small, well-chosen slices." I chose viewing (with filtering/pagination) and status updates because together they demonstrate a complete read-write flow through the full stack. Creating new suggestions was a close alternative but would have added form validation complexity without showing much new thinking. The trade-off is that the dashboard is not feature-complete, but completeness was explicitly not the goal.
