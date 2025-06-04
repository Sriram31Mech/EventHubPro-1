# EventHubPro-1
Event Management Platform – Technical Documentation
This is a full-stack web application built using:

Frontend: TypeScript (TSX) with React

Styling: Tailwind CSS with Radix UI components

Backend: Node.js + Express (TypeScript)

Database: MongoDB (local) + PostgreSQL with Drizzle ORM

AI Integration: Gemini AI for event description generation

The platform supports two roles:

Admin: Register, log in, create/edit events

User: Sign up, log in, and browse/filter events

🧰 Tech Stack & Justification
React + TypeScript: Ensures modularity and type safety on the frontend

Tailwind CSS + Radix UI: Provides accessible, customizable components and rapid UI development

Node.js + Express + TypeScript: Provides scalable, typed API structure

MongoDB + PostgreSQL: Hybrid database approach for flexible document storage and relational data

JWT + Express Session: Comprehensive authentication and session management

Gemini AI: Used to generate meaningful event descriptions

📁 Project Structure
```
/client         → React app (TSX) for Admin & User flows
/server         → Express server (API routes: auth, events, filter)
/uploads        → Local image storage (JPG/PNG, max 5MB)
/shared         → Shared types and utilities
/scripts        → Database initialization and utility scripts
```

🚀 Core Features
Admin:
- Secure login with Passport.js integration
- Event creation with AI-generated descriptions
- Event editing and management
- Image upload handling with Multer

User:
- Sign up & login with secure password hashing
- Real-time event filtering (by date, type, location)
- Interactive UI with modern components

🛠️ Development Tools
- Vite for fast development and building
- Drizzle Kit for database schema management
- TypeScript for type safety across the stack
- React Query for efficient data fetching
- Tailwind CSS for styling with custom configuration
- ESLint for code quality

📦 Key Dependencies
- React v18.3
- Express v4.21
- Drizzle ORM for database operations
- Radix UI components for accessible UI
- Zod for runtime type validation
- React Hook Form for form management
- Framer Motion for animations

To get started with development:
```bash
# Install dependencies
npm install

# Initialize database
npm run init-db

# Start development server
npm run dev
```

