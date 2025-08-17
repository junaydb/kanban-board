# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Current Goal

The current goal is to migrate from pgtyped to drizzle ORM, using a codebase first schema approach.

## Development Commands

- `npm run dev` - Start development server with tsx watch on port 3000
- `npm run test` - Run all tests with Vitest
- `npm run test:unit` - Run unit tests only
- `npm run test:integration` - Run integration tests only
- `npm run seed-db` - Seed the main database with test data
- `npm run seed-test-db` - Seed the test database with test data
- `npm run drop-test-db` - Drop the test database

## Architecture Overview

This is a TypeScript backend for a kanban board application built with:

### Core Stack

- **Hono** - Web framework serving as the HTTP server
- **tRPC** - Type-safe API layer exposed at `/api/trpc/*`
- **PostgreSQL** - Database with direct pg queries
- **Zod** - Runtime validation and schema definition
- **Vitest** - Testing framework

### Key Architecture Patterns

**tRPC Integration**: The application migrated from REST routes to tRPC. The main router is in `src/main/trpc/appRouter.ts` and routes are organized by domain (currently just `tasks`).

**Database Layer**: Uses direct PostgreSQL queries with the pg library. SQL queries are defined in `src/main/queries/taskQueries.sql` with corresponding TypeScript interfaces in `taskQueries.queries.ts`.

**Cursor-Based Pagination**: Implements cursor-based pagination for task lists with support for sorting by creation date or due date. The pagination system uses base64-encoded cursors and strategy pattern in `src/main/util/pagination.ts`.

**Error Handling**: Centralized error handling in `src/main/index.ts` with custom error types like `TaskNotFoundError`. Zod validation errors are automatically converted to helpful HTTP responses.

## Database Setup

- Main database: `kanban_board`
- Test database: `kanban_board_test`
- Environment controlled by `DB_PROD` environment variable
- Database configuration in `src/main/db/index.ts` uses connection pooling
- Seed files: `seed_db.sql` and `seed_test_db.sql`

## Task Model

The Task model (`src/main/models/Task.ts`) provides:

- CRUD operations using direct PostgreSQL queries
- Pagination support with multiple sort strategies
- Both throwing and safe variants of query methods
- Status management (TODO, IN_PROGRESS, DONE)

## Testing Strategy

- **Integration tests**: Test against real test database in `src/test/integration/`
- **Unit tests**: Mock database queries for edge cases in `src/test/unit/`
- Tests automatically use test database when `DB_PROD=false`
- Comprehensive coverage of pagination, CRUD operations, and error cases

## Project Structure

- `src/main/` - Application code
  - `index.ts` - Server entry point with Hono setup
  - `trpc/` - tRPC configuration and routers
  - `routes/` - Domain-specific route handlers and schemas
  - `models/` - Database models
  - `util/` - Shared utilities (errors, pagination, response wrappers)
- `src/test/` - Test suites organized by type

