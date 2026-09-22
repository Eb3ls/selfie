# Selfie Calendar

Selfie Calendar is a full-stack productivity application built as a University of Bologna group project for the 2023/2024 academic year. It is maintained here as an academic portfolio project.

It combines a personal calendar with projects, shared notes, Pomodoro sessions, chat, invitations, and notifications.

![Selfie Calendar showing sample events](docs/calendar.png)

*Calendar view from a local production build, using synthetic demo data. The application interface is in Italian.*

## What it does

- **Calendar** — daily, weekly, and monthly views for events, tasks, and Pomodoro sessions.
- **Projects** — projects with phases, linked activities, deadline tracking, and a Gantt view.
- **Notes** — rich-text notes with sharing and permission controls.
- **Chat** — private and group conversations. The client refreshes chat data through SWR every five seconds.
- **Pomodoro** — timer sessions with optional background music.
- **Notifications** — browser push notifications using VAPID and email notifications through Nodemailer.
- **Calendar export** — download an ICS snapshot of your calendar while signed in.
- **Accounts** — custom JWT-based sessions, invitations, and email-verification registration.

## Architecture

The application uses the Next.js App Router for both pages and API routes. React client pages render the calendar, project, note, chat, Pomodoro, and settings interfaces; SWR fetches and refreshes client-side data where needed. Route handlers under `app/api` implement the application’s server-side operations, while shared data models and database helpers live in `utils`. The `proxy.ts` entry point manages route-level session checks.

## Stack

Next.js 16 · TypeScript · React 19 · MongoDB · React-Bootstrap · JOSE · SWR · Nodemailer · web-push · DOMPurify

## Run locally

### Requirements

- Node.js **22** (see `.nvmrc`); the `engines` field requires Node.js 22 or newer.
- A MongoDB instance.
- A Gmail account with an App Password for email verification during signup.
- VAPID keys for browser push notifications.

Install the exact locked dependency tree and create the local environment file:

```bash
npm ci
cp .env.example .env.local
```

Populate every placeholder in `.env.local` before starting the application:

```dotenv
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/Selfie
SECRET_KEY=replace_with_a_random_secret_of_at_least_32_characters
GMAIL_EMAIL=your_email@gmail.com
GMAIL_PASSWORD=your_gmail_app_password
NEXT_PUBLIC_VAPID_PUBLIC_KEY=replace_with_generated_public_key
NEXT_PUBLIC_VAPID_PRIVATE_KEY=replace_with_generated_private_key
```

The database helper always selects the MongoDB database named `Selfie` (capital `S`), regardless of the database name in `MONGODB_URI`.

Generate the VAPID key pair and copy the printed values into `.env.local` before starting the server:

```bash
node generate_vapid_keys.js
```

Start the development server:

```bash
npm run dev
```

For a production build and local production server:

```bash
npm run build
npm start
```

## Validation commands

Run the following checks after installation:

```bash
npm test
npm run lint
npm run typecheck
npm run build
npm audit
```

The regression tests run the actual handlers, validation, and database wrappers with an in-memory database fixture, and check notification worker URLs. They require no database connection or credentials. The production build requires the environment configured above and network access to download the configured Google font.

## Known limitations

- Passwords use SHA-256; a production system should use a password-hashing scheme designed for credentials, such as Argon2id or bcrypt.
- The JWT session payload includes the password hash, which is unnecessary and should be removed in a production design.
- The demo/testing `/api/timeMachine` endpoint is unauthenticated and can change the shared simulated time.
- The academic project has focused regression coverage but no comprehensive end-to-end test suite.

## Authors

Leonardo Berselli, Daniele Ardito, Francesco Tomba — Bachelor's in Computer Science, University of Bologna (2024)
