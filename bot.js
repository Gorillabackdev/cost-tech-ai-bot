// src/bot.js
// Entry point: connects Telegram <-> Gemini, and runs a tiny HTTP server
// so Render's free web-service tier keeps the app alive.

require('dotenv').config();

const express = require('express');
const TelegramBot = require('node-telegram-bot-api');

const { askGemini, resetHistory } = require('./groq');
const { WELCOME_MESSAGE, HELP_MESSAGE } = require('./prompts');
const { chunkMessage } = require('./estimator');

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const PORT = process.env.PORT || 3000;

if (!TELEGRAM_TOKEN) {
  console.error('❌ TELEGRAM_BOT_TOKEN is missing. Set it in your .env or Render environment variables.');
  process.exit(1);
}

// --- Telegram bot (long polling) ---
const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

bot.on('polling_error', (err) => {
  console.error('Polling error:', err.message);
});

bot.onText(/^\/start$/, (msg) => {
  const chatId = msg.chat.id;
  resetHistory(chatId);
  bot.sendMessage(chatId, WELCOME_MESSAGE, { parse_mode: 'Markdown' });
});

bot.onText(/^\/help$/, (msg) => {
  bot.sendMessage(msg.chat.id, HELP_MESSAGE, { parse_mode: 'Markdown' });
});

bot.onText(/^\/reset$/, (msg) => {
  const chatId = msg.chat.id;
  resetHistory(chatId);
  bot.sendMessage(chatId, '🔄 Project context cleared. Tell me about your new project.');
});

// Catch-all: any non-command text goes to Gemini
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (!text || text.startsWith('/')) return; // commands handled above

  try {
    bot.sendChatAction(chatId, 'typing');
    const reply = await askGemini(chatId, text);

    const chunks = chunkMessage(reply);
    for (const chunk of chunks) {
      await bot.sendMessage(chatId, chunk);
    }
  } catch (err) {
    console.error('Error handling message:', err);
    bot.sendMessage(
      chatId,
      '⚠️ Sorry, something went wrong generating your estimate. Please try again in a moment.'
    );
  }
});

console.log('🤖 Cost Tech AI Telegram bot is running (polling mode)...');

// --- Minimal HTTP server for Render health checks / keep-alive ---
const app = express();

app.get('/', (req, res) => {
  res.send('Cost Tech AI bot is alive ✅');
});

app.listen(PORT, () => {
  console.log(`🌐 Health check server listening on port ${PORT}`);
});
