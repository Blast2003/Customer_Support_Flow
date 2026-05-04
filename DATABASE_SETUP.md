# DATABASE_SETUP.md

## Database Summary
The project uses one main user table for all roles.

### Final Design
- `users`
- `tickets`
- `ticket_messages`
- `complaints`
- `sla_records`
- `notifications`

There is no separate `customers` table in the final design.

## Why One User Table
Using one `User` model keeps the system cleaner because:
- Google login and password login can both use the same identity table
- tickets can reference one consistent user structure
- message sender references are simple
- role-based access is easier to maintain

## Model Relationships
- `User.hasMany(Ticket, { foreignKey: "customerId" })`
- `User.hasMany(Ticket, { foreignKey: "agentId" })`
- `User.hasMany(TicketMessage, { foreignKey: "senderId" })`
- `User.hasMany(Notification, { foreignKey: "userId" })`
- `Ticket.belongsTo(User, { foreignKey: "customerId" })`
- `Ticket.belongsTo(User, { foreignKey: "agentId" })`
- `Ticket.hasMany(TicketMessage, { foreignKey: "ticketId" })`
- `Ticket.hasOne(SLARecord, { foreignKey: "ticketId" })`
- `Ticket.hasMany(Complaint, { foreignKey: "ticketId" })`

## Important Sequelize Rule for TiDB / MySQL
Some TiDB environments do not like adding a column and a unique constraint in the same alter step.

If `sequelize.sync({ alter: true })` fails on a unique nullable field like `googleId`, do this:
1. remove `unique: true` from the column definition
2. sync again
3. add the unique index manually if needed

## Sync Script
Use the sync script to create tables from models.

### Command
```bash
npm run db:sync
```

### Behavior
- connects to the database
- loads models and relationships
- creates or alters tables
- writes schema into the configured `DATABASE_URL`

## Seed Script
Use the seed script to create test data for development.

### Command
```bash
npm run db:seed
```

### Expected Seed Data
- 1 admin
- 1 agent
- 2 customers
- 2 tickets
- ticket messages
- SLA records
- 1 complaint
- notifications

## Seed Login Credentials
Recommended development credentials:

### Local Password User
- email: `customer1@gmail.test`
- password: `Customer@12345`

### Admin
- email: `admin@crm.test`
- password: `Admin@12345`

### Agent
- email: `agent@crm.test`
- password: `Agent@12345`

## Database Safety Rule
If the database is not empty and you only want to add tables, prefer `alter: true`.
If you want a fresh test database, use `force: true` only in seed scripts or during local development.
