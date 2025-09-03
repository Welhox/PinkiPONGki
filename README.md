# PinkiPONGki  

![Homepage](https://github.com/user-attachments/assets/7c0e21ab-4517-4db3-892f-a6c08ab1acc7)  

**PinkiPONGki** is a **full-stack web app** inspired by the iconic game of PONG.  
Built with **React (Vite + TypeScript)** on the frontend, **Fastify + Prisma/SQLite** on the backend, and **Docker + Nginx** for deployment.  

This was a **collaborative project**, but here I highlight my **personal contributions** — mainly backend systems, tournament/game logic, DevOps automation, and accessibility features.  

---

## Table of Contents  

1. [What Is PinkiPONGki?](#what-is-pinkipongki)  
2. [My Contributions](#my-contributions)  
3. [Visuals & Demos](#visuals--demos)  
4. [Core Features](#core-features)  
5. [Component Deep-Dive](#component-deep-dive)  
6. [Data Flow](#data-flow)  
7. [Contributors](#contributors)  
8. [License](#license)  

---

## What Is PinkiPONGki?  

PinkiPONGki is a **full-stack ping-pong web application** that showcases:  

- **Single matches** for guests or authenticated users  
- **Tournament brackets** with customizable rounds  
- **Single-player vs AI** with adjustable difficulty  
- **Match customization** (arenas, speeds, power-ups)  
- **Multi-language support** (EN, SV, FI)  
- **Screen-reader accessibility**  
- **Multi-factor authentication** with OTP  

It’s designed as a **production-style learning project** you can explore, extend, or deploy.  

---

## My Contributions  

While this was a team project, my main work focused on:  

- 🛠 **Backend development**:  
  - Main responsibility for designing and implementing backend APIs and Prisma schemas  
  - Connected backend APIs with the frontend (auth flows, game logic, tournaments, stats)  
  - JWT authentication with secure cookie handling  
  - MFA/OTP support with bcrypt hashing  
  - Rate limiting and security hardening of endpoints  

- 🎮 **Game logic**:  
  - Tournament system (bracket generation, creation, and progression)  

- ⚡ **DevOps / Infrastructure**:  
  - Docker Compose orchestration  
  - Nginx reverse proxy setup  
  - Makefile automation (SSL generation, JWT secret creation, stack management)  

👉 [My commits](https://github.com/Welhox/PinkiPONGki/commits?author=Welhox)  

---

## Visuals & Demos  

<details>
  <summary>▶️ Homepage</summary>
  
  ![Homepage](https://github.com/user-attachments/assets/7c0e21ab-4517-4db3-892f-a6c08ab1acc7)
</details>

<details>
  <summary>▶️ Pong Game</summary>
  
  ![Pong Game](https://github.com/user-attachments/assets/6a405ab4-fe1f-4d0a-bf50-4b238300687d)
</details>

<details>
  <summary>▶️ Settings</summary>
  
  ![Settings](https://github.com/user-attachments/assets/a8180969-6ee9-4b3b-ab18-937c8b92eb1c)
</details>

<details>
  <summary>▶️ OTP</summary>
  
  ![OTP](https://github.com/user-attachments/assets/c61e4be8-2149-4174-a3b1-17788550962f)
</details>

<details>
  <summary>▶️ Stats</summary>
  
  ![Stats](https://github.com/user-attachments/assets/699144a9-1478-4d3f-9559-546c371c4eb5)
</details>

<details>
  <summary>▶️ Pong Pals</summary>
  
  ![Pong Pals](https://github.com/user-attachments/assets/45608c0f-ab1e-4517-aa29-8433619c061e)
</details>

---

## Core Features  

- **Single Matches** (guest or logged-in)  
- **Tournament Mode** with bracket generation  
- **Single-Player vs AI** with difficulty levels  
- **Match Customization**: arenas/levels, ball speed, power-ups  
- **User Registration & Login** (JWT + secure cookies)  
- **Multi-Factor Authentication** via OTP  
- **Multi-Language Interface** (English, Swedish, Finnish)  
- **Full Screen-Reader Accessibility**  
- **File Upload** & image processing (e.g., avatars)  
- **Seed Script** (`run_extended_seed.sh`) for demo data  
- **Environment-driven Config** via provided `.env.example` files  

---

## Component Deep-Dive  

### Backend (Fastify + Prisma/SQLite)  

- **Fastify** for high-performance HTTP endpoints  
- **Prisma ORM** with SQLite for zero-config persistence  
- **User management**: registration, login, profiles, secure JWT auth + MFA via OTP  
- **Game logic**:  
  - Single matches & scorekeeping  
  - Tournament bracket generation and progression  
  - AI opponent routines with adjustable difficulty  
- **Notifications** via `nodemailer` (configure SMTP in `backend/.env`)  

### Frontend (React + Vite + TypeScript)  

- **Vite** for lightning-fast dev reloads  
- **React** + **TypeScript** for a strongly-typed SPA  
- **Tailwind CSS** & Forms plugin for UI  
- **i18next** for localization (EN, SV, FI)  
- **Accessibility**: ARIA roles, keyboard navigation, screen-reader support  
- **Game UI**:  
  - Match setup screen (mode, arena, speed, power-ups)  
  - Tournament bracket view  
  - Single-player vs AI arena  

### Nginx & SSL  

- **Reverse HTTPS Proxy**  
  - Terminates SSL (self-signed by default via `make ssl`)  
  - Serves built React assets  
  - Proxies API requests (`/api/...`) to Fastify  

### Docker Compose Orchestration  

- **Services**: `frontend`, `backend` (embedded SQLite)  
- **Makefile** helpers:  
  - `make ssl` → generate self-signed cert  
  - `make jwt-secret` → add `JWT_SECRET` to `backend/.env`  
  - `make up` / `make down` → control the stack  

---

## Data Flow  

1. **Browser** → **Nginx** (HTTPS)  
2. **Nginx** serves React shell or proxies to Fastify API  
3. **React** uses **axios** to call REST endpoints only  
4. **Fastify** authenticates (incl. MFA), processes game actions, updates Prisma  
5. **Prisma** persists users, matches, tournaments, stats in SQLite  

---

## Contributors  

This project was built as part of the **42 core curriculum** with:  

- **Casimir Lundberg** ([Welhox](https://github.com/Welhox))  
- **Emmi Järvinen** ([ejarvinen](https://github.com/ejarvinen))  
- **Ryan Boudwin** ([KrolPolski](https://github.com/KrolPolski))  
- **Sahra Taskinen** ([staskine](https://github.com/staskine))  
- **Armin Kuburas** ([ArminKuburas](https://github.com/ArminKuburas))  

---

## License  

Released under the **MIT License**. See [LICENSE](LICENSE) for details.  
