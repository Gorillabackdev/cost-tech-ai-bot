// src/estimator.js
// Lightweight helper utilities for cost estimation formatting and math.
// The heavy lifting (actual pricing logic) is done by Gemini via prompts.js.
// This module handles deterministic math + Telegram-safe formatting so numbers
// are consistent even when the AI is asked to compute contingencies, totals, etc.

/**
 * Calculates contingency and total given a subtotal and percentage.
 */
function calculateContingency(subtotal, contingencyPercent = 12.5) {
  const contingency = subtotal * (contingencyPercent / 100);
  const total = subtotal + contingency;
  return {
    subtotal: round2(subtotal),
    contingencyPercent,
    contingency: round2(contingency),
    total: round2(total),
  };
}

function round2(num) {
  return Math.round(num * 100) / 100;
}

/**
 * Formats a number as currency-style string, e.g. 1234567.5 -> "1,234,567.50"
 */
function formatAmount(num) {
  return round2(num).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Escapes Telegram MarkdownV2 special characters so free-text from the AI
 * (or user) doesn't break message formatting.
 */
function escapeMarkdown(text) {
  return text.replace(/([_*[\]()~`>#+\-=|{}.!\\])/g, '\\$1');
}

/**
 * Splits a long message into Telegram-safe chunks (max 4096 chars per message).
 */
function chunkMessage(text, maxLength = 4000) {
  const chunks = [];
  let remaining = text;
  while (remaining.length > maxLength) {
    let splitAt = remaining.lastIndexOf('\n', maxLength);
    if (splitAt === -1) splitAt = maxLength;
    chunks.push(remaining.slice(0, splitAt));
    remaining = remaining.slice(splitAt);
  }
  chunks.push(remaining);
  return chunks;
}

module.exports = {
  calculateContingency,
  formatAmount,
  escapeMarkdown,
  chunkMessage,
};
