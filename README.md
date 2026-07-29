# Cost Tech AI — Telegram Cost Estimation & Quantity Surveying Bot

AI-powered quantity surveying and cost estimation assistant on Telegram, built on Node.js + Google Gemini.

## Features
- Conversational clarification (location, size, finish level, scope)
- Preliminary cost estimates with elemental breakdown
- Covers: building works, landscaping, electrical, HVAC/mechanical, plumbing
- Per-chat conversation memory (in-memory, resets on `/reset` or restart)

## Project structure
```
cost-tech-ai-bot/
├── src/
│   ├── bot.js        # Telegram <-> Gemini glue + health server
│   ├── gemini.js      # Gemini API connector + chat history
│   ├── estimator.js    # Math/formatting helpers (contingency, currency, chunking)
│   └── prompts.js      # QS system prompt + bot copy
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## 1. Local setup

```bash
git clone <your-repo-url>
cd cost-tech-ai-bot
npm install
cp .env.example .env
```

Fill in `.env`:
- `TELEGRAM_BOT_TOKEN` — from [@BotFather](https://t.me/BotFather) on Telegram
- `GEMINI_API_KEY` — from [Google AI Studio](https://aistudio.google.com/app/apikey)
GROQ_API_KEY = your Groq key
Run it:
```bash
npm start
```

Message your bot on Telegram — it should reply.

## 2. Push to GitHub

```bash
git init
git add .
git commit -m "Initial Cost Tech AI bot"
git branch -M main
git remote add origin https://github.com/<your-username>/cost-tech-ai-bot.git
git push -u origin main
```

`.env` is git-ignored — never commit real API keys.

## 3. Deploy on Render (free tier)

1. Go to [render.com](https://render.com) → New → **Web Service**.
2. Connect your GitHub repo `cost-tech-ai-bot`.
3. Settings:
   - **Build command:** `npm install`
   - **Start command:** `npm start`
   - **Instance type:** Free
4. Add environment variables (Render dashboard → Environment):
   - `TELEGRAM_BOT_TOKEN`
   - `GEMINI_API_KEY`
   - `GEMINI_MODEL` (optional, defaults to `gemini-2.0-flash`)
5. Deploy. Render will build and start the service; the bot uses Telegram long-polling, so no webhook/URL configuration is required on Telegram's side.

> Free Render web services can spin down after inactivity and take a few seconds to wake on the next request. The bundled Express server (`GET /`) exists purely so Render treats this as a valid, healthy web service.

## 4. Next steps (not yet built)
- Add Supabase for persistent users/projects/BOQs/estimate history
- Export estimates as PDF/Excel
- Add unit rate database per region instead of relying solely on Gemini's estimate
- Add admin/analytics commands

## Disclaimer
All figures produced by this bot are **preliminary/budgetary estimates only**, not tender-ready pricing. Always verify against current local market rates before committing to a budget.
