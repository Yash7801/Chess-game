♟️ Real-Time Multiplayer Chess

A fast, minimalist, real-time chess game built with React + TypeScript and a WebSocket backend.
Play instantly with another player — no accounts, no waiting.

🚀 Features

🔄 Live multiplayer via WebSockets

✔️ Fully legal move validation (chess.js)

🎯 Last-move highlight

📜 Move list tracking

🔌 Auto WebSocket reconnect

⚡ Fast, lightweight frontend (Vite + TS)

🧩 Tech Stack

Frontend: React, TypeScript, Vite, TailwindCSS
Backend: Node.js, TypeScript, ws, chess.js

🛠️ Run Locally
Backend
cd backend1
npm install
npm run dev

Frontend
cd frontend
npm install
npm run dev

🌐 Deploy
Backend → Render

Root Directory → backend1

Build Command → npm run build

Start Command → npm start

Frontend → Vercel

Root Directory → frontend

Point WebSocket URL to your Render backend

🔌 WebSocket Events
Event	Description
init_game	Assigns player colors
move	Sends { from, to } move
