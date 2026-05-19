# Selfie Calendar

A full-stack productivity web app built with Next.js 14, TypeScript, and MongoDB. Developed as a university group project at the University of Bologna (A.Y. 2023/2024).

## Features

- **Calendar** — daily, weekly, and monthly views with events, tasks, and Pomodoro sessions
- **Projects** — Gantt chart, phases, linked tasks, and deadline tracking
- **Notes** — rich text notepad with granular sharing and permissions
- **Real-time chat** — private and group messaging
- **Pomodoro timer** — session tracking with optional background music
- **Notifications** — push notifications (web-push/VAPID) and email alerts (Nodemailer)
- **iCal export** — subscribe to your calendar from any calendar app
- **Authentication** — custom JWT-based auth with user invitations

## Tech stack

Next.js 14 · TypeScript · MongoDB · React-Bootstrap · JOSE · Nodemailer · web-push · SWR · DOMPurify

## Getting started

**Prerequisites:** Node.js 18+, a MongoDB instance (e.g. MongoDB Atlas), a Gmail account with App Password enabled.

```bash
npm install
cp .env.example .env.local
# fill in .env.local with your credentials
npm run dev
```

To generate VAPID keys for push notifications:

```bash
node generate_vapid_keys.js
```

## Known limitations

This was an academic project — a few things would be done differently in production:

- Passwords are hashed with SHA-256; **bcrypt or argon2** would be the correct choice
- The JWT session payload includes the password hash unnecessarily
- No automated test suite
- The `/api/timeMachine` endpoint (used for demo/testing) is unauthenticated

## Authors

Leonardo Berselli, Daniele Ardito, Francesco Tomba — Bachelor's in Computer Science, University of Bologna (2024)
