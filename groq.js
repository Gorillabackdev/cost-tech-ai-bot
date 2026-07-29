// src/groq.js
// Handles all communication with the Groq API (OpenAI-compatible chat completions).
// Used as an alternative to Gemini, since Groq's free tier has been more reliable
// (no billing-linkage quirks, no credit card required).

const { SYSTEM_PROMPT } = require('./prompts');

if (!process.env.GROQ_API_KEY) {
  console.warn('⚠️  GROQ_API_KEY is not set. The bot will not be able to generate responses.');
}

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL_NAME = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

// In-memory conversation history per chatId.
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

async function askGemini(chatId, userMessage) {
  const history = getHistory(chatId);

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history,
    { role: 'user', content: userMessage },
  ];

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL_NAME,
      messages,
      temperature: 0.4,
      max_tokens: 1500,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Groq API error: ${response.status} ${response.statusText} - ${errorBody}`);
  }

  const data = await response.json();
  const responseText = data.choices?.[0]?.message?.content?.trim() || '';

  history.push({ role: 'user', content: userMessage });
  history.push({ role: 'assistant', content: responseText });

  if (history.length > 40) {
    conversations.set(chatId, history.slice(history.length - 40));
  }

  return responseText;
}

module.exports = {
  askGemini,
  resetHistory,
};
