# MRPA — Monitoração Residencial da Pressão Arterial

App web para registro e acompanhamento de medições de pressão arterial residencial.

## Setup Local

```bash
npm install
npx prisma db push
npm run dev
```

Acesse http://localhost:3334

### Login Admin
- Email: robsonachamon@gmail.com
- Senha: robnelson

## Deploy

```bash
docker build -t mrpa-app .
docker run -p 3334:3334 -v mrpa-data:/app/data mrpa-app
```

## Tech Stack

- Next.js 15 (App Router)
- Prisma + SQLite
- Tailwind CSS + shadcn/ui
- Recharts
- jsPDF
