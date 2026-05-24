# Chat Application

## Project Structure

```text
chat-application/
├── README.md                  # Project documentation & schema diagram
├── .gitignore                 # Ignore node_modules and .env files
├── docs/
│   └── schema-diagram.png     # Database schema diagram
│
├── frontend/                  # Next.js / React Application
│   ├── package.json
│   ├── .env.local
│   ├── src/
│   │   ├── app/               # Next.js App Router
│   │   ├── components/        # UI Components (ChatWindow, Sidebar, MessageBubble)
│   │   ├── hooks/             # Custom Hooks (useSocket, useAuth)
│   │   ├── lib/               # API Connection Logic (Axios / Fetch)
│   │   └── styles/            # Global CSS / Tailwind Configuration
│
└── backend/                   # Node.js / Express Application
    ├── package.json
    ├── .env                   # MongoDB URI & Google OAuth Keys
    ├── server.js              # Application Entry Point & Socket.IO Setup
    └── src/
        ├── config/            # Database Configuration
        ├── middleware/        # Authentication & Authorization Middleware
        ├── controllers/       # Business Logic Controllers
        ├── routes/            # API Route Definitions
        └── models/            # MongoDB/Mongoose Schemas
            ├── User.js
            ├── UserSettings.js
            ├── Contact.js
            ├── Conversation.js
            └── Message.js
```

## Database Schema

![Database Schema](docs/DatabaseSchema.png)
