# Village Governance Platform

A mobile-first civic platform for rural communities to improve transparency, complaint management, and election awareness.

## Tech Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MongoDB + Mongoose
- Auth: Email OTP (dev OTP shown in API response for local testing)
- Email: Nodemailer when configured, otherwise console/dev fallback

## Features Delivered

- Email OTP authentication with role-aware accounts (`user`, `candidate`, `admin`)
- Candidate cards, details, self-registration, and comparison
- Public complaint feed with statuses, upvotes, and public responses
- Complaint escalation flow to verified officers
- Searchable government officers directory
- Dashboard statistics for transparency
- Hindi and English language toggle
- Mobile-first, clean card-based UI

## Project Structure

- `server/` Express API
- `client/` React frontend

## Setup

1. Install dependencies:
   - `npm run install:all`
2. Configure server env:
   - Copy `server/.env.example` to `server/.env`
   - Fill `MONGO_URI` and `JWT_SECRET`
   - For real email OTP, fill `EMAIL_SERVICE`, `EMAIL_USER`, and `EMAIL_PASSWORD` (e.g., Gmail with app password)
3. Configure client env (optional):
   - Copy `client/.env.example` to `client/.env`
4. Seed sample data:
   - `npm run seed`
5. Start both frontend and backend:
   - `npm run dev`

## Default Seed Data

- Admin email: `admin@village.local`
- Officers and sample candidates are auto-seeded.

## Important Production Notes

- Set `NODE_ENV=production` in server environment.
- Set required server variables: `MONGO_URI`, `JWT_SECRET`, `CORS_ORIGIN`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `EMAIL_USER`, `EMAIL_PASSWORD`.
- If deploying behind a reverse proxy (Nginx, Azure, Render, etc.), set `TRUST_PROXY=true`.
- Use `npm run build --prefix client` to produce production frontend assets.
- Run backend with `npm run start --prefix server`.
- Keep HTTPS enabled at your hosting layer and allow only your real frontend domain in `CORS_ORIGIN`.
