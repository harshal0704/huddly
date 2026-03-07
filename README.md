<div align="center">
  <img src="public/header-logo.png" alt="Huddly Logo" width="300" />
  <h1>Huddly</h1>
  <p><strong>A fully immersive, 3D spatial virtual office and meeting environment built for the future of remote work.</strong></p>
</div>

---

## 🌟 Overview

Huddly is a next-generation virtual workspace that bridges the gap between remote and in-person collaboration. Move your avatar through a beautifully rendered 3D office, seamlessly transition into video calls when you walk up to colleagues, collaborate on shared whiteboards, and broadcast your screen to the whole room. 

Say goodbye to grid-view fatigue and hello to spatial, persistent, and engaging remote team spaces.

## ✨ Key Features

- **🚶‍♂️ Spatial Proximity Video/Audio:** Walk near a colleague in the 3D world, and their video feed automatically fades in. Step away, and it fades out. Spatial audio ensures you only hear those close to you.
- **🏢 Multiple 3D Environments:** Choose from beautifully crafted templates like the *Office, Café, Library, Gaming Lounge, Main Stage, Rooftop Bar, Theater*, or build your own custom room.
- **🖥️ Screen Sharing & Broadcasting:** Walk up to TV screens in meeting rooms or the main stage to broadcast your screen to everyone in the vicinity.
- **🎨 Shared Whiteboards:** Real-time synchronized whiteboards for collaborative brainstorming.
- **🛠️ Room Builder:** A fully interactive 2D grid editor to drag and drop desks, chairs, plants, and screens to design your team's perfect custom virtual space.
- **⚡ Real-time Multiplayer:** High-performance, low-latency movement and chat synchronization using Socket.IO.

## 🚀 Tech Stack

- **Frontend:** Next.js (App Router), React 19, TypeScript, Tailwind CSS, Framer Motion
- **3D Graphics:** Three.js, React Three Fiber (`@react-three/fiber`), React Three Drei (`@react-three/drei`)
- **WebRTC / Media:** LiveKit (`@livekit/components-react`, `livekit-server-sdk`)
- **Real-time Engine:** Custom Node.js + Socket.IO Server
- **State Management:** Zustand
- **Database:** Supabase 

## 📸 Sneak Peek

*(Add screenshots of your 3D world, video call proximity, and room builder here!)*

## 🛠️ Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- A [LiveKit](https://livekit.io/) Cloud account (for WebRTC video/audio)
- A [Supabase](https://supabase.com/) account (for storing rooms & spaces)

### 1. Clone the repository
```bash
git clone https://github.com/harshal0704/huddly.git
cd huddly
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env.local` file in the root directory and populate it with your environment variables:

```env
# URL for the app
NEXT_PUBLIC_APP_URL=http://localhost:3000

# LiveKit Keys
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_api_secret
NEXT_PUBLIC_LIVEKIT_URL=wss://your-project-id.livekit.cloud

# Socket Server
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
SOCKET_PORT=3001

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Start the Application

You'll need to run both the Next.js frontend and the Socket.IO server simultaneously.

**Terminal 1 (Start Socket Server):**
```bash
npm run server
```

**Terminal 2 (Start Next.js Client):**
```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

## 🎮 How to Play

- **Movement:** `W`, `A`, `S`, `D` to walk around the room.
- **Look:** Use your mouse to look around in First-Person mode.
- **Toggle Mode:** Press `Tab` to toggle between **UI Mode** (to click buttons and panels) and **Navigation Mode** (to look and walk).
- **Interact:** Press `E` when close to interactable objects:
  - 🪑 Chairs: Sit down / Stand up
  - 🖥️ TV Screens: Start screen sharing to the room
  - ✏️ Whiteboards: Open the shared drawing board

---

*Built with ❤️ for a better remote work experience.*
