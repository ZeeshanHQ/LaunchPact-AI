# LaunchPact AI - Intelligent Venture Architect

![PromptNovaX](https://img.shields.io/badge/Status-Active-success)
![License](https://img.shields.io/badge/License-MIT-blue)

LaunchPact AI is an intelligent AI co-founder platform that transforms raw startup ideas into fully execution-ready blueprints. Built with cutting-edge AI technology, LaunchPact AI acts as your strategic partner in venture creation.

## 🌟 Features

- **🔥 The Forge**: AI-powered blueprint generation with market research
- **✅ Reality Check Engine**: Viability scoring and market saturation analysis
- **🧭 Guided Builder**: Step-by-step wizard with decision locking
- **💬 Co-Founder Chat**: Context-aware AI assistant
- **⏱️ Timeline Simulator**: Feasibility analysis for launch timelines
- **📊 Dashboard**: Gamification with XP, streaks, and achievements
- **📋 Execution Planner**: MVP checklist generation

## 🏗️ Architecture

**Client-Server Architecture** for stability and security:

- **Frontend**: React + Vite + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express Server
- **AI Engine**: OpenRouter API with multiple free models
  - Primary: Meta Llama 3.2 3B Instruct (Free)
  - Fallback 1: Google Gemini Flash 1.5
  - Fallback 2: Qwen 2 7B Instruct (Free)
  - Fallback 3: Mistral 7B Instruct (Free)

To avoid CORS issues, quota limits, and ensure reliability:
1. Frontend calls `http://localhost:3000/api/...`
2. Backend receives request, adds API Key from `.env.local`
3. Backend tries primary model, falls back to alternatives if needed
4. Backend calls OpenRouter API
5. Backend cleans/repairs JSON response
6. Backend sends clean data to Frontend

**Intelligent Fallback**: If one model hits quota or fails, automatically switches to the next available free model.

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)
- OpenRouter API Key (Free tier available at [openrouter.ai](https://openrouter.ai))

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd promptnovax
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add your OpenRouter API key:
   ```
   OPENROUTER_API_KEY=your_actual_api_key_here
   ```
   
   **Note**: The OpenRouter key is already included in the project for demo purposes. You can get your own free key at [openrouter.ai](https://openrouter.ai).

4. **Run the application**
   ```bash
   npm run dev:full
   ```
   
   This command runs both the backend server (port 3000) and frontend dev server (port 5173) concurrently.

5. **Open your browser**
   ```
   http://localhost:5173
   ```

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite frontend dev server only (port 5173) |
| `npm run server` | Start Express backend server only (port 3000) |
| `npm run dev:full` | **Run both servers concurrently** ⭐ |
| `npm run build` | Build production bundle |
| `npm run preview` | Preview production build |

## 🎨 Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Recharts** - Analytics charts

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **OpenRouter API** - AI engine with multiple free models
- **dotenv** - Environment variables
- **CORS** - Cross-origin support

### Design
- **Plus Jakarta Sans** - Typography
- **Glassmorphism** - UI aesthetic
- **Gradient animations** - Visual polish

## 📁 Project Structure

```
launchpact-ai/
├── components/           # React components
│   ├── Hero.tsx         # Landing page hero section
│   ├── BlueprintView.tsx # Blueprint display
│   ├── Dashboard.tsx    # User dashboard
│   ├── GuidedBuilder.tsx # Step-by-step wizard
│   ├── ForgeAssistant.tsx # AI chat widget
│   ├── Navbar.tsx       # Navigation
│   └── FooterPages.tsx  # Footer page components
├── services/            # API service layer
│   └── geminiService.ts # Frontend API calls
├── App.tsx              # Main app component
├── types.ts             # TypeScript interfaces
├── server.js            # Express backend server
├── index.tsx            # React entry point
├── index.html           # HTML template
├── index.css            # Global styles
├── tailwind.config.js   # Tailwind configuration
├── postcss.config.js    # PostCSS configuration
├── vite.config.ts       # Vite configuration
├── tsconfig.json        # TypeScript configuration
├── package.json         # Dependencies
├── .env.local           # Environment variables (gitignored)
└── .env.example         # Environment template
```

## 🔌 API Endpoints

All endpoints are prefixed with `/api`:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/status` | GET | Health check |
| `/api/enhance-prompt` | POST | Enhance raw user input |
| `/api/generate-blueprint` | POST | Generate full product blueprint |
| `/api/execution-plan` | POST | Generate MVP execution checklist |
| `/api/simulate-timeline` | POST | Analyze launch timeline feasibility |
| `/api/guided-step` | POST | Get co-founder guidance for specific step |
| `/api/chat` | POST | Chat with AI assistant |

## 🎯 Core Workflow

1. **User enters raw idea** → Hero section
2. **AI enhances prompt** → Lightweight AI call
3. **Research phase** → Google Search Grounding (optional)
4. **Blueprint generation** → Massive JSON with strict schema
5. **Reality check** → Viability score (0-100)
6. **User reviews blueprint** → BlueprintView component
7. **Save to dashboard** → LocalStorage persistence
8. **Guided builder** → Step-by-step wizard with decision locking
9. **Co-founder chat** → Context-aware assistance

## 🛠️ Troubleshooting

### Backend won't start

**Error**: `OPENROUTER_API_KEY is missing`
- **Solution**: The API key is already included in the code. If you want to use your own, add it to `.env.local`

### All models failing

**Error**: All models failed
- **Solution**: Check your internet connection. The system tries 4 different free models automatically.
- If all fail, wait a few seconds and try again.

### Frontend can't connect to backend

**Error**: `ERR_CONNECTION_REFUSED`
- **Solution**: Make sure backend is running on port 3000
- Run: `npm run server` in a separate terminal

### Tailwind styles not working

**Error**: Styles not applying
- **Solution**: Ensure `index.css` is imported and Tailwind config exists
- Run: `npm run dev` to rebuild

### CORS errors

**Error**: CORS policy blocking requests
- **Solution**: This shouldn't happen with our architecture. Backend has CORS enabled.
- Check that frontend is calling `/api/...` not `http://localhost:3000/api/...`

### Quota Exceeded (Rare)

**Error**: Rate limit exceeded
- **Solution**: The system automatically switches between 4 free models. If all are exhausted, wait 30 seconds and try again.

## 🎮 Gamification System

- **XP System**: Earn XP for creating projects, completing tasks
- **Login Streaks**: Daily login tracking
- **Achievements**: 
  - 🌟 First Spark (First project)
  - 🔥 Streak Master (3-day streak)
  - 🏗️ Builder (5 projects)
  - And more...

## 🔐 Security Notes

- ✅ API key is **NEVER** exposed to browser
- ✅ All AI calls go through backend
- ✅ Environment variables in `.env.local` (gitignored)
- ✅ CORS properly configured

## 📝 License

MIT License - feel free to use this project for your own ventures!

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues or questions, please open an issue on GitHub.

---

**Built with ❤️ using Google Gemini AI**
