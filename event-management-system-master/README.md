# Gather — Event Management System

A full-stack MERN application (MongoDB, Express, React, Node.js) covering both the user-facing
booking experience and the admin management console.

## Features

**User side**
- Registration & login (JWT auth)
- View upcoming events
- Search & filter events (by keyword, category, date, location)
- Event details page
- Book / register for an event (with seat availability checks)
- View my bookings
- Cancel booking
- Profile management (update name, phone, password)

**Admin side**
- Admin login (same login form, routed by role)
- Add / edit / delete events
- Manage event categories
- View all bookings
- Approve / reject registrations (optional workflow, toggle in `backend/routes/bookings.js`)
- Manage users (block/unblock, delete)
- Dashboard (total events, users, bookings, recent activity)

## Tech stack

- **Frontend:** React 18 (Vite), React Router, Axios, plain CSS (no framework)
- **Backend:** Node.js, Express
- **Database:** SQLite (via Sequelize ORM) — a single local file, zero install, zero signup
- **Auth:** JWT + bcrypt password hashing

## Project structure

```
event-management-system/
├── backend/
│   ├── config/       # DB connection + seed script
│   ├── middleware/   # JWT auth + admin guard
│   ├── models/       # User, Event, Category, Booking
│   ├── routes/       # auth, events, categories, bookings, admin
│   └── server.js
└── frontend/
    └── src/
        ├── api/         # Axios instance
        ├── context/     # Auth context
        ├── components/  # Navbar, route guards
        ├── pages/       # Login, Register
        ├── pages/user/  # Events, EventDetails, MyBookings, Profile
        ├── pages/admin/ # Dashboard, ManageEvents, ManageCategories, AllBookings, ManageUsers
        └── styles/      # global.css
```

## Getting started

### Prerequisites
- Node.js 18+
- That's it — no database server to install. SQLite runs as a local file, created automatically the first time you start the backend.

### 1. Backend

```bash
cd backend
cp .env.example .env    # edit JWT_SECRET if you like; DB_STORAGE controls where the .sqlite file lives
npm install
npm run seed             # creates data/event_management.sqlite + a default admin + starter categories
npm run dev               # starts the API on http://localhost:5000
```

Default admin login created by the seed script:
- **Email:** admin@events.com
- **Password:** Admin@123

Change this password after first login, or edit `backend/config/seed.js` before seeding.

### 2. Frontend

```bash
cd frontend
cp .env.example .env    # points to the backend API URL
npm install
npm run dev              # starts the app on http://localhost:5173
```

Visit `http://localhost:5173` for the user site, and `http://localhost:5173/admin/login`
for the admin console.

## Notes

- Your data lives in a single file: `backend/data/event_management.sqlite`. Delete it (with the
  server stopped) and re-run `npm run seed` to start completely fresh.
- Approval workflow for bookings is off by default (bookings are auto-approved on creation).
  Flip `REQUIRE_APPROVAL` to `true` in `backend/routes/bookings.js` to require admin approval
  before a booking is confirmed, and admins can then approve/reject from **Admin → Bookings**.
- Seat availability is enforced server-side when booking (based on event capacity vs. active bookings).
- All admin routes are protected both in the API (`protect` + `adminOnly` middleware) and in the
  frontend (`AdminRoute` guard).
