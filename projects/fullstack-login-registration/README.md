# Full-Stack Login & Registration System

Coursework project demonstrating a complete browser → API → database workflow.

## Stack
- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express
- Database: MySQL
- Password handling: bcryptjs hashing

## Main functions
- User registration
- Client-side and server-side validation
- Duplicate email checking
- Password hashing before database storage
- Login with bcrypt password comparison
- Dashboard redirect and logout workflow
- MySQL user records
- CORS allow-list through environment variables
- Health-check endpoint (`GET /health`)

## Local setup
1. Import `database/SCMS_database.sql` into MySQL.
2. Copy `.env.example` to `.env` and update the local database values.
3. Run `npm install` inside `backend/`.
4. Run `npm start`.
5. Serve the `frontend/` folder through a local web server such as VS Code Live Server.

## Important compatibility note
Older coursework database rows that stored plaintext passwords will not authenticate
against this safer public version. Re-register test users so their passwords are stored
as bcrypt hashes.

## Portfolio note
No real database credentials are included in this public portfolio copy.
This is an educational project, not a production authentication service.
