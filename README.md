# Asstream V2 🚀

Welcome to **Asstream V2**, a modern content management system (CMS) and specialized backend that generates customized JSON feeds compatible with Roku Direct Publisher, simplifying the administration of live channels, external IPTV sources, and video-on-demand (VOD) content for Roku TV.

## 🌟 Architecture & Stack

- **Next.js 16 (App Router)**: Server Components (`RSC`) and Server Actions for high performance and minimal client overhead.
- **Neon (Serverless PostgreSQL)**: Scalable cloud Postgres database.
- **Drizzle ORM**: Type-safe relational data modeling and migrations (`drizzle-kit`).
- **Better Auth**: Self-hosted, sovereign authentication and session management directly stored in PostgreSQL.
- **Resend**: Transactional email delivery for password reset flows with local developer fallback.
- **Tailwind CSS & Shadcn UI**: Modern, accessible dashboard interface with dark mode and toast feedback via Sonner.
- **Roku Feed Caching (ISR)**: Cached feed generation (`stale-while-revalidate`) protecting the database from high-volume player polling.

## ✨ Main Features

1. **Category and Channel Manager**: Full CRUD control to manage and categorize content for Roku formats (`movies`, `liveFeeds`, `tvSpecials`, etc.).
2. **VOD Auto-Completion with TMDB**: Search and autocomplete movie/show metadata, posters, and backdrops via The Movie Database (TMDB) API.
3. **Automatic Validation of "TV Specials" (Twitch)**: Dynamic extraction of live HLS (`.m3u8`) streams via `twitch-m3u8`. Channels that are not live automatically hide from the feed.
4. **Live Health-Checks for `liveFeeds`**: Automated reachability ping with timeout to ensure broken 24/7 streams are omitted from player devices.
5. **External IPTV-ORG Integration**: Whitelist curated IPTV channels and categories from public IPTV-ORG feeds.

## 🛠 Local Setup

### Prerequisites
- Node.js >= 20
- pnpm >= 11
- A [Neon](https://neon.tech/) PostgreSQL database
- TMDB API Key (optional, for metadata search)
- [Resend](https://resend.com/) API Key (optional, for email delivery)

### Installation

1. Clone the repository and install dependencies:
   ```bash
   pnpm install
   ```

2. Configure environment variables in `.env.local`:
   ```env
   # Database (Neon)
   DATABASE_URL=postgresql://user:password@endpoint-pooler.region.neon.tech/neondb?sslmode=require

   # Authentication (Better Auth)
   BETTER_AUTH_SECRET=your_generated_random_secret
   BETTER_AUTH_URL=http://localhost:3000

   # Optional Services
   TMDB_API_KEY=your_tmdb_api_key
   RESEND_API_KEY=re_your_resend_api_key
   EMAIL_FROM=AsStream <onboarding@resend.dev>
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

3. Push the relational schema to your database:
   ```bash
   pnpm db:push
   ```

4. Run the development server:
   ```bash
   pnpm dev
   ```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🗄 Database Management

- **Push Schema Changes**: `pnpm db:push`
- **Drizzle Studio (Visual Inspector)**: `pnpm db:studio`

## 📡 Roku Feed Endpoint

The feed consumed by Roku Direct Publisher is served at:

```
GET /api/feed?user_id=<USER_ID>
```

Each user has an isolated feed URL displayed in their dashboard sidebar with their unique `user_id`.
