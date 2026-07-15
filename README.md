# LuaForge - Lua Script Hosting & Obfuscation Platform

**Ideal Version (Pre-Clyde Obfuscator)**

This is the ideal version of LuaForge - a professional Lua script protection platform built with Next.js 16, featuring Discord OAuth authentication, a comprehensive dashboard, and enterprise-grade protection mechanisms.

## Features

- **Discord OAuth Authentication** - Seamless login with Discord
- **Dashboard System** - 4 main sections:
  - Overview - Stats and analytics overview
  - Projects - Manage Lua script projects
  - Keys - Access key management
  - Analytics - Performance metrics and usage analytics
- **Protection Features**:
  - Anti-tamper protection
  - Anti-dump protection
  - Anti-logger protection
  - Key-based execution system
  - Raw executor endpoint support
- **Professional UI** - Built with Tailwind CSS + shadcn/ui components
- **Database** - Neon PostgreSQL with Better Auth integration
- **Production Ready** - Deployed and tested on Vercel

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS
- **Authentication**: Better Auth with Discord OAuth
- **Database**: Neon PostgreSQL
- **UI Components**: shadcn/ui
- **Deployment**: Vercel
- **Package Manager**: pnpm

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm (recommended) or npm
- Neon PostgreSQL database
- Discord OAuth application

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/kordaskubagames-jpg/v0-kastor-hosting-ideal.git
cd v0-kastor-hosting-ideal
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Set up environment variables**
Create a `.env.local` file:
```env
# Database
DATABASE_URL=postgresql://user:password@host/database

# Better Auth
BETTER_AUTH_SECRET=your-random-secret-here
BETTER_AUTH_URL=http://localhost:3000

# Discord OAuth
DISCORD_CLIENT_ID=your-discord-app-id
DISCORD_CLIENT_SECRET=your-discord-app-secret

# Optional - for production
VERCEL_URL=your-vercel-domain.com
```

4. **Run development server**
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Build for production**
```bash
pnpm run build
pnpm start
```

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── page.tsx           # Home page
│   ├── sign-in/           # Discord login page
│   ├── dashboard/         # Protected dashboard
│   │   ├── page.tsx       # Overview
│   │   ├── projects/      # Projects management
│   │   ├── keys/          # API keys
│   │   └── analytics/     # Analytics page
│   ├── actions/           # Server actions
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── auth-form.tsx     # Discord login form
│   └── dashboard-sidebar.tsx
├── lib/                   # Utilities & helpers
│   ├── auth.ts           # Better Auth setup
│   ├── db.ts             # Database connection
│   └── utils.ts
└── package.json

```

## Database Schema

The application uses Neon PostgreSQL with the following main tables:
- `user` - User authentication data
- `session` - User sessions
- `account` - OAuth accounts (Discord)

Better Auth automatically manages the schema creation and migrations.

## Authentication Flow

1. User clicks "Continue with Discord" on sign-in page
2. Discord OAuth redirects to Better Auth callback
3. User data is created/updated in database
4. Session is established
5. User can access protected dashboard

## Available Scripts

```bash
# Development
pnpm dev

# Production build
pnpm run build
pnpm start

# Linting
pnpm run lint

# Type checking
pnpm run type-check
```

## Deployment on Vercel

This application is configured for seamless Vercel deployment:

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy - Vercel automatically detects Next.js and builds

**Live Demo**: https://v0-kastor-hosting.vercel.app

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Neon PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | Yes | Random secret for Better Auth (generate with `openssl rand -base64 32`) |
| `DISCORD_CLIENT_ID` | Yes | Discord OAuth app ID |
| `DISCORD_CLIENT_SECRET` | Yes | Discord OAuth app secret |
| `BETTER_AUTH_URL` | No | Custom auth URL (auto-detected if not set) |

## Setting Up Discord OAuth

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to OAuth2 → General
4. Copy Client ID and Client Secret
5. Add Redirect URL: `http://localhost:3000/api/auth/callback/discord` (for local dev)
6. For production: `https://your-domain.com/api/auth/callback/discord`
7. Add to `.env.local`

## Troubleshooting

### Build fails with "No Next.js version detected"
- Ensure `next` is in `package.json` dependencies
- Check `.packagemanager` file contains correct pnpm version
- Delete `pnpm-lock.yaml` and run `pnpm install`

### Discord login not working
- Verify Discord credentials in `.env.local`
- Check redirect URLs match exactly (including protocol)
- Clear cookies and try again

### Database connection error
- Test connection string with `psql`
- Ensure Neon PostgreSQL is active
- Check `.env.local` has correct `DATABASE_URL`

## License

This project is provided as-is for learning and development purposes.

## Support

For issues and questions, please check the [GitHub Issues](https://github.com/kordaskubagames-jpg/v0-kastor-hosting-ideal/issues).

---

**Version**: Pre-Clyde Obfuscator (Ideal Release)
**Last Updated**: 2026-07-15
**Status**: Production Ready ✓
