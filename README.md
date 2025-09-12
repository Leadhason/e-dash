# Tools & Power Technologies E-Commerce Management Dashboard

A comprehensive internal-facing application for managing product catalog, inventory, customer relationships, order processing, warranty claims, vendor management, and business analytics with role-based access control.

## 🚀 Features

- **Product Catalog Management** - Manage tools, equipment, and product categories
- **Inventory Tracking** - Monitor stock levels across multiple locations
- **Customer Relationship Management** - Handle individual consumers, professional contractors, and industrial accounts
- **Order Processing** - Manage retail, bulk, emergency, and warranty orders
- **Warranty Management** - Register warranties and process claims
- **Vendor Management** - Maintain supplier relationships
- **Business Analytics** - Comprehensive dashboards and insights
- **Role-Based Access Control** - 7 user roles with appropriate permissions
- **Customer Support** - Ticket management and technical assistance

## 🛠 Technology Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety and developer experience
- **Tailwind CSS** - Utility-first CSS framework
- **Wouter** - Lightweight React router
- **TanStack Query (React Query)** - Server state management
- **React Hook Form** - Form handling and validation
- **Zod** - Schema validation
- **Radix UI** - Accessible component primitives
- **Lucide React** - Icon library
- **Vite** - Build tool and dev server

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web application framework
- **TypeScript** - Type safety
- **Drizzle ORM** - Type-safe database operations
- **PostgreSQL** - Relational database (direct connection via postgres-js)
- **JSON Web Tokens (JWT)** - Authentication
- **bcryptjs** - Password hashing
- **postgres-js** - PostgreSQL client

### Development & Deployment
- **TSX** - TypeScript execution
- **ESBuild** - Fast bundling
- **Replit** - Development and hosting platform

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn package manager

## 🔧 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd tools-power-tech-dashboard
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:
```env
NODE_ENV=development
DATABASE_URL=postgresql://username:password@localhost:5432/database_name
JWT_SECRET=your-super-secret-jwt-key-here-minimum-32-characters
PORT=5000
```

**Required Environment Variables:**
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Strong secret for JWT tokens (minimum 32 characters)
- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (defaults to 5000)

**Security Note**: Use strong, unique secrets in production. Consider using a secure password generator.

### 4. Database Setup

#### Push Schema to Database
```bash
npm run db:push
```

#### (Optional) Force Push Schema Changes
```bash
npm run db:push -- --force
```

### 5. Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:5000` (or the port specified by `PORT` environment variable)

### 6. Default Login Credentials
⚠️ **SECURITY WARNING**: Change these default credentials immediately in production!

- **Username:** `admin`
- **Password:** `admin123`
- **Role:** Super Admin

**Important**: These default credentials are created automatically on first run. You should:
1. Login immediately after setup
2. Change the password through the Settings page
3. Consider disabling the default admin creation in production

## 📁 Project Structure

```
├── client/                     # Frontend React application
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── ui/            # Base UI components (shadcn)
│   │   │   ├── dashboard/     # Dashboard-specific components
│   │   │   └── layout/        # Layout components
│   │   ├── pages/             # Application pages
│   │   ├── hooks/             # Custom React hooks
│   │   ├── lib/               # Utilities and configurations
│   │   └── types/             # TypeScript type definitions
├── server/                     # Backend Express application
│   ├── database-storage.ts    # Database operations layer
│   ├── storage.ts             # Storage interface
│   ├── routes.ts              # API routes
│   └── index.ts               # Server entry point
├── shared/                     # Shared code between client and server
│   └── schema.ts              # Database schema and types
├── migrations/                 # Database migration files
└── drizzle.config.ts          # Drizzle ORM configuration
```

## 🔐 User Roles & Permissions

1. **Super Admin** - Full system access
2. **Operations Manager** - Operations oversight
3. **Product Manager** - Product catalog management
4. **Customer Service** - Customer support and order management
5. **Sales Rep** - Customer relationships and sales
6. **Warehouse Manager** - Inventory and fulfillment
7. **Technical Support** - Customer technical assistance

## 🚀 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production  
- `npm run start` - Start production server
- `npm run check` - Type checking with TypeScript
- `npm run db:push` - Push schema to database

## 🔄 Technology Replacements & Migration Guide

### Database & ORM Alternatives

#### Current: PostgreSQL + Drizzle ORM
**Possible Replacements:**
1. **MySQL + Prisma**
2. **MongoDB + Mongoose**
3. **SQLite + Drizzle**
4. **Supabase** (PostgreSQL with additional features)

**Migration Steps:**
```bash
# For Prisma migration
npm uninstall drizzle-orm drizzle-kit postgres
npm install prisma @prisma/client
npx prisma init
# Update schema.prisma and migrate
```

#### Current: Direct PostgreSQL Connection
**Upgrade to Supabase:**
```bash
npm install @supabase/supabase-js
# Update connection in database-storage.ts
import { createClient } from '@supabase/supabase-js'
```

### Frontend Framework Alternatives

#### Current: React + Wouter
**Possible Replacements:**
1. **React + React Router**
2. **Next.js** (React with SSR)
3. **Vue.js + Vue Router**
4. **Svelte + SvelteKit**

**React Router Migration:**
```bash
npm uninstall wouter
npm install react-router-dom
# Update App.tsx routing logic
```

### State Management Alternatives

#### Current: TanStack Query
**Possible Replacements:**
1. **Apollo Client** (GraphQL)
2. **SWR** (data fetching)
3. **Zustand** (client state)
4. **Redux Toolkit** (complex state)

**SWR Migration:**
```bash
npm uninstall @tanstack/react-query
npm install swr
# Update query hooks
```

### Styling Alternatives

#### Current: Tailwind CSS + Radix UI
**Possible Replacements:**
1. **Material-UI (MUI)**
2. **Chakra UI**
3. **Ant Design**
4. **Styled Components**

**Material-UI Migration:**
```bash
npm uninstall tailwindcss @radix-ui/react-*
npm install @mui/material @emotion/react @emotion/styled
# Update component imports and styling
```

### Authentication Alternatives

#### Current: JWT + Express Session
**Possible Replacements:**
1. **NextAuth.js**
2. **Auth0**
3. **Firebase Auth**
4. **Supabase Auth**

**Supabase Auth Migration:**
```bash
npm install @supabase/auth-helpers-react
# Update auth context and hooks
```

### Backend Alternatives

#### Current: Express.js
**Possible Replacements:**
1. **Next.js API Routes**
2. **Fastify**
3. **NestJS**
4. **tRPC** (type-safe APIs)

**Next.js Migration:**
```bash
npx create-next-app@latest
# Move API routes to pages/api/
# Update client to use Next.js structure
```

## 🐛 Common Issues & Solutions

### Port Issues in Development
```bash
# In Replit, restart the server using the Run button
# Or set custom port via environment variable
PORT=3001 npm run dev
```

### Database Connection Issues
```bash
# Check PostgreSQL is running
pg_ctl status
# Verify connection string
psql $DATABASE_URL
```

### Migration Failures
```bash
# Force push schema changes
npm run db:push -- --force
# Or reset database
dropdb your_database && createdb your_database
npm run db:push
```

## 📚 API Documentation

**Note**: API endpoints are read-only in current implementation. Full CRUD operations are planned for future releases.

### Authentication Endpoints
- `POST /api/auth/login` - User login (implemented)
- `GET /api/auth/me` - Get current user (implemented)

### Core Resource Endpoints
- `GET /api/products` - List products with optional filtering
- `GET /api/customers` - List customers with optional filtering  
- `GET /api/orders` - List orders with optional filtering
- `GET /api/inventory` - List inventory items
- `GET /api/warranties` - List warranties with optional filtering
- `GET /api/vendors` - List vendors

### Dashboard Endpoints
- `GET /api/dashboard/metrics` - Get business metrics and KPIs

**Request/Response Types**: All types are defined in `shared/schema.ts` using Zod validation.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary software for Tools & Power Technologies internal use.

## 🆘 Support

For technical issues or feature requests, contact the development team or create an issue in the repository.

---

**Built with ❤️ for Tools & Power Technologies**