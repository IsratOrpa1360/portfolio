# Isratul Ibnat Orpa — Personal MVC Web Portfolio & Secure Admin Dashboard

A minimal, responsive, data-driven personal portfolio and server-authenticated admin dashboard for **Isratul Ibnat Orpa** (B.Sc. in Computer Science and Engineering, American International University-Bangladesh).

## 1. Project Structure

```text
my-portfolio/
├── index.html                  # Main semantic HTML view (9 ordered sections)
├── resume.pdf                  # Embedded & downloadable Resume PDF
├── .gitignore                  # Excludes .env, .env.*, node_modules/, and backups
├── .env.example                # Safe placeholder template for private secrets
├── package.json                # Node.js scripts (start, hash-password, test:security)
├── README.md                   # Complete setup, security, and deployment guide
├── css/
│   └── style.css               # Minimal Lavender/Plum Light Theme & Nocturnal Dark Theme
├── js/
│   ├── data.js                 # Centralized public portfolio data (NO secrets)
│   ├── script.js               # Public portfolio rendering, SVG icons & active nav observer
│   ├── three-scene.js          # Interactive 3D Thinking Girl ("tik-tik") & Hanging Lamp
│   ├── auth.js                 # Client session & login controller (/api/auth/*)
│   └── admin.js                # Authenticated Admin Dashboard CRUD & reordering UI
├── assets/
│   ├── images/
│   │   ├── profile.jpg         # Profile image (replace with your portrait)
│   │   ├── projects/           # Project thumbnails & screenshots
│   │   └── certificates/       # Certificate images
│   └── icons/
│       └── icons.svg           # SVG icon sprite sheet
└── server/
    ├── server.js               # Node.js HTTP & static server (blocks .env & /server)
    ├── config/
    │   └── env.js              # Loads .env & verifies password hashes in constant time
    ├── middleware/
    │   ├── authMiddleware.js   # Signed HttpOnly, SameSite=Strict session cookies
    │   ├── csrfMiddleware.js   # Constant-time X-CSRF-Token verification
    │   └── rateLimitMiddleware.js # Brute-force login rate limiter (5 attempts / 15 min)
    ├── routes/
    │   ├── authRoutes.js       # /api/auth/session, /api/auth/login, /api/auth/logout
    │   └── portfolioRoutes.js  # /api/portfolio (GET/PUT) & /api/upload (POST)
    ├── scripts/
    │   ├── hash-password.js    # Interactive CLI to generate ADMIN_PASSWORD_HASH
    │   └── test-security.js    # Automated security & functional verification suite
    └── backups/                # Automatic timestamped backups of js/data.js before saves
```

## 2. Quick Start (Running Locally)

1. **Create your private `.env` file** from the example template:
   ```bash
   cp .env.example .env
   ```
2. **Generate your password hash and session secret**:
   ```bash
   npm run hash-password
   ```
   Type your desired admin password when prompted. The script outputs two lines (`ADMIN_PASSWORD_HASH=...` and `SESSION_SECRET=...`). Paste both into your `.env` file.
3. **Start the server**:
   ```bash
   npm start
   ```
4. Open `http://localhost:3000` in your browser. To open the Admin login modal, click the discreet **Admin** link in the page footer (or navigate to `http://localhost:3000/#admin-login`).

## 3. How to Change Your Admin Password

1. Run `npm run hash-password` in your terminal and enter your new password.
2. Copy the newly generated `ADMIN_PASSWORD_HASH=...` value.
3. Update `ADMIN_PASSWORD_HASH` in your local `.env` file (or in your cloud hosting provider's Environment Variables dashboard in production).
4. Restart or redeploy the Node.js server.

## 4. Security & GitHub Best Practices

- **Never commit `.env`**: `.gitignore` is pre-configured with `.env` and `.env.*` (while allowing `!.env.example`).
- **What if a secret is accidentally committed to GitHub?**: Deleting the file in a later commit is **insufficient** because the secret remains in Git history. You must immediately **rotate** the exposed password and `SESSION_SECRET` (generate a new password hash and a new session secret) and update your production environment variables.
- **Static Hosting vs. Backend Hosting**: Static-only hosts (such as GitHub Pages) only serve static files (`index.html`, `js/data.js`) and cannot execute server-side password verification or write to `js/data.js`. To use the live Admin Dashboard with server-side authentication, deploy the Node.js app to a backend host (e.g., Render, Railway, Fly.io, or a VPS) and configure `ADMIN_PASSWORD_HASH` and `SESSION_SECRET` in the host's private Environment Variables panel.
