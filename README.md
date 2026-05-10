# ATS Resume Analyzer

A sleek, AI-powered web app that analyzes resumes for ATS (Applicant Tracking System) compatibility and provides actionable suggestions to improve your chances of getting past automated screening.

![Demo Mode](https://img.shields.io/badge/status-demo%20mode-yellow) ![Vanilla JS](https://img.shields.io/badge/stack-vanilla%20JS-f7df1e) ![No Build Step](https://img.shields.io/badge/build-none-brightgreen) ![License](https://img.shields.io/badge/license-MIT-blue)

---

## ✨ Features

- 📄 **Resume Analysis** — Paste any resume text and get an instant ATS compatibility score (0–100)
- 🎯 **Job-Tailored Insights** — Optionally provide a job description for keyword-matched feedback
- 🔍 **6–8 Actionable Suggestions** — Prioritized as Critical / Important / Nice-to-Have
- 🏷️ **Smart Tags** — Highlights strengths and weaknesses at a glance
- 🎨 **Polished UI** — Dark theme, smooth animations, fully responsive
- ⚡ **Zero Build Step** — Pure HTML, CSS, and vanilla JavaScript — just open and run
- 🧪 **Built-in Demo Mode** — Preview the entire UI before adding an API key

---

## 🖼️ Screenshots

> Add screenshots of your app here once deployed.
> Suggestion: capture the input panels, the score circle with results, and the suggestions grid.

---

## 📂 Project Structure

```
ats-resume-analyzer/
├── index.html      # Markup
├── styles.css      # All styles (CSS variables, layout, animations)
├── app.js          # App logic, API call, JSON parsing, rendering
└── README.md
```

---

## 🚀 Quick Start

### 1. Clone the repo

```bash
git clone https://github.com/kavitagupta972/ATS-Resume-Analyzer.git
cd ATS-Resume-Analyzer
```

### 2. Open it in a browser

Just open `index.html` directly, or run a tiny local server:

```bash
# Python
python3 -m http.server 8000

# Node
npx serve
```

Then visit `http://localhost:8000`.

You'll see the app in **Demo Mode** — the UI is fully browsable, but real analysis is disabled until you add an API key.

---

## 🔑 Adding Your API Key

1. Get a key from the [Anthropic Console](https://console.anthropic.com/settings/keys).
2. Open `app.js` and find this line near the top:

   ```js
   const API_KEY = "API_KEY";
   ```

3. Replace `"API_KEY"` with your real key:

   ```js
   const API_KEY = "sk-ant-api03-xxxxxxxxxxxxxxxx";
   ```

4. Save and reload the page. The demo banner will disappear and real AI analysis will work.

---

## ⚠️ Security Warning

> **Do not commit a real API key to GitHub or deploy this app publicly with the key hardcoded.**

Anyone who visits your site can open DevTools and steal the key from the source. They could then run up bills on your Anthropic account.

For safe public hosting, you must move the API call to a backend that hides the key. See [Production Deployment](#-production-deployment) below.

If you accidentally commit your key:
1. Revoke it immediately at [console.anthropic.com](https://console.anthropic.com/settings/keys).
2. Generate a new one.
3. Use a backend proxy going forward.

---

## 🌐 Production Deployment

### Option A: Vercel (recommended, free)

For a public-facing app, use a serverless function to keep your API key on the server.

1. Restructure to:
   ```
   ats-resume-analyzer/
   ├── public/
   │   ├── index.html
   │   ├── styles.css
   │   └── app.js
   └── api/
       └── analyze.js   # serverless function — calls Anthropic API
   ```

2. In `api/analyze.js`, read the key from an env var:
   ```js
   process.env.ANTHROPIC_API_KEY
   ```

3. Update `app.js` to call `/api/analyze` instead of Anthropic directly.

4. Deploy:
   ```bash
   npm i -g vercel
   vercel
   vercel env add ANTHROPIC_API_KEY
   vercel --prod
   ```

### Option B: GitHub Pages (demo only)

GitHub Pages is **fine for the demo-mode UI** but **not safe** for the real key. Use it only to share the static UI preview.

```bash
# In repo settings → Pages → deploy from main branch / root
```

### Other hosts

The same pattern works on **Netlify** (`netlify/functions/`), **Cloudflare Pages** (Pages Functions), or **any Node.js server**.

---

## 🛡️ Abuse Protection (when going public)

Once your app is live, anyone can hit it. Protect yourself:

- **Set a monthly spending cap** in your Anthropic console
- **Rate-limit** by IP (e.g., `@vercel/kv` for Redis-backed limits)
- **Restrict CORS** to your own domain
- **Validate input size** — reject unreasonably large resumes
- Consider asking users to **bring their own API key** if you don't want to pay

---

## 🧠 How It Works

1. User pastes a resume (and optionally a job description) into the two text panels
2. App sends both to the Anthropic API with a structured prompt asking for a JSON response
3. The response includes a score, a summary, tags, and 6–8 actionable suggestions
4. A robust JSON parser handles markdown fences, truncated output, and trailing commas
5. Results render in an animated score arc and a grid of suggestion cards

---

## 🛠️ Tech Stack

- **HTML5** — Semantic markup
- **CSS3** — Custom properties, grid, animations, no framework
- **Vanilla JavaScript** — Fetch API, async/await, no dependencies
- **Anthropic Claude API** — `claude-sonnet-4-5` model
- **Google Fonts** — Syne (display), DM Mono (body)

---

## 🎨 Customization

### Change colors

All colors are CSS variables in `styles.css`. Edit the `:root` block:

```css
:root {
  --bg: #0a0a0f;
  --accent: #7c5cfc;
  --accent2: #00e5b0;
  /* ... */
}
```

### Change the model or token limit

In `app.js`:

```js
const MODEL = "claude-sonnet-4-5";
const MAX_TOKENS = 4000;
```

### Adjust the analysis prompt

Edit the `buildPrompt()` function in `app.js` to change what aspects the AI focuses on.

---

## 🗺️ Roadmap

- [ ] Backend serverless function for safe public deployment
- [ ] PDF / DOCX upload support (currently text-only)
- [ ] Side-by-side resume comparison
- [ ] Export results as PDF
- [ ] User accounts with saved analyses
- [ ] Multilingual support
- [ ] Dark / light theme toggle

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built with the [Anthropic Claude API](https://www.anthropic.com/)
- Fonts by [Google Fonts](https://fonts.google.com/)
- Inspired by the frustration of every job seeker who's been ghosted by an ATS

---

## 📧 Contact

Questions or feedback? Open an issue on the repo:

- GitHub: [@kavitagupta972](https://github.com/kavitagupta972)
- Repo: [ATS-Resume-Analyzer](https://github.com/kavitagupta972/ATS-Resume-Analyzer)

---

<p align="center">Built with ❤️ for job seekers everywhere.</p>
