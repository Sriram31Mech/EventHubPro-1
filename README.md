# EventHubPro-1
Event Management Platform – Technical Documentation
This is a full-stack web application built using:

Frontend: TypeScript (TSX) with React

Styling: Tailwind CSS

Backend: Node.js + Express (TypeScript)

Database: MongoDB (local)

AI Integration: Gemini AI for event description generation

The platform supports two roles:

Admin: Register, log in, create/edit events

User: Sign up, log in, and browse/filter events

🧰 Tech Stack & Justification
React + TypeScript: Ensures modularity and type safety on the frontend

Tailwind CSS: Enables rapid and responsive UI development

Node.js + Express + TypeScript: Provides scalable, typed API structure

MongoDB (Local): Offers a flexible schema for storing events and users

JWT: Handles secure token-based authentication

Gemini AI: Used to generate meaningful event descriptions

📁 Project Structure
pgsql
Copy
Edit
/frontend       → React app (TSX) for Admin & User flows  
/backend        → Express server (API routes: auth, events, filter)  
/uploads        → Local image storage (JPG/PNG, max 5MB)  
.env / .env.local → Environment configuration  
/docs           → Architecture diagram & reference files 


🚀 Core Features
Admin:

Secure login

Event creation with AI-generated descriptions

Event editing and management

User:

Sign up & login

Real-time event filtering (by date, type, location)

