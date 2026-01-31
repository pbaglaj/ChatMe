**Author:** Paweł Bagłaj
**Group:** 01

# ChatMe

A real-time chat application built with React and Node.js, featuring WebSocket communication for instant messaging and MQTT for user presence/status tracking.

## Tech Stack

**Frontend:**
- React 18 with Vite
- React Router for navigation
- Socket.io-client for real-time messaging
- MQTT.js for user presence (online/offline status)
- Axios for HTTP requests
- Font Awesome icons

**Backend:**
- Node.js with Express 5
- Socket.io for WebSocket connections
- MQTT client for subscribing to user status updates
- Server-Sent Events (SSE) for real-time notifications
- PostgreSQL database
- JWT authentication
- bcrypt for password hashing
- HTTPS with self-signed certificates

**Infrastructure:**
- Docker & Docker Compose
- Eclipse Mosquitto MQTT Broker

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [PostgreSQL](https://www.postgresql.org/) database
- [Docker](https://www.docker.com/) and Docker Compose
- [mkcert](https://github.com/FiloSottile/mkcert) for generating SSL certificates
- npm or yarn package manager

## Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/pbaglaj/ChatMe.git
cd ChatMe
```

### 2. Start MQTT Broker (Docker)

Start the Mosquitto MQTT broker using Docker Compose:

```bash
docker-compose up -d
```

This will start the MQTT broker with:
- **Port 1883**: MQTT protocol (for backend)
- **Port 9001**: WebSocket protocol (for frontend)

Verify the broker is running:

```bash
docker ps
# Should show mqtt-broker container running
```

### 3. Database Setup
Before starting the server, you need to initialize your PostgreSQL database.

1. Create a database named `chatme` in your PostgreSQL instance.
2. Run the schema file to create the necessary tables:

```bash
# From the project root
psql -U your_postgres_user -d chatme -f backend/db/schema.sql
```

### 4. Set up the Backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/chatme
JWT_SECRET=your_jwt_secret_key
PORT=5000
```

Generate SSL certificates for HTTPS:

First install mkcert: https://github.com/FiloSottile/mkcert

```bash
mkdir -p certs
mkcert -key-file certs/key.pem -cert-file certs/cert.pem localhost 127.0.0.1 ::1
```


Start the backend server:

```bash
node server.js
```

The backend will run on `https://localhost:5000`

### 5. Set up the Frontend

Open a new terminal:

```bash
cd frontend
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will run on `https://localhost:5173`

### Testing
The project includes a comprehensive test suite written in Python, covering unit, API, behavior-driven (BDD), and performance testing.

## Prerequisites for Testing

Install the required Python packages:

```bash
pip install pytest requests behave locust
```
## 1. Unit & API Tests

Run unit tests (for backend logic) and API integration tests using `pytest`:

```bash
# Run all unit and API tests
pytest

# Run only unit tests
pytest tests/unit

# Run only API tests (ensure backend is running)
pytest tests/api
```

Run unit tests in backend with Jest (in backend directory):

```bash
npm test
```

With coverage:

```bash
npm run test:coverage
```

## 2. Behavior Driven Development (BDD) Tests

Run feature tests using `behave`. Ensure the backend server is running before executing these tests.

```bash
behave tests/features
```

## 3. Performance tests

Load testing is performed using `locust`.

```bash
locust -f tests/performance/test_perf.py --host=https://localhost:5000
```

### Project Structure
```
ChatMe/
├── backend/
│   ├── api/                # API route handlers
│   │   ├── auth.js
│   │   ├── friends.js
│   │   ├── messages.js
│   │   ├── notifications.js
│   │   ├── posts.js
│   │   ├── profile.js
│   │   ├── rooms.js
│   │   └── users.js
│   ├── certs/              # SSL certificates (generated)
│   │   ├── cert.pem
│   │   └── key.pem
│   ├── config/
│   │   └── db.js           # PostgreSQL connection
│   ├── controllers/
│   │   └── auth_controller.js
│   ├── db/
│   │   └── schema.sql      # Database structure (DDL)
│   ├── middleware/
│   │   └── auth_middleware.js
│   ├── server.js           # Express & Socket.io HTTPS server
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # React context (AuthContext)
│   │   ├── hooks/          # MQTT hooks for user presence
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service layer
│   │   ├── styles/         # Global styles
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── mosquitto/              # MQTT Broker configuration
│   ├── config/
│   │   └── mosquitto.conf  # Mosquitto settings
├── tests/                  # Test Suite
│   ├── api/                # API integration tests
│   ├── features/           # BDD feature files (Behave)
│   │   └── steps/          # Step definitions
│   ├── performance/        # Load tests (Locust)
│   ├── unit/               # Unit tests
│   └── pytest.ini          # Pytest configuration
├── docker-compose.yaml     # Docker services (MQTT broker)
└── README.md
```

## Features

- User authentication (Register/Login with JWT)
- Real-time messaging with WebSockets
- Real-time user presence (online/offline) via MQTT
- Chat rooms support
- User profiles with customization
- Friends system (add/remove friends)
- Posts feed
- Real-time notifications (SSE)
- User search
- Message history
- Secure HTTPS connections

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

### Docker

| Command | Description |
|---------|-------------|
| `docker-compose up -d` | Start MQTT broker |
| `docker-compose down` | Stop MQTT broker |
| `docker logs mqtt-broker` | View broker logs |

## Environment Variables

### Backend `.env`

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | - |
| `JWT_SECRET` | Secret key for JWT tokens | - |
| `PORT` | Server port | `5000` |
| `MQTT_BROKER_URL` | MQTT broker URL | `mqtt://localhost:1883` |

## Troubleshooting

### Backend can't connect to MQTT

- If running backend locally (not in Docker), use `mqtt://localhost:1883`
- If running backend in Docker, use `mqtt://mqtt-broker:1883`

## License

MIT
