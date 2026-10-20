# Endlessync Frontend

Real-time collaborative infinite canvas frontend built with Next.js 16, React 19, Tailwind CSS, and Socket.IO.

## Getting Started

1. Set the backend URL in `.env.local` (or in Vercel project environment settings):
```env
NEXT_PUBLIC_BACKEND_URL=https://your-endlessync-backend.onrender.com
```

2. Run development server:
```bash
npm install
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment to Vercel
Connect this repository to [Vercel](https://vercel.com) and configure `NEXT_PUBLIC_BACKEND_URL` to point to your Render backend instance.
