# 🏠 Huddly — Walk up. Talk naturally.

<div align="center">

**The friendliest 2D virtual world for classrooms, offices, coworking, and events.**

*No awkward meeting links ever. Just walk up and talk.*

</div>

---

## ✨ Features

- **Proximity Magic** — Video & spatial audio auto-activates when avatars are close
- **Infinite Custom Maps** — 200+ drag-and-drop objects with Tiled-compatible format
- **Classroom Mode** — Stage tile with broadcast, auto-seating for students
- **Emotes & Status** — Wave, react, set your status (Free / Focused / In Meeting)
- **Private Huddle Zones** — Audio only for people inside the polygon
- **Screen Sharing + Whiteboard** — Collaborate in real-time
- **Mobile Friendly** — Touch drag, virtual joystick, pinch zoom
- **Dark/Light Themes** — Every theme is crafted with love

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 (App Router) + TypeScript + Tailwind CSS |
| UI | shadcn/ui + Radix UI + Framer Motion |
| State | Zustand + TanStack Query |
| 2D Engine | Phaser 3.70+ (integrated as React component) |
| Pathfinding | EasyStar.js (A* algorithm) |
| Real-time | Supabase Realtime + Socket.io (fallback) |
| Video/Audio | LiveKit (selective WebRTC, proximity-based) |
| Auth | Supabase Auth (Google, Magic Link, Guest) |
| Database | Supabase (Postgres + Storage) |
| Deployment | Vercel (frontend) + Supabase (backend) |

## 📁 Project Structure

```
src/
├── app/                     # Next.js App Router pages
│   ├── page.tsx             # Landing page
│   ├── login/page.tsx       # Auth page
│   ├── dashboard/page.tsx   # Room management
│   ├── room/[id]/page.tsx   # In-room experience
│   └── editor/[id]/page.tsx # Map editor
├── components/
│   ├── landing/             # Hero, Features, Pricing, etc.
│   ├── room/                # Chat, Minimap, Toolbar, Emotes
│   ├── ui/                  # Button, Card, Dialog, Input, Badge
│   └── shared/              # Navbar, Footer
├── game/
│   ├── PhaserGame.tsx       # React ↔ Phaser wrapper
│   └── scenes/
│       └── RoomScene.ts     # Main game scene
├── stores/                  # Zustand stores
│   ├── authStore.ts
│   ├── roomStore.ts
│   └── spacesStore.ts
├── types/index.ts           # TypeScript types
└── lib/utils.ts             # Utilities
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/huddly.git
cd huddly

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase and LiveKit credentials

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

See `.env.example` for all required variables:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `NEXT_PUBLIC_LIVEKIT_URL` | LiveKit server WebSocket URL |
| `NEXTAUTH_SECRET` | Random secret for NextAuth |
| `NEXTAUTH_URL` | Your app's URL |

### Building for Production

```bash
npm run build
npm start
```

### Deploy to Vercel

```bash
npx vercel
```

The included `vercel.json` configures security headers automatically.

## 🎮 Controls

| Key | Action |
|-----|--------|
| `W/A/S/D` or Arrow Keys | Move avatar |
| Mouse Click | Walk to point (A* pathfinding) |
| `Spacebar` | Quick emote |
| Bottom toolbar | Mute, Camera, Chat, Participants, Minimap |

## 🎨 Asset Manifest

The following sprite assets are needed for full visual fidelity:

| Asset | Description | Size |
|-------|-------------|------|
| `avatar_spritesheet.png` | 8-direction walking sprites, 64x64 per frame | 512×512 |
| `tileset_floors.png` | Floor tiles (wood, carpet, grass, stone) | 256×256 |
| `tileset_walls.png` | Wall tiles (various styles) | 256×128 |
| `objects_furniture.png` | Desks, chairs, sofas, tables | 512×512 |
| `objects_tech.png` | Whiteboards, TVs, computers | 256×256 |
| `objects_decor.png` | Plants, lamps, paintings, rugs | 256×256 |
| `objects_interactive.png` | Doors, coffee machines, arcade | 256×256 |
| `emotes_spritesheet.png` | Animated emoji reactions | 128×128 |
| `ui_icons.png` | Status icons, badges | 64×64 |

> 💡 All assets can be generated with AI image generation tools — the game currently uses procedural graphics and emoji as placeholders.

## 📝 License

MIT

---

<div align="center">

**Made with ❤️ by Harshal**

</div>
