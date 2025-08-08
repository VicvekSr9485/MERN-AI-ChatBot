# MERN AI CHAT ASSISTANT

A full-stack AI-powered chatbot application built with the **MERN stack** (MongoDB, Express, React, Node.js) and integrated with **Google's Gemini API** for intelligent conversations.

---

## Features

- User authentication (signup/login)
- AI-powered chatbot using Google's Gemini API
- Responsive design for mobile and desktop
- Typing animation for AI responses
- JWT-based authentication
- Protected routes for authenticated users
- Modern UI with Material-UI components

---

## Tech Stack

### Frontend
- React
- Material-UI
- React Router
- Axios
- React Hot Toast

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT (JSON Web Tokens)
- Google Gemini API

---

## Project Structure

```

MERN-AI-ChatBot/
├── frontend/                 # React frontend
│   ├── public/              # Static files
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   │   ├── footer/      # Footer component
│   │   │   ├── shared/      # Shared components (inputs, etc.)
│   │   │   └── typer/       # Typing animation component
│   │   ├── context/         # React context (AuthContext)
│   │   ├── pages/           # Page components (Home, Login, Signup, Chat)
│   │   ├── App.js           # Main App component
│   │   └── index.js         # Entry point
│   └── package.json
├── backend/src               # Node.js/Express backend
│   ├── config/              # Configuration files
│   ├── controllers/         # Route controllers
│   ├── middleware/          # Custom middleware (auth, etc.)
│   ├── models/              # MongoDB models (User, etc.)
│   ├── routes/              # API routes     
│   ├── app.ts               # app components
│   ├── index.ts            # Server entry point
│   └── package.json
└── README.md

````

---

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB installed and running
- Google Gemini API key ([Sign up here](https://makersuite.google.com/app/apikey))

### Steps

1. **Clone the repository**
```bash
git clone https://github.com/VicvekSr9485/MERN-AI-ASSISTANT.git
cd MERN-AI-ASSISTANT
````

2. **Install dependencies**

```bash
# backend
cd backend
npm install

# Client
cd frontend
npm install
```

3. **Setup environment variables**
   Create a `.env` file in the `backend` directory:

```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
COOKIE_SECRET=your_cookie_secret
COOKIE_DOMAIN=your_cookie_domain
```

4. **Run the application**

```bash
# Start server
cd backend
npm start
npm run dev

# Start client
cd frontend
npm run dev
```

5. **Access the app** at:
   [http://localhost:5173](http://localhost:5173)

---

## Key Components

### Client-Side

* **Home Page (`Home.tsx`)**

  * Landing page with typing animation, images, and preview of the chat interface
  * Buttons for signup/login
  * Fully responsive

* **Authentication Pages (`Login.tsx`, `Signup.tsx`)**

  * Forms with validation & error handling
  * Navigation between login/signup
  * Button to return to home page

* **Chat Interface**

  * Real-time AI conversation
  * Typing indicator
  * Responsive design

* **Context Providers**

  * `AuthContext` for managing authentication
  * Handles login, signup, logout
  * Manages JWT token storage

### Server-Side

* **Authentication**

  * Signup/Login with JWT tokens
  * Password hashing using bcrypt
  * Protected route middleware

* **API Endpoints**

  * `/api/auth/signup` – Register user
  * `/api/auth/login` – Authenticate user
  * `/api/chat` – Send/receive AI chat messages

* **Gemini API Integration**

  * Handles AI communication
  * Processes messages & returns responses
  * Handles API errors gracefully

---

## API Reference

### Auth

#### POST `/api/auth/signup`

Registers a new user
**Body:**

```json
{ "name": "John", "email": "john@example.com", "password": "Password123!" }
```

#### POST `/api/auth/login`

Logs in an existing user
**Body:**

```json
{ "email": "john@example.com", "password": "Password123!" }
```

### Chat

#### POST `/api/chat`

Sends message to AI and gets response
**Headers:**
`Authorization: Bearer <JWT_TOKEN>`
**Body:**

```json
{ "message": "Hello AI" }
```

---

## Usage Flow

1. **Home Page** – User chooses to signup/login
2. **Auth** – User creates account or logs in
3. **Chat Interface** – User interacts with AI chatbot
4. **Session Management** – Stay logged in until logout or token expiry

---

## Security

* Password hashing (bcrypt)
* JWT token authentication
* Protected routes
* Input validation
* Secure CORS setup

---

## Future Enhancements

* User profile management
* Persistent chat history
* Multiple AI model support
* Voice-to-text
* Dark/light theme
* File uploads

---

## Contributing

1. Fork the repo
2. Create a feature branch
3. Make changes
4. Add tests if needed
5. Submit a pull request

---

## Support

For issues/questions, please open a GitHub issue.
