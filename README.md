# 🩺 Medora - AI Health Assistant

Medora is a modern, AI-powered health assessment platform that provides instant symptom analysis and personalized health insights. Built with a premium aesthetic and advanced AI integrations, it redefines healthcare with intelligence.

---

## ✨ Features

- **🤖 AI Symptom Analysis**: Uses Google Gemini and Groq SDKs for intelligent, conversation-based health assessments.
- **🧬 Immersive UI**: DNA & particle animations powered by **Three.js** and smooth **GSAP** transitions.
- **🔐 Secure Authentication**: Multi-layered security with JWT, Bcrypt, and Google OAuth2.0 integration.
- **📊 Health Dashboard**: Personalized user dashboard to track assessments and health profile.
- **📰 Premium Health Blogs**: Interactive health news marquee and dynamic blog system with glassmorphism design.
- **🌓 Adaptive UI**: Sleek dark mode by default with interactive 3D tilt effects and Tailwind CSS styling.
- **📄 Professional Reports**: Generates detailed health assessment reports in PDF format (custom branded).

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Tailwind CSS
- **Structure**: Semantic HTML5
- **Styling**: Custom Design System (Glassmorphism, Vibrant Glows)
- **Visuals**: [Three.js](https://threejs.org/) (DNA Animation)
- **Animations**: [GSAP](https://greensock.com/gsap/) (GreenSock Animation Platform)

### Backend
- **Environment**: Node.js
- **Framework**: Express.js (v5.x)
- **Database**: MongoDB with Mongoose ODM
- **Security**: Passport.js, JWT, Cookie-parser
- **AI Engines**: 
  - Google Generative AI (Gemini)
  - Groq Cloud SDK

---

## 🚀 Getting Started

### Prerequisites
- Node.js installed
- MongoDB Atlas account (or local MongoDB)
- API Keys for Google Gemini and Groq

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/anushkaa2205/symptom-checker
   cd medora
   ```

2. **Backend Setup**:
   ```bash
   cd backend
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the `backend` directory and add the following:
   ```env
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GEMINI_API_KEY=your_gemini_api_key
   GROQ_API_KEY=your_groq_api_key
   ```

4. **Run the Application**:
   ```bash
   # From the backend directory
   npm run dev
   ```
   The server will start on `http://localhost:3000`.

---

## 📂 Project Structure

```
medora/
├── backend/            # Express server, API routes, and AI logic
│   ├── config/         # Database and Passport configuration
│   ├── controllers/    # Request handlers
│   ├── middleware/     # Auth and validation middleware
│   ├── models/         # Mongoose schemas
│   ├── routes/         # API endpoints
│   └── server.js       # Entry point
├── frontend/           # Client-side files
│   ├── assets/         # Images and icons
│   ├── css/            # Custom stylesheets
│   ├── js/             # Frontend logic (GSAP, UI interactions)
│   └── pages/          # HTML templates
└── package.json        # Project dependencies
```

---

## 🛡️ License

Distributed under the ISC License.

---

## 👨‍💻 Developed by
*Anushka, Harshita, and Hasini* (Built for Advanced Agentic Coding)
