# Tools & Power Technologies E-Commerce Management Dashboard

## Project Context
This is a comprehensive, internal-facing e-commerce management dashboard built from scratch using Next.js full-stack development. The application serves as a centralized platform for managing all aspects of a tools and power technologies e-commerce operation, addressing the unique challenges of complex product catalogs, technical specifications, warranty management, and specialized customer needs in the industrial and professional tools market.

## Target Users & Access Levels

### Primary Users:
- **Super Admin**: Complete system control, user management, system configuration, vendor relationships
- **Operations Manager**: Inventory management, order processing, supplier coordination, logistics oversight
- **Product Manager**: Catalog management, technical specifications, compatibility matrices, new product launches
- **Customer Service**: Technical support, warranty claims, professional customer assistance, installation guidance
- **Sales Representative**: Customer relationship management, quotes, bulk orders, professional accounts
- **Warehouse Manager**: Stock management, receiving, quality control, equipment maintenance
- **Technical Support**: Product troubleshooting, repair coordination, technical documentation management

**Access Model**: Role-based access control (RBAC) with hierarchical permissions and specialized access for technical data, warranty information, and professional customer accounts.

## Industry-Specific Core Modules

### 1. Enhanced Dashboard Overview
- **Equipment Performance Metrics**: Tool failure rates, warranty claim trends, return reasons
- **Seasonal Sales Patterns**: Weather-dependent tool sales, construction season analytics
- **Professional vs. Consumer Sales**: B2B/B2C performance tracking
- **Inventory Turnover by Category**: Power tools, hand tools, accessories, replacement parts
- **Safety Compliance Alerts**: Recall notifications, certification updates
- **Quick Actions**: Warranty claim processing, bulk quote generation, stock level alerts

### 2. Specialized Product Catalog Management
- **Technical Specifications Engine**: Voltage, amperage, torque ratings, compatibility matrices
- **Product Categorization**: 
  - Power Tools (cordless, corded, pneumatic, hydraulic)
  - Hand Tools (precision, heavy-duty, specialty)
  - Safety Equipment and PPE
  - Accessories and Consumables
  - Replacement Parts and Repairs
- **Compatibility Matrix**: Tool-to-accessory relationships, battery compatibility, part numbers
- **Safety Certifications**: UL, OSHA, CE marking tracking and compliance
- **Product Media Management**: Technical drawings, installation guides, safety videos
- **Seasonal Product Flagging**: Weather-dependent tools, construction season items

### 3. Advanced Inventory Management
- **Multi-Location Stock Management**: Warehouses, retail locations, service centers
- **Seasonal Inventory Planning**: Weather-based demand forecasting
- **Tool Lifecycle Management**: New releases, discontinued models, replacement parts
- **Battery and Consumables Tracking**: Battery health, expiration dates, usage cycles
- **Damaged Goods Processing**: Returns, refurbishments, warranty replacements
- **Supplier Integration**: Direct manufacturer relationships, authorized dealer networks
- **Critical Stock Alerts**: Professional customer priority items, high-demand seasonal tools

### 4. Professional Customer Management
- **Account Types**: 
  - Individual consumers
  - Professional contractors
  - Industrial accounts
  - Government/municipal contracts
  - Educational institutions
- **Customer Profiles**: Trade specializations, preferred brands, purchase history patterns
- **Professional Verification**: Contractor licenses, business certifications, tax-exempt status
- **Credit Terms Management**: Net payment terms, credit limits, payment history
- **Bulk Order Processing**: Quote generation, project-based ordering, delivery scheduling
- **Customer Equipment History**: Purchased tools, warranty status, service records

### 5. Order Management for Tools Industry
- **Order Types**: 
  - Standard retail orders
  - Professional bulk orders
  - Emergency/rush orders for contractors
  - Scheduled/recurring orders (consumables)
  - Warranty replacement orders
- **Delivery Options**: Standard shipping, contractor jobsite delivery, will-call pickup
- **Order Splitting**: Immediate availability vs. backordered items
- **Project-Based Orders**: Multi-phase deliveries, progress billing, completion tracking
- **Professional Pricing**: Contractor discounts, volume pricing, loyalty programs

### 6. Warranty & Service Management
- **Warranty Registration**: Product registration tracking, warranty period monitoring
- **Claims Processing**: Defect reporting, replacement authorization, repair coordination
- **Service Center Integration**: Authorized repair locations, service scheduling, parts ordering
- **Warranty Analytics**: Failure patterns, manufacturer quality metrics, cost analysis
- **Extended Warranty Programs**: Sales tracking, claim processing, profitability analysis
- **Recall Management**: Product recall notifications, customer communication, replacement tracking

### 7. Technical Support & Documentation
- **Product Knowledge Base**: Installation guides, troubleshooting, safety information
- **Video Library**: Product demonstrations, safety training, maintenance procedures
- **Technical Specifications Database**: Searchable specifications, compatibility charts
- **Customer Support Ticketing**: Technical issues, warranty claims, usage questions
- **Professional Training Resources**: Certification programs, safety training materials
- **Maintenance Schedules**: Preventive maintenance alerts, service reminders

### 8. Vendor & Supplier Management
- **Manufacturer Relationships**: Direct partnerships with tool manufacturers
- **Authorized Dealer Programs**: Territory management, pricing compliance
- **Drop-Ship Coordination**: Direct manufacturer shipping, inventory integration
- **Product Launch Management**: New product introductions, training materials
- **Warranty Coordination**: Manufacturer warranty processing, reimbursement tracking
- **Quality Control**: Defect reporting, product recalls, manufacturer communication

### 9. Analytics & Business Intelligence
- **Sales Performance**: 
  - Professional vs. consumer sales trends
  - Seasonal analysis (construction/outdoor seasons)
  - Brand performance and market share
  - Geographic sales patterns
- **Inventory Analytics**:
  - Turnover rates by tool category
  - Seasonal demand forecasting
  - Obsolescence management
  - Parts availability analysis
- **Customer Analytics**:
  - Professional customer lifetime value
  - Purchase pattern analysis
  - Brand loyalty tracking
  - Customer acquisition costs
- **Warranty Analytics**:
  - Failure rate analysis by brand/model
  - Warranty cost impact on profitability
  - Quality improvement recommendations

### 10. Compliance & Safety Management
- **Safety Compliance Tracking**: OSHA requirements, industry standards
- **Product Certifications**: UL listings, CE marking, industry approvals
- **Recall Management**: Product recall tracking, customer notifications
- **Documentation Management**: Safety data sheets, compliance certificates
- **Audit Trail**: Regulatory compliance reporting, safety incident tracking

## Industry-Specific Features

### Professional Customer Portal
- **Account Management**: Credit applications, payment terms, order history
- **Quote System**: Instant quotes, saved quotes, project-based pricing
- **Bulk Ordering**: CSV upload, recurring orders, scheduled deliveries
- **Jobsite Delivery**: GPS coordinates, delivery instructions, special requirements
- **Invoice Management**: Detailed invoicing, progress billing, payment tracking

### Seasonal Business Management
- **Weather-Based Forecasting**: Regional weather impact on tool demand
- **Seasonal Inventory Planning**: Pre-season stocking, end-of-season clearance
- **Marketing Calendar**: Seasonal promotions, trade show schedules, contractor events
- **Storage Management**: Seasonal storage costs, space optimization

### Quality Control & Testing
- **Incoming Inspection**: Quality checks on received inventory
- **Return Processing**: Defect analysis, refurbishment decisions, warranty claims
- **Testing Equipment Integration**: Automated testing results, quality metrics
- **Supplier Quality Metrics**: Defect rates, delivery performance, compliance scores

### Mobile & Field Integration
- **Mobile Inventory Access**: Real-time stock checks for sales reps
- **Field Service Tools**: Technician access to parts, service history, warranties
- **Delivery Tracking**: Real-time delivery updates, proof of delivery, customer notifications
- **Emergency Order Processing**: Rush orders for critical contractor needs

## Technical Architecture Considerations

### Performance Requirements
- **High-Volume Catalog**: Optimized for 10,000+ SKUs with complex specifications
- **Image Management**: High-resolution product images, technical drawings, videos
- **Real-Time Inventory**: Live stock updates across multiple locations
- **Bulk Operations**: Efficient processing of large orders and catalog updates
- **Mobile Optimization**: Field access for sales reps and delivery teams

### Integration Capabilities
- **ERP Systems**: Integration with existing business systems
- **Manufacturer APIs**: Direct inventory and pricing feeds
- **Shipping Carriers**: UPS, FedEx, freight carriers for heavy equipment
- **Payment Processing**: B2B payment terms, credit processing, financing options
- **Accounting Systems**: QuickBooks, SAP, automated financial reporting

### Security & Compliance
- **Customer Data Protection**: Professional customer information security
- **Pricing Protection**: Confidential contractor pricing, MAP compliance
- **Inventory Security**: High-value tool inventory tracking and protection
- **Warranty Data**: Secure warranty registration and claim processing

## Implementation Roadmap

### Phase 1: Foundation (Weeks 1-4)
- User authentication and role management
- Basic product catalog with technical specifications
- Core inventory management
- Customer account setup

### Phase 2: Operations (Weeks 5-8)
- Order management system
- Warranty processing
- Basic reporting and analytics
- Vendor management

### Phase 3: Advanced Features (Weeks 9-12)
- Professional customer portal
- Advanced analytics and forecasting
- Mobile optimization
- Integration framework

### Phase 4: Optimization (Weeks 13-16)
- Performance optimization
- Advanced automation
- Comprehensive reporting
- Training and documentation

This tools and power technologies e-commerce dashboard provides a comprehensive solution tailored to the unique needs of the professional and industrial tools market, supporting both B2B and B2C operations while maintaining the specialized features required for this technical industry.

## Development Instructions & Platform Portability Requirements

### CRITICAL DEVELOPMENT CONSTRAINTS - PLATFORM INDEPENDENCE

**IMPORTANT**: This application must be built as a standard, portable web application that can run anywhere without dependencies on Replit-specific technologies.

### Technology Stack Requirements
- **Frontend**: React with Tailwind CSS and shadcn/ui components
- **Backend**: Node.js with Express framework
- **Database & Auth**: Supabase for both database and authentication
- **Package Management**: Standard npm packages only
- **Deployment**: Must be deployable to any cloud platform

### Mandatory Platform-Agnostic Guidelines

#### 1. **Forbidden Replit Dependencies**
**DO NOT USE:**
- Replit Database (use Supabase instead)
- Replit Auth (use Supabase Auth instead)
- Replit-specific deployment configurations
- Replit secrets system (use .env files)
- Any @replit/* npm packages
- Hardcoded Replit URLs or paths
- Replit-specific file system APIs

#### 2. **Required Project Structure**
```
tools-ecommerce-dashboard/
├── frontend/              # React application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── utils/         # Utility functions
│   │   └── styles/        # Tailwind CSS files
│   ├── public/            # Static assets
│   ├── package.json       # Frontend dependencies
│   └── tailwind.config.js # Tailwind configuration
├── backend/               # Express API server
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Express middleware
│   │   ├── controllers/   # Route controllers
│   │   ├── models/        # Data models
│   │   └── utils/         # Server utilities
│   ├── package.json       # Backend dependencies
│   └── server.js          # Main server file
├── shared/                # Shared utilities and types
├── docs/                  # Project documentation
├── .env.example           # Environment variables template
├── .gitignore             # Git ignore file
├── docker-compose.yml     # Container orchestration
├── Dockerfile             # Container configuration
├── package.json           # Root package.json for scripts
└── README.md              # Comprehensive setup guide
```

#### 3. **Environment Configuration Requirements**
Create robust environment management:

```bash
# .env.example (must be included in repository)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key
DATABASE_URL=postgresql://user:password@host:port/database
NODE_ENV=development
PORT=3000
FRONTEND_PORT=3001
JWT_SECRET=your_jwt_secret_key
CORS_ORIGIN=http://localhost:3001
```

#### 4. **Database Abstraction Layer**
Create a database abstraction to ensure portability:

```javascript
// backend/src/utils/database.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Wrap all database operations in abstraction layer
export const dbClient = {
  // This pattern allows easy database switching later
  users: {
    getAll: () => supabase.from('users').select('*'),
    getById: (id) => supabase.from('users').select('*').eq('id', id),
    create: (data) => supabase.from('users').insert(data),
    // ... other operations
  }
};
```

#### 5. **Required Package.json Scripts**
Include standard scripts that work on any platform:

```json
{
  "name": "tools-ecommerce-dashboard",
  "scripts": {
    "dev": "concurrently \"npm run dev:frontend\" \"npm run dev:backend\"",
    "dev:frontend": "cd frontend && npm run dev",
    "dev:backend": "cd backend && npm run dev",
    "build": "cd frontend && npm run build",
    "build:backend": "cd backend && npm run build",
    "start": "cd backend && npm start",
    "install:all": "npm install && cd frontend && npm install && cd backend && npm install",
    "clean": "rm -rf frontend/node_modules backend/node_modules node_modules",
    "lint": "cd frontend && npm run lint && cd ../backend && npm run lint"
  }
}
```

#### 6. **Containerization Requirements**
Include Docker configuration for deployment flexibility:

```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app

# Install dependencies
COPY package*.json ./
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/
RUN npm run install:all

# Copy source code
COPY . .

# Build frontend
RUN cd frontend && npm run build

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "start"]
```

#### 7. **Authentication Implementation**
Use Supabase Auth with proper abstraction:

```javascript
// frontend/src/hooks/useAuth.js
import { supabase } from '../utils/supabaseClient';

export const useAuth = () => {
  // Implement authentication logic using Supabase Auth
  // This should be portable and not tied to any platform
};
```

#### 8. **Required Documentation**
The application must include comprehensive documentation:

**README.md Requirements:**
- Prerequisites (Node.js 18+, npm, etc.)
- Local development setup instructions
- Environment variables configuration guide
- Supabase setup and configuration
- Database schema and migrations
- API documentation with endpoints
- Deployment instructions for multiple platforms:
  - Vercel
  - Netlify
  - Railway
  - DigitalOcean
  - AWS
  - Local development
- Project structure explanation
- Troubleshooting guide

#### 9. **Development Best Practices**
- **File Paths**: Use relative paths only, no absolute paths
- **Configuration**: Everything must be configurable via environment variables
- **Error Handling**: Comprehensive error handling and logging
- **Security**: Proper input validation, rate limiting, and security headers
- **Performance**: Code splitting, lazy loading, and optimization
- **Testing**: Include test structure and examples
- **Code Quality**: Consistent formatting, linting, and TypeScript support

#### 10. **Deployment Portability Checklist**
The final application must:
- ✅ Run locally with `npm run dev`
- ✅ Build successfully with `npm run build`
- ✅ Work with Docker containers
- ✅ Deploy to Vercel without modifications
- ✅ Deploy to Railway without modifications
- ✅ Deploy to any VPS with Node.js support
- ✅ Include all necessary environment variable documentation
- ✅ Have proper database migration scripts
- ✅ Include comprehensive setup documentation

### Final Instruction Summary
Build this as a **production-ready, enterprise-grade application** using industry best practices. The codebase must be clean, well-documented, and completely portable across all major deployment platforms. Every component should follow React best practices, every API endpoint should be properly documented, and the entire application should be deployment-ready with comprehensive documentation for multiple hosting environments.



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