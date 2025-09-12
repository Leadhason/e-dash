# Tools & Power Technologies E-Commerce Management Dashboard

## Overview

This is a comprehensive e-commerce management dashboard built for Tools & Power Technologies, designed to serve internal business operations across multiple departments. The application provides a centralized platform for managing all aspects of the tools and power equipment business, from inventory and product catalog management to customer relationships, order processing, warranties, and vendor coordination.

The system is built as a full-stack web application using modern technologies with role-based access control to support different user types including super admins, operations managers, product managers, customer service representatives, sales staff, warehouse managers, and technical support personnel.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The frontend is built as a Single Page Application (SPA) using React with TypeScript. The application uses Wouter for client-side routing and implements a component-based architecture with reusable UI components based on the shadcn/ui design system. The frontend follows a modular structure with separate pages for each major feature area (dashboard, products, orders, customers, warranties, vendors) and shared layout components.

### Backend Architecture  
The backend is implemented using Express.js with TypeScript, providing a RESTful API architecture. The server implements JWT-based authentication with role-based access control middleware to secure endpoints based on user roles. The API follows RESTful conventions with dedicated routes for each resource type and implements proper error handling and logging middleware.

### Data Storage and Schema
The application uses PostgreSQL as the primary database with Drizzle ORM for type-safe database operations. The database schema is industry-specific, designed around the tools and power equipment business domain with tables for:
- Users with role-based permissions
- Customers with different types (individual, professional contractor, industrial account, etc.)
- Products with detailed specifications and categorization for tools and equipment
- Inventory management with multi-location support
- Orders with various types (retail, bulk, emergency, warranty, recurring)
- Warranty tracking and claims management
- Vendor relationships and supplier information

### Authentication and Authorization
The system implements JWT-based authentication with stateless token management. Role-based access control (RBAC) is enforced through middleware that validates user permissions for different endpoints. The frontend maintains authentication state through React context and automatically redirects unauthenticated users to the login page.

### State Management and Data Fetching
The frontend uses TanStack Query (React Query) for server state management, providing caching, background updates, and optimistic updates. This approach separates server state from local UI state and provides a better user experience with loading states and error handling.

### UI and Styling
The application uses Tailwind CSS for styling with a custom design system based on shadcn/ui components. The design system includes consistent theming with CSS custom properties for colors, spacing, and typography. The interface is responsive and includes proper accessibility considerations.

### Development and Build Process
The project uses Vite as the build tool for fast development and optimized production builds. The development setup includes hot module replacement and error overlay for improved developer experience. TypeScript is used throughout for type safety, and the project includes proper path mapping for clean imports.

## External Dependencies

### Database Services
- **PostgreSQL**: Primary database for persistent data storage
- **Neon Database**: Cloud PostgreSQL provider (based on connection string pattern)

### Authentication and Security
- **bcryptjs**: Password hashing and validation
- **jsonwebtoken**: JWT token generation and verification

### Frontend Libraries
- **React**: Core frontend framework with TypeScript
- **TanStack Query**: Server state management and caching
- **React Hook Form**: Form handling and validation
- **Wouter**: Lightweight client-side routing
- **Recharts**: Data visualization and charts

### UI Component Libraries
- **Radix UI**: Headless UI components for accessibility
- **shadcn/ui**: Pre-built component library based on Radix
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library

### Development Tools
- **Vite**: Build tool and development server
- **Drizzle ORM**: Type-safe database ORM and migrations
- **Drizzle Kit**: Database migration and schema management
- **TypeScript**: Type checking and enhanced development experience
- **ESBuild**: Fast JavaScript bundler for production builds

### Validation and Schema
- **Zod**: Runtime type validation and schema definition
- **@hookform/resolvers**: Form validation integration

The application is designed to be deployed as a single full-stack application with the Express server serving both the API and the static frontend assets in production.