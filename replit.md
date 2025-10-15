# Restaurant Management System

## Overview

This is a complete delivery restaurant management system built with a modern web stack. The application provides comprehensive tools for managing products, orders, customers, and analytics for a restaurant business. It features a responsive web interface with real-time data visualization and operational dashboards.

The system is designed as a full-stack TypeScript application with a React frontend and Express backend, using Drizzle ORM for database operations and shadcn/ui components for a polished user interface.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build Tools:**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server for fast HMR (Hot Module Replacement)
- Wouter for lightweight client-side routing instead of React Router

**UI Component System:**
- shadcn/ui component library built on Radix UI primitives
- Tailwind CSS for utility-first styling with custom design tokens
- Material Design-inspired approach optimized for data-heavy operational interfaces
- Custom theme system with CSS variables for consistent theming (light mode focused)

**State Management:**
- TanStack Query (React Query) for server state management and caching
- React Hook Form with Zod for form validation and management
- Local component state using React hooks

**Data Visualization:**
- Chart.js integration for analytics dashboards and reporting
- Custom chart components for sales trends, order statistics, and product performance

**Design System:**
- Professional dashboard aesthetic with emphasis on clarity and efficiency
- Status-based color coding for order states (pending, confirmed, preparing, ready, delivered, cancelled)
- Responsive design using Tailwind breakpoints
- Custom hover and elevation effects for interactive elements

### Backend Architecture

**Server Framework:**
- Express.js running on Node.js with ES modules
- TypeScript for type safety across the entire backend
- Custom middleware for request logging and error handling

**Database Layer:**
- Drizzle ORM for type-safe database operations
- PostgreSQL as the primary database (configured for Neon serverless)
- In-memory storage implementation (MemStorage) for development/testing
- Schema-driven approach with Zod validation

**API Design:**
- RESTful API endpoints organized by resource (products, orders, customers, analytics)
- Consistent error handling and response formats
- Request/response validation using Zod schemas
- Query-based filtering and pagination support

**Data Models:**
- Products: Inventory management with categories, pricing, and stock tracking
- Orders: Full order lifecycle with items, customer info, and status tracking
- Customers: Aggregated customer data from order history
- Analytics: Computed metrics for business intelligence

### External Dependencies

**UI Component Libraries:**
- @radix-ui/* - Accessible, unstyled UI primitives for complex components
- shadcn/ui - Pre-built, customizable component system
- lucide-react - Icon library for consistent iconography
- cmdk - Command palette implementation

**Data & Forms:**
- @tanstack/react-query - Server state management and caching
- react-hook-form - Form state management
- @hookform/resolvers - Form validation resolvers
- zod - Schema validation library
- drizzle-zod - Zod schema generation from Drizzle schemas

**Database & ORM:**
- drizzle-orm - TypeScript ORM for database operations
- @neondatabase/serverless - Serverless PostgreSQL driver for Neon
- drizzle-kit - CLI tool for database migrations and schema management

**Charting & Visualization:**
- chart.js - Canvas-based charting library
- react-chartjs-2 - React wrapper for Chart.js
- date-fns - Date manipulation and formatting

**Styling:**
- tailwindcss - Utility-first CSS framework
- tailwind-merge - Utility for merging Tailwind classes
- class-variance-authority - Type-safe variant API for components
- clsx - Conditional className utility

**Development Tools:**
- vite - Frontend build tool and dev server
- tsx - TypeScript execution engine
- esbuild - Fast JavaScript bundler for production builds
- @replit/vite-plugin-* - Replit-specific development plugins

**Session & Storage:**
- express-session - Session middleware (infrastructure present but not actively used)
- connect-pg-simple - PostgreSQL session store

The application follows a monorepo-like structure with shared types and schemas between frontend and backend, ensuring type safety across the full stack. The architecture is designed for scalability with clear separation between presentation, business logic, and data layers.