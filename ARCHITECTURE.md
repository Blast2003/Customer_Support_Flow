# ARCHITECTURE.md

## System Architecture

Use a monorepo with two main apps:

```bash
customer-support-flow/
├── frontend/
└── backend/
```

This structure allows both frontend and backend to evolve together while remaining independent.

---

# FRONTEND ARCHITECTURE

Use a **feature-based React architecture**.

```bash
frontend/
├── public/
├── src/
│   ├── api/
│   ├── assets/
│   ├── components/
│   │   ├── common/
│   │   ├── tickets/
│   │   ├── kanban/
│   │   └── dashboard/
│   ├── features/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── customers/
│   │   ├── tickets/
│   │   ├── complaints/
│   │   └── reports/
│   ├── hooks/
│   ├── layouts/
│   ├── routes/
│   ├── socket/
│   ├── store/
│   ├── utils/
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .env
├── package.json
└── vite.config.js
```

---

## Frontend Rules

- `features/` → contains **page-level logic and UI**
- `components/` → reusable UI components (buttons, cards, modals)
- `api/` → Axios configuration + API calls
- `store/` → Zustand global state (auth, tickets, UI, notifications)
- `socket/ContextSocket.js` → manages Socket.IO connection globally
- `routes/` → route definitions + protection logic
- `hooks/` → reusable business logic hooks

### Important Frontend Principles

- No `pages/` folder → everything goes into `features/`
- Keep UI **modular and reusable**
- Avoid deeply nested components
- Always handle:
  - loading state
  - error state
  - empty state

---

# BACKEND ARCHITECTURE

Use **MVC + Service Layer + Script Layer**

```bash
backend/
└── src/
    ├── config/
    │   ├── db.js
    │   ├── cloudinary.js
    │   ├── google.js
    │   └── socket.js
    │
    ├── controllers/
    │   ├── auth.controller.js
    │   ├── ticket.controller.js
    │   ├── complaint.controller.js
    │   ├── sla.controller.js
    │   └── dashboard.controller.js
    │   └── customer.controller.js
    │
    ├── models/
    │   ├── User.js
    │   ├── Ticket.js
    │   ├── TicketMessage.js
    │   ├── Complaint.js
    │   ├── SLARecord.js
    │   ├── Notification.js
    │   └── index.js
    │
    ├── routes/
    │   ├── auth.routes.js
    │   ├── ticket.routes.js
    │   ├── complaint.routes.js
    │   ├── sla.routes.js
    │   ├── dashboard.routes.js
    │   ├── customer.routes.js
    │   └── index.js
    │
    ├── services/
    │   ├── auth.service.js
    │   ├── ticket.service.js
    │   ├── complaint.service.js
    │   ├── sla.service.js
    │   └── notification.service.js
    │
    ├── middlewares/
    │   ├── auth.middleware.js
    │   ├── role.middleware.js
    │   ├── error.middleware.js
    │   └── upload.middleware.js
    │
    ├── sockets/
    │   ├── socket.js
    │   └── ticket.socket.js
    │
    ├── validations/
    │   ├── auth.validation.js
    │   └── ticket.validation.js
    │
    ├── utils/
    │   ├── jwt.js
    │   ├── responseFormatter.js
    │   └── generateTicketNumber.js
    │
    ├── scripts/
    │   ├── sync-db.js
    │   └── seed.js
    │
    ├── app.js
    └── server.js
```

---

## Backend Rules

- Controllers:
  - handle `req`, `res`
  - call services
  - no business logic

- Services:
  - contain ALL logic
  - handle database operations
  - handle validation (if not middleware)

- Models:
  - define schema
  - define relationships

- Middlewares:
  - auth (JWT verify)
  - role-based access
  - error handling
  - file upload

- Config:
  - database
  - cloudinary
  - google oauth
  - socket setup

- Scripts:
  - `sync-db.js` → create/update tables
  - `seed.js` → insert test data

---

# DATABASE DESIGN (IMPORTANT UPDATE)

## Single User Model

There is **NO separate Customer table anymore**

```text
User (ADMIN, AGENT, CUSTOMER)
```

### Relationships

```text
User (customer) → Ticket.customerId
User (agent) → Ticket.agentId
User → TicketMessage.senderId
User → Notification.userId
```

---

# MAIN FLOW

```text
React UI
→ API Layer (Axios)
→ Express Controller
→ Service Layer
→ Sequelize Model
→ MySQL / TiDB
```

---

# REALTIME FLOW (Socket.IO)

```text
Client connects with userId
→ Server maps userId → socketId
→ Events:
   - new message
   - ticket update
   - online users
→ Broadcast or emit to specific user
```

---

# FILE UPLOAD FLOW (Cloudinary)

```text
Frontend → send base64/file
→ Backend upload via Cloudinary
→ Receive secure_url
→ Store URL in DB
→ Return to frontend
```

---

# AUTHENTICATION FLOW

## Google Login

```text
Frontend (@react-oauth/google)
→ send credential
→ Backend verify with Google
→ find or create user
→ generate JWT
→ return token + user
```

## Password Login

```text
Frontend form
→ Backend find user
→ bcrypt compare
→ generate JWT
→ return token
```

---

# RECOMMENDED BACKEND MODULES

- auth
- users
- tickets
- complaints
- sla
- dashboard
- notifications

---

# RECOMMENDED FRONTEND MODULES

- auth
- dashboard
- tickets
- complaints
- reports
- shared components
- socket context
- Zustand stores

---

# IMPORTANT DESIGN DECISIONS

- Use **single User model** (no Customer table)
- Support BOTH:
  - Google login
  - Email/password login
- Keep controllers thin
- Keep business logic in services
- Use feature-based frontend structure
- Keep socket logic isolated
- Keep cloud upload separate
- Use scripts for DB setup (not inside app runtime)

---

# SCALABILITY PRINCIPLES

- Modular features (frontend + backend)
- Clear separation of concerns
- Reusable UI components
- Independent services
- Clean API structure
- Avoid tight coupling

---

# FINAL RULE

This architecture must be treated as the **source of truth**.

Any new feature must:

1. Follow this structure
2. Respect the single User model
3. Keep logic inside correct layers
4. Be testable using TEST_PLAN.md
