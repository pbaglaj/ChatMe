# ChatMe 💬

A real-time chat application built with React and Node.js, featuring WebSocket communication for instant messaging.

## Tech Stack

**Frontend:**
- React 18 with Vite
- React Router for navigation
- Socket.io-client for real-time communication
- Axios for HTTP requests

**Backend:**
- Node.js with Express 5
- Socket.io for WebSocket connections
- PostgreSQL database
- JWT authentication
- bcrypt for password hashing

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [PostgreSQL](https://www.postgresql.org/) database
- npm or yarn package manager

## Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/pbaglaj/ChatMe.git
cd ChatMe
```

### 2. Set up the Backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/chatme
JWT_SECRET=your_jwt_secret_key
PORT=3000
```

Start the backend server:

```bash
node server.js
```

The backend will run on `http://localhost:3000`

### 3. Set up the Frontend

Open a new terminal:

```bash
cd frontend
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## Project Structure

```
ChatMe/
├── backend/
│   ├── config/
│   │   └── db.js           # PostgreSQL connection
│   ├── controllers/
│   │   └── auth_controller.js
│   ├── middleware/
│   │   └── auth_middleware.js
│   ├── server.js           # Express & Socket.io server
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # React context (AuthContext)
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service layer
│   │   ├── styles/         # Global styles
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
└── README.md
```

## Features

- 🔐 User authentication (Register/Login)
- 💬 Real-time messaging with WebSockets
- 🚪 Chat rooms support
- 👤 User profiles
- 📜 Message history

## Available Scripts

### Frontend

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

### Backend

| Command | Description |
|---------|-------------|
| `node server.js` | Start the server |

## Environment Variables

### Backend `.env`

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret key for JWT tokens |
| `PORT` | Server port (default: 3000) |

## License

MIT
