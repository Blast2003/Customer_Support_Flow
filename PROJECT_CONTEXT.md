# PROJECT_CONTEXT.md

## Project Name
Customer Support Flow

## Project Summary
Customer Support Flow is a full-stack customer support and after-sales service platform. It helps users log in, create support tickets, track issue progress, upload images, chat in realtime, and receive updates. It also gives agents and admins tools to manage tickets, complaints, SLA deadlines, notifications, dashboard analytics, and reports.

## Main Goals
- Google login for customers
- Email/password login for local testing and internal accounts
- JWT-based authentication
- Role-based access control
- Ticket creation and tracking
- Agent/admin workflow
- Realtime updates using Socket.IO
- Cloudinary image upload
- Complaint management
- SLA monitoring and escalation
- Dashboard and reports
- Modern responsive UI with hover, motion, and clean visual depth

## User Roles
### Customer
- Log in with Google or password, depending on account type
- Create tickets
- Upload screenshots or files
- View ticket status
- Chat in ticket conversation
- Submit complaints

### Agent
- View assigned tickets
- Reply to customers
- Update ticket status
- Manage live support conversations
- Handle escalations

### Admin
- View all users, tickets, and complaints
- Assign tickets to agents
- Review SLA warnings
- Monitor performance
- View reports and analytics

## Core Technology Stack
### Frontend
- React
- Vite
- Tailwind CSS
- Zustand
- Axios
- React Router DOM
- `@react-oauth/google`
- `socket.io-client`
- `react-hook-form`
- `zod`
- `@hookform/resolvers`
- `@dnd-kit/core`
- `recharts`
- `lucide-react`
- `react-hot-toast`

### Backend
- Node.js
- Express
- Sequelize
- MySQL / TiDB
- Socket.IO
- Cloudinary
- Multer
- bcrypt
- jsonwebtoken
- google-auth-library
- zod
- helmet
- express-rate-limit
- cookie-parser
- nodemon

## Environment Rules
### Backend `.env`
- PORT=5100
- DATABASE_URL=mysql://...
- CLOUDINARY_CLOUD_NAME=...
- CLOUDINARY_API_KEY=...
- CLOUDINARY_API_SECRET=...
- GOOGLE_CLIENT_ID=...
- GOOGLE_CLIENT_SECRET=...
- CLIENT_URL=http://localhost:5173
- JWT_SECRET=...

### Frontend `.env`
- VITE_GOOGLE_CLIENT_ID=...
- VITE_SOCKET_URL=http://localhost:5100

## Security Rules
- Keep `GOOGLE_CLIENT_SECRET` only in the backend.
- Never store secrets in frontend code.
- Keep controllers thin.
- Put business logic in services.
- Validate all incoming data before database writes.
- Keep socket logic isolated.
- Keep UI state in Zustand, not in random local components when global state is needed.

## Development Order
1. Authentication
2. User role handling
3. Tickets
4. Socket realtime
5. Cloudinary upload
6. Complaints
7. SLA tracking
8. Dashboard and reports
9. UI polish
10. Final testing and bug fixing

## Current Design Decision
The project now uses a **single `User` model** for all login identities.

That means:
- no separate `Customer` model
- `User.role` handles `ADMIN`, `AGENT`, and `CUSTOMER`
- `Ticket.customerId` references `User.id`
- `Ticket.agentId` references `User.id`
- `TicketMessage.senderId` references `User.id`
- `Complaint.customerId` references `User.id`

This makes the design cleaner and easier to maintain.

## Working Rule for Claude Code
Always read this file first, inspect the repository, continue from the current state, fix bugs when found, and retest until the feature works smoothly.