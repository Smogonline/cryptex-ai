# ⬡ CRYPTEX AI — Deployment Guide

A professional crypto trading analysis app with real-time AI signals, live charts, price alerts, and mobile support.

---

## 🚀 OPTION 1: Deploy to Vercel (FREE — Recommended, 5 minutes)

### Step 1 — Create a GitHub account (if you don't have one)
→ https://github.com/signup

### Step 2 — Create a new GitHub repository
1. Go to https://github.com/new
2. Name it `cryptex-ai`
3. Click "Create repository"

### Step 3 — Upload the code
On the new repo page, click "uploading an existing file" and drag in these folders:
```
cryptex-ai/
├── public/
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── index.js
│   └── App.js
└── package.json
```

### Step 4 — Deploy on Vercel
1. Go to https://vercel.com and sign in with GitHub
2. Click "Add New Project"
3. Select your `cryptex-ai` repo
4. Framework: **Create React App** (auto-detected)
5. Click **Deploy**

✅ In ~2 minutes you'll get a live URL like:
**https://cryptex-ai.vercel.app**

---

## 🚀 OPTION 2: Deploy to Netlify (FREE — Also easy)

### Step 1 — Build the app locally
```bash
cd cryptex-ai
npm install
npm run build
```

### Step 2 — Deploy
1. Go to https://netlify.com
2. Drag and drop the `build/` folder onto the Netlify dashboard
3. Done! You get a URL like: **https://cryptex-ai.netlify.app**

---

## 📱 TURN IT INTO A MOBILE APP (Add to Home Screen)

The app is a **PWA (Progressive Web App)** — it works like a native app when added to your phone's home screen.

### On iPhone (Safari):
1. Open your Vercel URL in Safari
2. Tap the **Share** button (box with arrow)
3. Tap **"Add to Home Screen"**
4. Tap **Add**
→ It appears as a full-screen app with no browser bars!

### On Android (Chrome):
1. Open your Vercel URL in Chrome
2. Tap the **three-dot menu**
3. Tap **"Add to Home Screen"** or **"Install App"**
4. Tap **Add**
→ Launches full screen like a native app!

---

## 🔧 LOCAL DEVELOPMENT

```bash
# Install dependencies
npm install

# Run locally
npm start
# → Opens at http://localhost:3000

# Build for production
npm run build
```

---

## 📋 FEATURES

| Feature | Description |
|---------|-------------|
| 📊 Dashboard | Live global market cap, sentiment, Top 5 Bullish coins |
| 📈 Analysis | Advanced price charts (1D–1Y), market stats |
| 🔍 Markets | Full top-50 table with sparklines |
| ⚡ AI Signals | Claude AI analyzes real price data → buy/sell signals, RSI, targets |
| 🔔 Alerts | Set custom price alerts, checked every 60 seconds |
| 📱 Mobile | Bottom nav, touch-optimized, installable as PWA |

---

## ⚠️ DISCLAIMER
CRYPTEX AI is for informational purposes only. AI signals are analytical
estimates, not financial advice. Crypto trading carries significant risk.
Always do your own research. Past performance does not guarantee future results.
