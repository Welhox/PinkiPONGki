# Transcendence

A **starter template** for building full-stack **ping-pong** web applications with:

- **Fastify** + **Prisma/SQLite** on the backend  
- **React** (via **Vite**) + **TypeScript** on the frontend  
- **Nginx** as a reverse HTTPS proxy  
- **Docker Compose** orchestration  

> **Note:** full installation involves sensitive env vars (mailing creds, etc.), so see the provided `.env.example` files for details.

---

## Table of Contents

1. [What Is Transcendence?](#what-is-transcendence)  
2. [Component Deep-Dive](#component-deep-dive)  
3. [Data Flow](#data-flow)  
4. [Core Features](#core-features)  
5. [Extending & Customizing](#extending--customizing)  
6. [Visuals & Demos](#visuals--demos)  
7. [Getting Started (Light)](#getting-started-light)  
8. [Contributors](#contributors)  
9. [License](#license)  

---

## What Is Transcendence?

Transcendence is a **full-stack ping-pong** web application template showcasing:

- **Single matches** (head-to-head) for guests or authenticated users  
- **Tournament brackets** with customizable rounds  
- **Single-player vs AI** opponent with adjustable difficulty  
- **Match customization**—multiple arenas/levels, variable ball speed, power-ups  
- **Multi-language support** (English, Swedish, Finnish)  
- **Full screen-reader accessibility**  
- **Multi-factor authentication (MFA)** via one-time passwords (OTP)  

It’s designed as a learning-friendly, production-style codebase you can explore, modify, or extend.

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

## Extending & Customizing

- Swap **SQLite** for Postgres (update `DATABASE_URL`)  
- Plug in real SMTP creds via `backend/.env`  
- Add Fastify plugins (caching, metrics, GraphQL)  
- Extend the UI: new Tailwind components, additional languages, themes  

---

## Visuals & Demos

> Embed your GIFs, screenshots, or architecture diagrams here.

---

## Getting Started (Light)

```bash
git clone https://github.com/Welhox/Transcendence.git
cd Transcendence

# Copy env files from examples
cp .env.example .env
cp backend/.env.example backend/.env

# Generate SSL cert & JWT secret
make ssl
make jwt-secret

# (Optional) spin up with Docker
make up

> You’ll need to supply mailing/SMS/third-party credentials before using notification features.

---

## Contributors

- **Casimir Lundberg** ([Welhox](https://github.com/Welhox))  
- **Emmi Järvinen** ([ejarvinen](https://github.com/ejarvinen))  
- **Ryan Boudwin** ([KrolPolski](https://github.com/KrolPolski))  
- **Sahra Taskinen** ([staskine](https://github.com/staskine))  
- **Armin Kuburas** ([ArminKuburas](https://github.com/ArminKuburas))  

---

## License

Released under the **MIT License**. See [LICENSE](LICENSE) for details.
