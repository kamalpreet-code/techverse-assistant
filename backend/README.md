# Techverse Assistant (backend)

Minimal OpenAI-backed chatbot backend + static frontend.

Requirements
- Node.js 18+ (installed on Windows)
- An OpenAI API key set in the environment as `OPENAI_API_KEY` (or in a `.env` file)

Quick start
1. From this folder (`backend`) install dependencies:

```powershell
npm.cmd install
```

2. Set your OpenAI API key in a `.env` file (create a file `.env` with):

```
OPENAI_API_KEY=sk-...
```

3. Start the server:

```powershell
npm.cmd start
```

Open `http://localhost:3000` in your browser.

Notes about PowerShell: If you see a script execution policy error when running `npm`, use `npm.cmd` (shown above) or run from `cmd /c "npm install"`.

To use a different model: set `OPENAI_MODEL` in `.env` (default: `gpt-3.5-turbo`).

Fallback (no OpenAI key)
If `OPENAI_API_KEY` is not set, the server will run in a local fallback mode that uses a simple rule-based responder. This is useful for demos when you don't have an API key yet.

Knowledge base and recording
- The server checks a local knowledge base (`knowledge.json`) for matching keywords and answers Techverse-specific FAQ automatically.
- All chat messages (user and bot) are recorded to `conversations.json`. You can view conversation history from the UI or via the API `GET /api/history`.
