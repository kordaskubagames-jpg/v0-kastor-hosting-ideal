# Kastor Hosting - Ideal Version (Pre-Clyde Obfuscator)

## Opis
To jest idealna wersja aplikacji Kastor Hosting z PRZED dodania Clyde obfuscatora. Aplikacja jest w pełni funkcjonalna i gotowa do produkcji.

## Features
- ✅ **Discord OAuth Logowanie** - TYLKO Discord, bez email/password
- ✅ **Dashboard** - Overview, Projects, Keys, Analytics
- ✅ **Sign Out** - Logout funkcjonalność
- ✅ **Professional UI** - Tailwind CSS + shadcn/ui
- ✅ **Obfuscator** - Anti-tamper, Anti-dump, Anti-logger protection (Kastor/Luarph, bez Clyde)
- ✅ **Database** - Neon PostgreSQL z Better Auth
- ✅ **Deployment Ready** - Na Vercel bez błędów

## Live URL
https://v0-kastor-hosting.vercel.app

## Instalacja lokalnie

### 1. Rozpakowanie archiwum
```bash
tar -xzf v0-kastor-hosting-ideal.tar.gz
cd v0-project
```

### 2. Instalacja zależności
```bash
pnpm install
# lub
npm install
```

### 3. Konfiguracja environment variables
Utwórz plik `.env.local`:

```env
# Better Auth Secret (generuj: openssl rand -base64 32)
BETTER_AUTH_SECRET=<twój-random-secret>

# Discord OAuth
DISCORD_CLIENT_ID=<twój-discord-app-id>
DISCORD_CLIENT_SECRET=<twój-discord-secret>

# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://user:password@host/database
```

### 4. Uruchomienie dev serwera
```bash
pnpm dev
```
Aplikacja będzie dostępna na http://localhost:3000

### 5. Build do produkcji
```bash
pnpm run build
pnpm start
```

## Struktura projektu
```
├── app/
│   ├── page.tsx                 # Strona główna
│   ├── dashboard/
│   │   ├── page.tsx            # Dashboard Overview
│   │   ├── projects/page.tsx   # Projects page
│   │   ├── keys/page.tsx       # Keys page
│   │   ├── analytics/page.tsx  # Analytics page
│   │   └── layout.tsx          # Dashboard layout z auth
│   ├── sign-in/page.tsx        # Sign-in page z Discord button
│   ├── api/auth/[...all]/route.ts  # Better Auth API route
│   └── layout.tsx              # Root layout
├── components/
│   ├── auth-form.tsx           # Discord OAuth form
│   ├── dashboard-sidebar.tsx   # Dashboard sidebar z sign out
│   └── ui/                     # shadcn/ui components
├── lib/
│   ├── auth.ts                 # Better Auth konfiguracja (Discord OAuth)
│   ├── auth-client.ts          # Client-side auth
│   ├── db.ts                   # Database connection
│   └── obfuscator.ts           # Obfuscator (Kastor/Luarph)
└── package.json                # Dependencies
```

## Discord OAuth Setup

1. Wejdź na https://discord.com/developers/applications
2. Kliknij "New Application"
3. Przejdź do "OAuth2" → "General"
4. Skopiuj **Client ID** i **Client Secret**
5. Dodaj Redirect URL: `http://localhost:3000/api/auth/callback/discord` (dev) oraz produkcyjny URL

## Deployment na Vercel

### Via CLI
```bash
vercel --prod
```

### Via Git
1. Utwórz GitHub repo
2. Push kod do GitHub
3. Polacz z Vercel i auto-deploy

### Wymagane environment variables na Vercel
- `BETTER_AUTH_SECRET`
- `DISCORD_CLIENT_ID`
- `DISCORD_CLIENT_SECRET`
- `DATABASE_URL`

## Technologie
- **Frontend:** Next.js 16, React 19, TypeScript
- **Styling:** Tailwind CSS 4, shadcn/ui
- **Auth:** Better Auth z Discord OAuth
- **Database:** Neon PostgreSQL
- **Deployment:** Vercel

## Wymagania
- Node.js 18+
- pnpm (lub npm)
- Neon PostgreSQL database
- Discord Developer Application

## Troubleshooting

### "Cannot find module 'better-auth'"
```bash
pnpm install
```

### "Database connection failed"
Sprawdź `DATABASE_URL` w `.env.local`

### "Discord login not working"
Sprawdź DISCORD_CLIENT_ID i DISCORD_CLIENT_SECRET w `.env.local`

## Support
Aplikacja jest w pełni funkcjonalna i gotowa do produkcji.
