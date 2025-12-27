require('dotenv').config();
const express = require('express');
const path = require('path');
const { OpenAI } = require('openai');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Load local knowledge base
let knowledge = [];
try {
  const kraw = fs.readFileSync(path.join(__dirname, 'knowledge.json'), 'utf8');
  knowledge = JSON.parse(kraw);
  console.log(`Loaded ${knowledge.length} knowledge entries.`);
} catch (e) {
  console.warn('No knowledge base found or failed to load:', e.message);
}

const CONV_FILE = path.join(__dirname, 'conversations.json');
function recordMessage(role, text) {
  try {
    const now = new Date().toISOString();
    const raw = fs.readFileSync(CONV_FILE, 'utf8');
    const arr = JSON.parse(raw || '[]');
    arr.push({ role, text, ts: now });
    fs.writeFileSync(CONV_FILE, JSON.stringify(arr, null, 2), 'utf8');
  } catch (e) {
    console.error('Failed to record message:', e.message);
  }
}

app.get('/api/history', (req, res) => {
  try {
    const raw = fs.readFileSync(CONV_FILE, 'utf8');
    const arr = JSON.parse(raw || '[]');
    res.json({ history: arr });
  } catch (e) {
    res.json({ history: [] });
  }
});

app.get('/api/mode', (req, res) => {
  res.json({ mode: openai ? 'openai' : 'local' });
});

// Export conversation file
app.get('/api/export', (req, res) => {
  try {
    if (fs.existsSync(CONV_FILE)) {
      return res.download(CONV_FILE, 'conversations.json');
    }
    res.status(404).json({ error: 'No conversation file' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Clear conversation history (POST)
app.post('/api/clear', (req, res) => {
  try {
    fs.writeFileSync(CONV_FILE, JSON.stringify([], null, 2), 'utf8');
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Initialize OpenAI client if API key is provided. If not, fall back to a local rule-based bot.
let openai = null;
const OPENAI_KEY = process.env.OPENAI_API_KEY;
if (OPENAI_KEY) {
  openai = new OpenAI({ apiKey: OPENAI_KEY });
  console.log('OpenAI client initialized.');
} else {
  console.warn('OPENAI_API_KEY not set — running in local fallback mode. The chat will use a simple rule-based responder.');
}

function localFallbackReply(message) {
  const m = message.toLowerCase();
  // Simple canned responses
  if (/hello|hi|hey/.test(m)) return 'Hello! I am Techverse Assistant. How can I help you today?';
  // check knowledge base for keywords first
  for (const entry of knowledge) {
    for (const kw of entry.keywords || []) {
      if (m.includes(kw)) return entry.answer;
    }
  }
  if (/help|assist|support/.test(m)) return 'Sure — tell me what you need help with (e.g., "create a project", "install dependencies").';
  if (/time|date/.test(m)) return `Current server time is ${new Date().toLocaleString()}`;
  if (/weather/.test(m)) return "I don't have live weather data in local mode, but I can show you how to add it.";
  // echo fallback for short messages
  if (m.length < 80) return `You said: "${message}" — I'm a simple local responder.`;
  return "Sorry, I don't understand that exactly. Try rephrasing or provide more detail.";
}

app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'No message provided' });
  try {
    if (openai) {
      const completion = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: message }],
        max_tokens: 800,
      });

      const reply = completion.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';
      // record both messages
      recordMessage('user', message);
      recordMessage('bot', reply);
      return res.json({ reply });
    }

    // local fallback
    const reply = localFallbackReply(message);
    recordMessage('user', message);
    recordMessage('bot', reply);
    return res.json({ reply });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ error: 'Chat request failed', details: err.message || err.toString() });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});