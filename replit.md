# Amandine Guide - Tour Guide Website

## Overview

A bilingual (French/German) professional website for a tour guide service covering Lyon, Beaujolais, and Southern Burgundy regions. The application features a public-facing website with tours, blog posts, testimonials, and contact functionality, plus an admin dashboard for content management. Built with React frontend, Express backend, and PostgreSQL database.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript, bundled with Vite
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state and caching
- **Styling**: Tailwind CSS with shadcn/ui component library (New York style)
- **Animations**: Framer Motion for page transitions and reveals
- **Forms**: React Hook Form with Zod validation
- **Internationalization**: Custom language context hook supporting French and German

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Design**: RESTful endpoints defined in `shared/routes.ts` with Zod schemas for validation
- **Authentication**: Replit OpenID Connect integration with Passport.js
- **Session Management**: PostgreSQL-backed sessions via connect-pg-simple

### Data Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Location**: `shared/schema.ts` contains all table definitions
- **Migrations**: Drizzle Kit for schema migrations (`db:push` command)
- **Validation**: drizzle-zod for generating Zod schemas from Drizzle tables

### Project Structure
```
├── client/           # React frontend
│   └── src/
│       ├── components/   # UI components (shadcn/ui)
│       ├── pages/        # Route pages
│       ├── hooks/        # Custom React hooks
│       └── lib/          # Utilities
├── server/           # Express backend
│   ├── routes.ts     # API route handlers
│   ├── storage.ts    # Database operations
│   └── replit_integrations/  # Auth module
├── shared/           # Shared code between client/server
│   ├── schema.ts     # Drizzle table definitions
│   ├── routes.ts     # API contract definitions
│   └── models/       # Type definitions
└── migrations/       # Database migrations
```

### Key Design Patterns
- **Shared API Contracts**: Route definitions with Zod schemas shared between frontend and backend
- **Storage Abstraction**: `IStorage` interface allows swapping implementations
- **Modular Auth**: Authentication isolated in `replit_integrations/auth/` directory
- **Type Safety**: End-to-end TypeScript with shared types

## External Dependencies

### Database
- **PostgreSQL**: Primary database via `DATABASE_URL` environment variable
- **Tables**: users, sessions, testimonials, blogPosts, tours, inquiries

### Authentication
- **Replit Auth**: OpenID Connect provider for user authentication
- **Required Env Vars**: `ISSUER_URL`, `REPL_ID`, `SESSION_SECRET`

### UI Libraries
- **shadcn/ui**: Pre-built accessible components based on Radix UI primitives
- **Lucide React**: Icon library
- **date-fns**: Date formatting with locale support (fr, de)

### Build Tools
- **Vite**: Development server and frontend bundler
- **esbuild**: Server-side bundling for production
- **tsx**: TypeScript execution for development

### Replit-Specific
- **@replit/vite-plugin-runtime-error-modal**: Error overlay in development
- **@replit/vite-plugin-cartographer**: Development tooling