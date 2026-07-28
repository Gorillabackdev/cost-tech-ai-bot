// src/gemini.js
// Handles all communication with Google Gemini API

const { GoogleGenerativeAI } = require('@google/generative-ai');
const { SYSTEM_PROMPT } = require('./prompts');

if (!process.env.GEMINI_API_KEY) {
  console.warn('⚠️  GEMINI_API_KEY is not set. The bot will not be able to generate responses.');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const MODEL_NAME = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

// In-memory conversation history per chatId.
// Structure: { [chatId]: [{ role: 'user'|'model', parts: [{text}] }, ...] }
const conversations = new Map();

function getHistory(chatId) {
  if (!conversations.has(chatId)) {
    conversations.set(chatId, []);
  }
  return conversations.get(chatId);
}

function resetHistory(chatId) {
  conversations.set(chatId, []);
}

/**
 * Sends a user message to Gemini, keeping per-chat conversation history,
 * and returns the model's text reply.
 */
async function askGemini(chatId, userMessage) {
  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
    systemInstruction: SYSTEM_PROMPT,
  });

  const history = getHistory(chatId);

  const chat = model.startChat({
    history,
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 1500,
    },
  });

  const result = await chat.sendMessage(userMessage);
  const responseText = result.response.text();

  // Persist turn in history
  history.push({ role: 'user', parts: [{ text: userMessage }] });
  history.push({ role: 'model', parts: [{ text: responseText }] });

  // Keep history from growing unbounded (cap at ~20 turns)
  if (history.length > 40) {
    conversations.set(chatId, history.slice(history.length - 40));
  }

  return responseText;
}

module.exports = {
  askGemini,
  resetHistory,
};
