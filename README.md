![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)

Bind is a production-ready, full-stack real-time chat application. It features a robust decoupled architecture using a RESTful API for persistent data storage and a Socket.io WebSocket server for instantaneous message broadcasting.

## Features

### Enterprise-Grade Authentication

- **JWT Token Rotation:** Dual-token system (15-min Access, 10-day Refresh) securely stored in HTTP-Only cookies to prevent XSS attacks.
- **Silent Refresh Pipeline:** Automatic session renewal via Axios interceptors.
- **Hybrid Login:** Support for both secure email/password (Bcrypt hashing) and Google OAuth 2.0.

### Profile Management

- **Cloudinary Integration:** Direct avatar uploads using Multer with automatic stale-file cleanup.
- **Dynamic Profiles:** Update display names, bios, and securely change passwords.

### Real-Time Messaging Engine

- **Bi-directional WebSockets:** Live message broadcasting using Socket.io.
- **In-Memory Phonebook:** Custom Socket ID mapping to ensure messages are instantly routed to the correct active user.
- **Cursor-Based Pagination:** Highly optimized "infinite scroll" for the conversation sidebar, preventing database overload at scale.
- **Offline Delivery:** Messages sent to offline users are securely stored in MongoDB and served upon their next login.

---

## Architecture & Tech Stack

The repository is strictly separated into decoupled Frontend and Backend environments.

### Backend (`/backend`)

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (with Mongoose ODM)
- **Real-time:** Socket.io
- **Security:** JSON Web Tokens (jsonwebtoken), Bcrypt, Cookie-Parser
- **Storage:** Cloudinary & Multer

### Frontend (`/frontend`)

- **Framework:** React / Next.js
- **Network:** Axios (with interceptors for token refresh)
- **Real-time:** Socket.io-client
- **State Management:** Zustand

---

## Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB Atlas URI (or local MongoDB instance)
- Cloudinary Account (for image hosting)
- Google Cloud Console (for OAuth Client ID)

---

## 🚀 Backend Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/Talk_8iv.git
cd Talk_8iv/backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the `backend` directory:

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

CORS_ORIGIN=http://localhost:3000

ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRY=15m

REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRY=10d

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### 4. Run the Development Server

```bash
npm run dev
```

The server should now be running at:

```text
http://localhost:5000
```

---

## 📦 Key Dependencies

- Express.js
- MongoDB & Mongoose
- JSON Web Token (JWT)
- Bcrypt
- Cookie Parser
- Cloudinary
- Multer
- CORS
- Dotenv
- Socket.io

---

## 🎨 Frontend Setup

### 1. Navigate to the Frontend Directory

```bash
cd Talk_8iv/frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the `frontend` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

### 4. Run the Development Server

```bash
npm run dev
```

The frontend should now be running at:

```text
http://localhost:3000
```

## 📂 Project Structure

```text
Talk_8iv/
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middlewares/
│   │   ├── utils/
│   │   ├── db/
│   │   ├── app.js
│   │   └── index.js
│   │
│   ├── public/
│   ├── .env
│   ├── package.json
│   └── README.md
│
└── frontend/
    ├── app/
    ├── components/
    ├── lib/
    ├── public/
    ├── store/
    ├── .env.local
    ├── package.json
    └── README.md
```
