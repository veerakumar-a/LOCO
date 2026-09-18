# LOCO — Local Community Marketplace & Skill Sharing

<p align="center">
  <img src="https://img.shields.io/badge/LOCO-Local%20Community%20Marketplace-2563eb?style=for-the-badge&logo=github" alt="LOCO logo" width="900" />
</p>

<p align="center">
  <img alt="HTML5" src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" />
  <img alt="CSS3" src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" />
  <img alt="JavaScript" src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" />
  <img alt="GitHub Pages" src="https://img.shields.io/badge/Hosting-GitHub%20Pages-121212?style=for-the-badge&logo=githubpages&logoColor=white" />
  <img alt="Status" src="https://img.shields.io/badge/Status-Production%20Prototype-4CAF50?style=for-the-badge" />
  <img alt="License" src="https://img.shields.io/badge/License-Open%20Demo-FF9800?style=for-the-badge" />
</p>

## Overview

LOCO is a local-first community marketplace built for sharing, discovery, and trust within a neighborhood. The platform connects residents to buy and sell items, hire local services, exchange skills, discover events, and message directly through a lightweight browser-based experience.

This project is designed to feel like a modern startup product while staying fully frontend-native: no backend, no frameworks, and no complex deployment pipeline—just HTML5, CSS3, and Vanilla JavaScript, persisted through browser `localStorage`.

## Core Idea

The product is built around one essential belief: community commerce should be simple, human, and local. LOCO helps people turn everyday neighborhoods into vibrant, useful ecosystems by enabling:

- local buying and selling
- trusted skill exchange
- service discovery
- event participation
- direct peer-to-peer communication

## Key Features

### Marketplace
- browse and filter listings by category, price, and popularity
- create and edit product listings from a dedicated form
- upload listing images and store them as Base64 data URLs in `localStorage`
- save favorites and explore item details without a backend

### Skill Sharing
- offer or request help in fields like programming, design, music, tutoring, and more
- connect with community members directly from skill cards
- make local talent discoverable and accessible

### Events & Community Discovery
- participate in local meetups and neighborhood events
- track attendance and event capacity in a lightweight dashboard experience
- keep community engagement low-friction and highly visual

### Dashboard & User Experience
- dedicated dashboard for user activity and personal updates
- quick profile editing with live local persistence
- light/dark mode interface with glassmorphism-inspired styling
- mobile-first layout and responsive multi-page navigation

### Authentication Demo
- login and registration flow for front-end-only environment
- protected page routing for authenticated-only sections
- demo session management using `localStorage`

## Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript
- Browser `localStorage` for persistence
- GitHub Pages for deployment

## Design Theme

LOCO follows a polished startup aesthetic with:

- soft glassmorphism panels
- modern gradient surfaces
- responsive mobile-first layout
- light and dark mode support
- compact, app-like navigation patterns

This gives the product a premium product feel without sacrificing simplicity or static hosting compatibility.

## Live Demo

Coming soon on GitHub Pages:

https://veerakumar-a.github.io/LOCO/

## Run Locally

Because the app is built with static HTML, CSS, and JavaScript, you do not need a server to run it.

### Option 1: Open directly in a browser
1. Navigate to the project folder.
2. Open `index.html` in your browser.
3. The app will load and use your browser's `localStorage` automatically.

### Option 2: Use a tiny local server (optional)
If you prefer a local server for a more production-like experience:

```bash
cd path/to/LOCO
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Project Structure

```text
LOCO/
├── about.html
├── create-listing.html
├── dashboard.html
├── events.html
├── favorites.html
├── index.html
├── login.html
├── marketplace.html
├── messages.html
├── profile.html
├── register.html
├── services.html
├── skills.html
├── css/
│   └── style.css
├── js/
│   ├── app.js
│   ├── auth.js
│   ├── dashboard.js
│   ├── data.js
│   ├── marketplace.js
│   ├── messages.js
│   └── profile.js
├── assets/
│   └── README.md
├── .gitignore
├── README.md
└── LICENSE (optional, add if you decide to publish with an explicit license)
```

## Author

- Name: VEERAKUMAR A
- Role: Full-Stack Frontend Product Developer
- Project: LOCO — Local Community Marketplace & Skill Sharing

## Mission

LOCO is a frontend-first product concept aimed at creating stronger local communities through trust, convenience, and meaningful digital connection. It emphasizes real-world utility, clear UX, and product-quality presentation without the overhead of a heavyweight framework.

---

<p align="center">
  Built for local communities. Designed for everyday trust. Powered by LOCO.
</p>
