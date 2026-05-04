# TEST_PLAN.md

## Testing Philosophy
Test each feature after implementation. Fix bugs immediately. Re-test the affected flow before moving forward.

## General Test Checklist
- App builds successfully
- Environment variables are loaded correctly
- Imports and exports are valid
- API requests return expected JSON
- Protected routes redirect properly
- Socket connection opens and disconnects cleanly
- Google login works end-to-end
- Local password login works for seeded test users
- Uploads work and store secure URLs
- Validation errors appear correctly
- UI remains responsive

## Authentication Tests
### Test: Google Login Success
Steps:
1. Click Google login.
2. Select a valid account.
3. Accept consent.

Expected:
- Google returns credential
- Backend verifies the token
- User is created or found
- App JWT is returned
- User is logged in

### Test: Local Login Success
Steps:
1. Enter email and password for a seeded local user.
2. Submit login form.

Expected:
- Backend verifies password
- App JWT is returned
- User is logged in

### Test: Invalid Google Credential
Steps:
1. Send an invalid credential to backend.

Expected:
- Request is rejected
- Error response is returned
- No user is created

### Test: Protected Route Without Login
Steps:
1. Open dashboard route directly without token.

Expected:
- Redirect to login

## Ticket Tests
### Test: Create Ticket
Steps:
1. Fill ticket form.
2. Submit.

Expected:
- Ticket saves successfully
- Ticket number is generated
- Ticket appears in list

### Test: Ticket With Attachment
Steps:
1. Upload image.
2. Submit ticket.

Expected:
- Image uploads to Cloudinary
- URL is stored in database
- Ticket still saves successfully

### Test: Ticket Validation Error
Steps:
1. Leave required field empty.
2. Submit.

Expected:
- Inline validation error appears
- Request is not sent

## Socket Tests
### Test: User Presence
Steps:
1. Open app in two browser sessions.

Expected:
- Online user list updates correctly

### Test: Realtime Ticket Update
Steps:
1. Change ticket status from agent side.

Expected:
- Customer sees update without refresh

### Test: Disconnect
Steps:
1. Close browser tab.

Expected:
- User is removed from online list

## Complaint Tests
### Test: Create Complaint
Steps:
1. Fill complaint form.
2. Submit.

Expected:
- Complaint is saved
- Complaint appears in list

### Test: Update Complaint Status
Steps:
1. Change complaint status.
2. Save.

Expected:
- Status updates correctly

## SLA Tests
### Test: SLA Record Creation
Steps:
1. Create a ticket with SLA enabled.

Expected:
- SLA record exists
- Due times are saved

### Test: SLA Breach
Steps:
1. Let ticket exceed due time.

Expected:
- SLA becomes breached
- Dashboard shows warning

## Dashboard Tests
### Test: Summary Widgets
Steps:
1. Open dashboard.

Expected:
- Metrics load successfully
- No broken cards or empty states unless expected

### Test: Charts
Steps:
1. Open reports page.

Expected:
- Charts render correctly
- Data matches backend response

## UI Tests
### Test: Hover and Pointer States
Steps:
1. Hover clickable buttons, cards, and rows.

Expected:
- Hover effect is visible
- Cursor changes to pointer

### Test: Responsive Layout
Steps:
1. View app on smaller screen.

Expected:
- Layout stacks cleanly
- Navigation remains usable

## Database Tests
### Test: Sync Tables
Steps:
1. Run database sync script.

Expected:
- Tables are created in the correct database
- No schema mismatch

### Test: Seed Data
Steps:
1. Run seed script.

Expected:
- Seed users, tickets, messages, complaints, SLA records, and notifications are inserted
- Seed login credentials work as expected

## Regression Rule
Whenever a bug is fixed, repeat the exact flow that failed to confirm the fix works.