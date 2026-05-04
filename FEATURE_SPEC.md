# FEATURE_SPEC.md

## Authentication
### Features
- Google login for customers
- Local email/password login for testing and non-Google accounts
- Backend token verification for Google sign-in
- App JWT issuance
- Protected routes
- Logout

### Expected Behavior
- A customer can sign in using Google or password, depending on the account.
- The backend verifies the Google credential.
- The system creates a user record if needed.
- The frontend stores the app token and user data.

## User and Role Management
### Features
- Single `User` model
- Customer, agent, and admin roles
- Role-based access control
- User profile data

### Expected Behavior
- Admin can access all management pages.
- Agent can access assigned workflows.
- Customer can access only customer-facing pages.

## Tickets
### Features
- Create ticket
- View ticket detail
- Ticket list and filtering
- Ticket assignment
- Ticket status workflow
- Ticket conversation thread
- Optional attachment upload

### Ticket Statuses
- OPEN
- IN_PROGRESS
- WAITING
- RESOLVED
- CLOSED

### Priority Levels
- LOW
- MEDIUM
- HIGH
- URGENT

## Realtime Messaging
### Features
- Socket.IO connection
- Online user presence
- Live ticket updates
- Message seen events

### Expected Behavior
- Ticket updates appear without page refresh.
- Online presence updates in realtime.

## Cloudinary Upload
### Features
- Upload ticket attachments
- Upload profile images if needed
- Store secure image URL only

### Expected Behavior
- File goes to Cloudinary.
- Returned URL is stored in the database.
- UI shows preview or attachment link.

## Complaints
### Features
- Create complaint
- Link complaint to ticket
- Complaint status tracking
- Severity tracking
- Resolution notes

### Severity Levels
- LOW
- MEDIUM
- HIGH
- CRITICAL

## SLA
### Features
- SLA record creation
- Response deadline
- Resolution deadline
- Breach detection
- SLA status labels

### SLA Status Values
- ON_TRACK
- AT_RISK
- BREACHED
- RESOLVED

## Dashboard
### Features
- Ticket totals
- Complaint totals
- SLA status overview
- Agent performance
- Reports and charts

## Reports
### Features
- Analytics charts
- Workflow summaries
- Export-ready report data if added later

## Notifications
### Features
- Ticket activity notifications
- Complaint updates
- SLA alerts
- Read/unread tracking

## Required API Groups
- `/api/auth`
- `/api/users`
- `/api/tickets`
- `/api/complaints`
- `/api/sla`
- `/api/dashboard`
- `/api/notifications`

## Required Frontend Areas
- auth
- dashboard
- customers
- tickets
- complaints
- reports
- shared components
- route protection
- socket context
- Zustand stores

## Database Model Summary
### User
Single model for all users, including customers, agents, and admins.

### Ticket
References:
- `customerId -> User.id`
- `agentId -> User.id`

### TicketMessage
References:
- `ticketId -> Ticket.id`
- `senderId -> User.id`

### Complaint
References:
- `ticketId -> Ticket.id`
- `customerId -> User.id`

### SLARecord
References:
- `ticketId -> Ticket.id`

### Notification
References:
- `userId -> User.id`