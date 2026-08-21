# Woodcastle

Next.js 15 storefront and admin panel for Woodcastle, connected to the Express/Prisma backend.

## Stack

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS v4
- Backend API at `NEXT_PUBLIC_API_URL` (default `http://localhost:5001`)

## Getting started

1. Start the backend on port 5001
2. In this folder:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Admin

- URL: [/admin/login](http://localhost:3000/admin/login)
- Username / password: from backend seed — default `admin` / `admin123`
- OTP for enquiries: returned as `debugOtp` when backend `OTP_PROVIDER=dev`

### Env flavours

| Flavour | Command | API |
|---|---|---|
| Local (default) | `npm run dev` | `http://localhost:5001` |
| Production (Render) | `npm run dev:prod` | `https://woodcastle-backend.onrender.com` |

```
# .env.development
NEXT_PUBLIC_API_URL=http://localhost:5001
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# .env.production
NEXT_PUBLIC_SITE_URL=https://www.woodcastlefurniture.com
NEXT_PUBLIC_API_URL=https://woodcastle-backend.onrender.com

# Cloudinary (admin image uploads — products, categories, blog covers, offer banners)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```
