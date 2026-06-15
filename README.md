# JEE College Predictor (JoSAA & CSAB)

Welcome to the **JEE College Predictor**! Finding the right college after clearing JEE Main can be incredibly stressful and confusing. To solve this, I built this predictor to help candidates analyze their options, build organized preference lists, and make informed choices.

**Try it out live**: [jee.qzz.io](https://jee.qzz.io)

---

## Credits
This tool is maintained as an open-source project, with some pair-programming help from AI assistants (Gemini & Claude) for code refinement and security auditing.

---

## Features

- **Double-Counseling Support**: Separate flows for **JoSAA** (all 6 rounds) and **CSAB** (special rounds, Home State vs Other State quotas).
- **Accurate Probability Engine**: Classifies chances into **High**, **Medium**, or **Low** using dynamic margins that scale relative to the cutoff (instead of a naive fixed-rank window).
- **Smart Filtering & Sorting**: Filter by institute type (NIT, IIIT, GFTI), branch type, degree duration, state, or search directly. Sort results by NIRF ranking, median placement package, or historical cutoffs.
- **Preference Wishlist**: Easily star branches to build your wishlist, write custom notes on why you liked them (e.g., "high package", "too far"), and reorder your list in one click by typing the target position.
- **Clean Export**: Print a beautifully formatted PDF of your preference list or export it as a clean `.txt` choice filling sheet ready for the official portal.

---

## The Tech Stack

- **Frontend**: [Next.js 15](https://nextjs.org/) (App Router, statically exported to run on edge servers).
- **UI/Styles**: React 19, CSS Custom Properties (sleek custom styling with modern grid layouts and responsive controls), Lucide React, and Framer Motion.
- **Backend API**: [Cloudflare Workers](https://workers.cloudflare.com/) (serverless execution environment).
- **Database**: [Cloudflare D1](https://developers.cloudflare.com/d1/) (edge SQL database).
- **ORM**: [Prisma](https://www.prisma.io/) with the Cloudflare D1 driver adapter.
- **Security**: Web Crypto API (HMAC-SHA256 request signing and AES-GCM-256 payload encryption).

---

## Under the Hood: Probability Calculations

Instead of a fixed rank threshold (e.g., showing anything within 1,000 ranks), the engine calculates thresholds dynamically. This reflects how competitiveness scales:

```
High    → userRank <= closingRank - min(10000, closingRank * 0.10)
Medium  → userRank <= closingRank + min(5000,  closingRank * 0.05)  
Low     → userRank <= closingRank + min(20000, closingRank * 0.20)
```

For instance:
- A course closing at **5,000** gets a tight High chance buffer of **500** ranks.
- A course closing at **80,000** gets a wider High chance buffer of **8,000** ranks.

---

## API Security Design

To prevent scrapers from overloading our database, the frontend and backend communicate via a time-windowed cryptographically signed handshake:

1. **HMAC Signature**: The frontend generates a timestamp window (5-minute intervals) and signs it using a shared secret with HMAC-SHA256. This is passed in the `Authorization` header.
2. **AES-GCM Payload Encryption**: The worker verifies the signature and retrieves the matching cutoffs. The response JSON is then encrypted with AES-GCM-256 before being sent back.
3. **Decryption on Client**: The frontend decrypts the payload locally using the shared key. 

---

## How to Run Locally

### 1. Prerequisites
Ensure you have **Node.js 18+** installed.

### 2. Setup Database & Environment
Clone the repository and run:
```bash
# Install dependencies
npm install

# Initialize local SQLite database schema
npx prisma db push

# Seed database with the JoSAA & CSAB CSV data
npx tsx scripts/seed.ts
```

Create a `.env` file in the root directory:
```env
DATABASE_URL="file:./dev.db"
NEXT_PUBLIC_API_URL="http://localhost:8787"  # if running the API worker locally
```

### 3. Start Development Servers
Run the frontend:
```bash
npm run dev
```

To run the API worker locally:
```bash
cd api-worker
npm install
npx wrangler dev
```

---

## Deploying to Cloudflare

If you want to host your own copy:

### 1. Create a D1 Database
```bash
npx wrangler d1 create collegepredictor-db
```
Paste the database ID into your `wrangler.toml` (both in the root and in `api-worker/`).

### 2. Apply Schema
```bash
npx wrangler d1 execute collegepredictor-db --remote --file=prisma/migration.sql
```

### 3. Deploy API Worker
```bash
cd api-worker
npx wrangler secret put API_SECRET_KEY  # set a secure random passphrase
npx wrangler deploy
```

### 4. Deploy Frontend
Ensure the char-code array in `src/lib/auth.ts` matches the secret key you set in the API worker.
```bash
# Build the Next.js app for Cloudflare Pages output
npx @cloudflare/next-on-pages

# Deploy static assets
npx wrangler pages deploy .vercel/output/static --project-name=collegepredictor
```

---

## License
This project is open-source. Feel free to copy, modify, and deploy it for other state counseling boards (WBJEE, MHT-CET, REAP, etc.).
