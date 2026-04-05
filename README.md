# Canvas Editor

A web-based canvas editor with a React/Vite frontend and an Express backend. Draw, edit, and export canvas creations with a built-in code editor powered by Monaco.

## Tech Stack

- **Client** – React 18, TypeScript, Vite, Konva, Monaco Editor, Tailwind CSS, Zustand
- **Server** – Node.js, Express, TypeScript, tsx

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- npm v9 or higher

## Installation

Install dependencies for both the client and server from the root of the repository:

```bash
npm run install:all
```

## Running in Development

The client and server must be started in **separate terminals**.

**Terminal 1 – start the backend (port 3001):**

```bash
npm run dev:server
```

**Terminal 2 – start the frontend (port 5173):**

```bash
npm run dev:client
```

Then open [http://localhost:5173](http://localhost:5173) in your browser. The client proxies all `/api` requests to the server automatically.

## Building for Production

```bash
npm run build:client   # builds the React app to client/dist
npm run build:server   # compiles the server TypeScript to server/dist
```

To run the compiled server:

```bash
cd server && npm start
```

## Project Structure

```
canvas-editor/
├── client/          # React + Vite frontend
│   └── src/
│       ├── components/
│       ├── hooks/
│       ├── store/
│       ├── types/
│       └── utils/
├── server/          # Express backend
│   └── src/
│       ├── routes/  # API route handlers
│       └── index.ts # Server entry point
└── shared/          # Shared types/schemas (Zod)
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| * | `/api/export` | Canvas export routes |
