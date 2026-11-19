# Wayfare – Travel Booking System (MERN)

Full Stack Lab project. **React** (Vite) + **Node/Express** + **MongoDB** (Mongoose), JWT authentication.

## Features
- Register / login (JWT, bcrypt-hashed passwords, user and admin roles)
- Browse, search, filter (category, budget) and sort travel packages
- Package details with departure dates, seat availability and live total price
- Booking with simulated payment (card / UPI / net banking) and a booking reference
- Seats are reserved atomically in MongoDB, so the last seat can't be double-booked
- My bookings page with cancellation (seats are released, payment marked refunded)
- Admin dashboard: stats, add / edit / delete packages, view and cancel all bookings

## Folder structure
```
travel-booking/
├── server/                 Express API
│   ├── config/db.js        MongoDB connection
│   ├── models/             User, Package, Booking (Mongoose schemas)
│   ├── middleware/auth.js  JWT protect + adminOnly
│   ├── routes/             auth, packages, bookings
│   ├── seed.js             sample data + demo accounts
│   └── server.js
└── client/                 React app (Vite)
    └── src/
        ├── api.js          axios instance + helpers
        ├── context/        AuthContext (login state)
        ├── components/     Navbar, PackageCard, ProtectedRoute
        └── pages/          Home, Packages, PackageDetails, Login, Register, MyBookings, Admin
```

## Run it
Requirements: Node.js 18+, MongoDB running locally (or a MongoDB Atlas URI).

```bash
# 1. Backend
cd server
npm install
# edit .env if your MongoDB URI is different (default: mongodb://127.0.0.1:27017/travel_booking)
npm run seed        # creates sample packages + demo accounts
npm run dev         # API on http://localhost:5000

# 2. Frontend (new terminal)
cd client
npm install
npm run dev         # App on http://localhost:5173
```

Demo logins (created by the seed script):
| Role  | Email             | Password |
|-------|-------------------|----------|
| Admin | admin@travel.com  | admin123 |
| User  | user@travel.com   | user123  |

## REST API
| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | /api/auth/register | public | Create account |
| POST | /api/auth/login | public | Log in, returns JWT |
| GET | /api/auth/me | user | Current user |
| GET | /api/packages | public | List (query: search, category, minPrice, maxPrice, sort, featured) |
| GET | /api/packages/:id | public | Single package |
| POST / PUT / DELETE | /api/packages(/:id) | admin | Manage packages |
| POST | /api/bookings | user | Create booking |
| GET | /api/bookings/mine | user | My bookings |
| PUT | /api/bookings/:id/cancel | owner/admin | Cancel + refund |
| GET | /api/bookings | admin | All bookings |
| GET | /api/bookings/admin/stats | admin | Dashboard numbers |

## Database collections
- **users**: name, email (unique), password (hashed), role
- **packages**: title, destination, country, description, image, price, days, seats, category, highlights[], startDates[], featured, rating
- **bookings**: user → users, package → packages, travelDate, travelers, totalPrice, paymentMethod, paymentStatus, status, reference

## Ideas to extend (for viva / extra marks)
Reviews and ratings, real payment gateway (Razorpay/Stripe test mode), email confirmation (Nodemailer), image upload (Multer/Cloudinary), hotel and flight modules, deployment (Render + Vercel + MongoDB Atlas).
