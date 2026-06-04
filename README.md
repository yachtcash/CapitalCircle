# Capital Circle

A private business opportunity marketplace connecting investors, developers, entrepreneurs, land owners, suppliers, and business professionals.

This repository contains the UI foundation only — a Next.js application built with TypeScript, Tailwind CSS, and the App Router. Authentication, database, messaging, and user accounts are intentionally **not** implemented yet.

## Stack

- **Next.js** 16 (App Router)
- **React** 19
- **TypeScript**
- **Tailwind CSS** v4
- **lucide-react** icons

## Design

- Mobile-first responsive layout
- Dark navy / white / gold accent palette
- Desktop: fixed left sidebar (≥ md)
- Mobile: fixed bottom navigation (< md)

## Pages

| Route       | File                        | Description                                         |
| ----------- | --------------------------- | --------------------------------------------------- |
| `/`         | `src/app/page.tsx`          | Hero, search bar, 13 categories, featured deals     |
| `/post`     | `src/app/post/page.tsx`     | Post an opportunity form                            |
| `/messages` | `src/app/messages/page.tsx` | Inbox with mock conversation threads                |
| `/profile`  | `src/app/profile/page.tsx`  | Member profile with stats, bio, and recent activity |

## Categories

Real Estate Development · Hotels & Resorts · Land Opportunities · Construction Projects · Investment Opportunities · Manufacturing & Materials · Infrastructure · Energy · Hospitality · Commercial Services · Business Acquisitions · Joint Ventures · Suppliers & Logistics

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Production

```bash
npm run build
npm run start
```

## Project Layout

```
src/
├── app/
│   ├── layout.tsx          # Root layout w/ Sidebar + BottomNav
│   ├── globals.css         # Tailwind v4 theme tokens
│   ├── page.tsx            # Home
│   ├── post/page.tsx
│   ├── messages/page.tsx
│   └── profile/page.tsx
├── components/
│   ├── Sidebar.tsx
│   ├── BottomNav.tsx
│   ├── Hero.tsx
│   ├── SearchBar.tsx
│   ├── CategoryGrid.tsx
│   ├── FeaturedOpportunities.tsx
│   ├── OpportunityCard.tsx
│   └── PageShell.tsx
├── data/
│   ├── nav.ts
│   ├── categories.ts       # 13 sectors w/ icon + count
│   └── opportunities.ts    # mock featured deals
└── lib/
    └── cn.ts               # className helper
```
