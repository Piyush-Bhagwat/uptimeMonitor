# Uptime Monitor

A full-stack uptime monitoring platform that continuously monitors websites and APIs, records check history, tracks incidents, calculates performance analytics, and generates AI-powered explanations of monitoring data.

Built as a backend-focused project to explore asynchronous job processing, Redis/BullMQ, monitoring systems, incident tracking, analytics, and AI integration.

---

## ✨ Features

- 🔐 User authentication with JWT
- 🌐 Add and manage website/API monitors
- ⏱️ Configurable monitoring intervals
- 🔄 Automated background monitoring
- ⚡ Asynchronous job processing with BullMQ
- 🧠 Redis-backed job queue using Upstash Redis
- 🔁 Automatic retries for failed checks
- 📊 Uptime and latency analytics
- 📈 Check history
- 🚨 Automatic incident creation
- ✅ Automatic incident resolution
- ⏳ Incident duration tracking
- 📡 HTTP status/error distribution
- 🤖 AI-generated monitoring explanations using Google Gemini
- 💾 Persistent check and incident data
- 🐳 Dockerized backend and worker
- ☁️ Deployed frontend and backend

---

# 🏗️ Architecture

```mermaid
flowchart TD

    User["User / Browser"]

    Frontend["Next.js Frontend<br/>Vercel"]

    API["Node.js + Express API<br/>Render"]

    Worker["BullMQ Worker<br/>Render"]

    Queue["Upstash Redis"]

    DB[("MongoDB Atlas")]

    Gemini["Google Gemini API"]

    User --> Frontend
    Frontend --> API

    API --> DB
    API --> Queue

    Queue --> Worker

    Worker --> DB
    Worker --> External["Monitored Websites / APIs"]

    API --> Gemini
