## The Culling Game

Mobile-first Jujutsu Kaisen battle simulator built with the Next.js App Router, Prisma/PostgreSQL, TailwindCSS v4, NextAuth (Google only), and Gemini for AI-assisted narrative + balancing.

### Tech Stack
- Next.js 15 (App Router, Server Actions)
- React 18.3 + TypeScript
- TailwindCSS v4 (monochrome design language)
- Prisma ORM + PostgreSQL
- NextAuth with Google OAuth + Prisma adapter
- Gemini (`@google/generative-ai`) for character validation, weaknesses, and battle summaries

### Local Setup
1. Install dependencies
   ```bash
   npm install
   ```
2. Provision a PostgreSQL database and grab the connection string.
3. Create an `.env.local` file at the project root with:
   ```
   DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/jjk_battle
   NEXTAUTH_SECRET=replace-me-with-a-long-random-string
   NEXTAUTH_URL=http://localhost:3000
   GOOGLE_CLIENT_ID=your-google-oauth-client-id
   GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret
   GEMINI_API_KEY=your-google-gemini-api-key
   TOURNAMENT_SECRET=long-random-string-used-by-your-cron
   ```
4. Push the schema and generate the Prisma client
   ```bash
   npm run db:sync
   ```
5. Start the dev server
   ```bash
   npm run dev
   ```

### Project Structure
- `app/` – App Router layouts, public/secure pages, API routes, server actions
- `app/onboarding` – Multi-step sorcerer creation flow with AI validation
- `app/dashboard` – Character card, weaknesses, binding vows, battle history
- `app/api/tournament/run` – Cron-friendly endpoint to execute the bracket
- `prisma/` – Prisma schema plus generated client output
- `src/lib/` – Prisma helper, auth utilities, Gemini service layer, tournament logic
- `src/components/` – UI building blocks and sections
- `src/providers/` – Client-only providers (React Query, etc.)

### Scripts
- `npm run dev` – Start Next.js dev server
- `npm run build` – Production build
- `npm run start` – Start production server
- `npm run lint` – Run ESLint
- `npm run db:sync` – Generate Prisma client and push schema
- `npm run test` – Run Vitest unit tests (tournament helpers)

### AI + Tournament Flow
- Character onboarding + upgrades call Gemini to assign grade, weaknesses, and balancing notes before persisting to Prisma.
- Binding vows are generated via Gemini: sacrifices, enhancements, conditions, limitations, and side-effects are saved alongside the character.
- `src/lib/tournament.ts` pairs fighters, scores them (energy, technique complexity, vows, grade multiplier), injects 10–30% randomness, records `FightResult`s, and writes Gemini battle recaps.

### Cron / Automation
- External scheduler should call `POST /api/tournament/run` daily.
- If `TOURNAMENT_SECRET` is provided, set `Authorization: Bearer <secret>` on the request.
- Response: `{ ok: true, fights: <count> }`. Endpoint also revalidates `/` and `/dashboard`.

### UI Surfaces
- **Home** – Mobile leaderboard, MVP callout, latest fight summaries with deep-links.
- **Onboarding** – Multi-step form enforcing lore depth before creation completes.
- **Dashboard** – Character overview, weakness matrix, binding vow list, upgrade form, and battle history feed.
- **Fight Summary** – Dedicated page rendering full Gemini narration (techniques, weaknesses, domains, injuries, final blow).

### Environment & Security
- Never commit `.env*` files. Keep secrets in local `.env.local` or deployment-specific secret managers.
- Gemini calls require billing-enabled Google AI Studio credentials.
- All auth flows assume HTTPS + secure cookies in production.
- Lock the tournament endpoint with `TOURNAMENT_SECRET` when deploying crons.
