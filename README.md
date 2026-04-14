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
- Set required server variables: `MONGO_URI`, `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `EMAIL_USER`, `EMAIL_PASSWORD`.
- Make sure `MONGO_URI` points to a hosted MongoDB service such as MongoDB Atlas; `localhost` will not work on Render.
- Set `CORS_ORIGIN` to your frontend origin, or use `FRONTEND_URL` if you prefer a single canonical URL.
- If the frontend is hosted on Vercel, set `VITE_API_URL` in the client environment to your Render backend URL, for example `https://your-backend.onrender.com/api`.
- If deploying behind a reverse proxy (Nginx, Azure, Render, etc.), set `TRUST_PROXY=true`.
- Use `npm run build --prefix client` to produce production frontend assets.
- Run backend with `npm run start --prefix server`.
- Keep HTTPS enabled at your hosting layer and allow only your real frontend domain in `CORS_ORIGIN`.

## Deploying with Render Backend + Vercel Frontend

### Render Backend Setup
Set these environment variables in your Render service settings:

| Variable | Value | Notes |
|----------|-------|-------|
| `NODE_ENV` | `production` | Required for production security checks |
| `MONGO_URI` | `mongodb+srv://user:password@cluster.mongodb.net/dbname` | Use MongoDB Atlas, not localhost |
| `JWT_SECRET` | Random string 24+ chars | Generate with `openssl rand -base64 32` |
| `CORS_ORIGIN` | `https://village-governance-platform-two.vercel.app` | Your Vercel frontend URL |
| `ADMIN_EMAIL` | `admin@village.local` | Admin login email |
| `ADMIN_PASSWORD` | Strong password | Set a production admin password |
| `EMAIL_USER` | Your Gmail or provider email | For OTP delivery |
| `EMAIL_PASSWORD` | App-specific password | Gmail: use app password, not account password |
| `TRUST_PROXY` | `true` | Required for Render reverse proxy |
| `PORT` | `5000` | Default, can be left unset |

### Vercel Frontend Setup
Set these environment variables in your Vercel project settings:

| Variable | Value | Notes |
|----------|-------|-------|
| `VITE_API_URL` | `https://village-governance-platform-1.onrender.com/api` | Your Render backend API URL |

### Verification
1. Render should show "Server started at http://localhost:5000" in logs.
2. Visit your Vercel frontend: `https://village-governance-platform-two.vercel.app/`
3. Test API connectivity by creating an account or viewing complaints.
