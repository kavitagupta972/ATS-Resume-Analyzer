// ============================================
// 🔑 PASTE YOUR ANTHROPIC API KEY HERE
// Get one at: https://console.anthropic.com/settings/keys
// ============================================
const API_KEY = "API_KEY";
// ============================================

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-5";
const MAX_TOKENS = 4000;

// ============================================
// Initialization — runs after DOM is ready
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  // Hide demo banner if real API key is present
  if (isApiKeySet()) {
    const banner = document.getElementById('demoBanner');
    if (banner) banner.classList.add('hidden');
  }

  // Wire up button click handlers
  document.getElementById('analyzeBtn').addEventListener('click', analyzeResume);
  document.getElementById('clearBtn').addEventListener('click', clearAll);
});

function isApiKeySet() {
  return API_KEY && API_KEY !== "API_KEY" && API_KEY.trim() !== "";
}

// ============================================
// Main analyze flow
// ============================================
async function analyzeResume() {
  const resume = document.getElementById('resume').value.trim();
  const jobdesc = document.getElementById('jobdesc').value.trim();

  if (!resume) {
    alert('Please paste your resume text first.');
    return;
  }

  // Demo mode — no real API key set yet
  if (!isApiKeySet()) {
    showDemoMessage();
    return;
  }

  const btn = document.getElementById('analyzeBtn');
  const loading = document.getElementById('loading');
  const results = document.getElementById('results');

  btn.disabled = true;
  loading.classList.add('visible');
  results.classList.remove('visible');

  const prompt = buildPrompt(resume, jobdesc);

  try {
    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    const text = data.content?.find(b => b.type === 'text')?.text || '';
    const parsed = parseJsonSafely(text);

    if (!parsed) {
      throw new Error('Could not parse a valid response. Please try again.');
    }

    renderResults(parsed);
  } catch (err) {
    console.error(err);
    alert('Something went wrong analyzing your resume: ' + err.message);
  } finally {
    btn.disabled = false;
    loading.classList.remove('visible');
  }
}

// ============================================
// Prompt builder
// ============================================
function buildPrompt(resume, jobdesc) {
  return `You are an expert ATS (Applicant Tracking System) resume analyzer. Analyze the following resume${jobdesc ? ' against the provided job description' : ''} and return ONLY a valid, complete JSON object. No markdown, no backticks, no preamble.

CRITICAL JSON RULES:
- Output must be valid JSON that can be parsed directly
- Do NOT use unescaped double quotes inside string values — use single quotes instead
- Do NOT use line breaks inside string values
- Keep all string values concise (under 200 characters each)

Resume:
${resume}
${jobdesc ? `\nJob Description:\n${jobdesc}` : ''}

Return ONLY this JSON structure:
{
  "score": <number 0-100>,
  "headline": "<short verdict, max 5 words>",
  "summary": "<2 sentences, max 200 chars>",
  "tags": [
    {"label": "<2-3 words>", "type": "good|warn|bad"}
  ],
  "suggestions": [
    {
      "severity": "critical|important|nice",
      "title": "<concise title, max 8 words>",
      "description": "<actionable fix, max 200 chars>"
    }
  ]
}

Provide 6-8 specific suggestions and 4-6 tags. Be concise. Keep total response under 3500 characters.`;
}

// ============================================
// Robust JSON parser — handles markdown fences,
// truncated JSON, and trailing commas
// ============================================
function parseJsonSafely(text) {
  if (!text) return null;

  let clean = text.replace(/```json|```/gi, '').trim();
  const start = clean.indexOf('{');
  if (start === -1) return null;
  clean = clean.slice(start);

  // Try direct parse first
  try { return JSON.parse(clean); } catch (e) {}

  // Walk forward looking for a balanced close brace
  let depth = 0, inString = false, escape = false, lastValidEnd = -1;
  for (let i = 0; i < clean.length; i++) {
    const ch = clean[i];
    if (escape) { escape = false; continue; }
    if (ch === '\\') { escape = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) lastValidEnd = i;
    }
  }
  if (lastValidEnd !== -1) {
    try { return JSON.parse(clean.slice(0, lastValidEnd + 1)); } catch (e) {}
  }

  // Last resort: repair truncated JSON
  return repairTruncatedJson(clean);
}

function repairTruncatedJson(s) {
  let depth = 0, arrDepth = 0, inString = false, escape = false;
  let lastSafePoint = 0;

  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (escape) { escape = false; continue; }
    if (ch === '\\') { escape = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (ch === '{') depth++;
    else if (ch === '}') depth--;
    else if (ch === '[') arrDepth++;
    else if (ch === ']') arrDepth--;
    if (!inString && (ch === '}' || ch === ']')) lastSafePoint = i + 1;
  }

  let repaired = s.slice(0, lastSafePoint);

  // Recount on the trimmed string
  depth = 0; arrDepth = 0; inString = false; escape = false;
  for (let i = 0; i < repaired.length; i++) {
    const ch = repaired[i];
    if (escape) { escape = false; continue; }
    if (ch === '\\') { escape = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (ch === '{') depth++;
    else if (ch === '}') depth--;
    else if (ch === '[') arrDepth++;
    else if (ch === ']') arrDepth--;
  }

  repaired = repaired.replace(/,\s*$/, '');
  while (arrDepth > 0) { repaired += ']'; arrDepth--; }
  while (depth > 0) { repaired += '}'; depth--; }

  try { return JSON.parse(repaired); } catch (e) {
    console.error('JSON repair failed:', e, repaired);
    return null;
  }
}

// ============================================
// Render results
// ============================================
function renderResults(data) {
  const results = document.getElementById('results');

  // Score
  const score = Math.min(100, Math.max(0, data.score || 0));
  document.getElementById('scoreNum').textContent = score;
  document.getElementById('scoreHeadline').textContent = data.headline || '';
  document.getElementById('scoreSummary').textContent = data.summary || '';

  // Animate score arc
  const arc = document.getElementById('scoreArc');
  const circumference = 239;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 70 ? '#00e5b0' : score >= 45 ? '#ffd93d' : '#ff6b6b';
  arc.style.stroke = color;
  arc.style.transition = 'stroke-dashoffset 1s ease, stroke 0.5s';
  setTimeout(() => { arc.style.strokeDashoffset = offset; }, 100);
  document.getElementById('scoreNum').style.color = color;

  // Tags
  const tagsRow = document.getElementById('tagsRow');
  tagsRow.innerHTML = (data.tags || []).map(t =>
    `<span class="tag ${t.type}">${escapeHtml(t.label)}</span>`
  ).join('');

  // Suggestions
  const grid = document.getElementById('suggestionsGrid');
  grid.innerHTML = (data.suggestions || []).map(s => `
    <div class="suggestion-card">
      <div class="side-bar ${s.severity}"></div>
      <div class="sev ${s.severity}">${severityLabel(s.severity)}</div>
      <h3>${escapeHtml(s.title)}</h3>
      <p>${escapeHtml(s.description)}</p>
    </div>
  `).join('');

  results.classList.add('visible');
  results.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function severityLabel(sev) {
  if (sev === 'critical') return '🔴 Critical';
  if (sev === 'important') return '🟡 Important';
  return '🟢 Nice to Have';
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ============================================
// Demo mode (when no API key is configured)
// ============================================
function showDemoMessage() {
  const demoData = {
    score: 0,
    headline: "Demo Mode",
    summary: "This is the UI preview. Add a real Anthropic API key in app.js (replace 'API_KEY') to enable actual AI analysis.",
    tags: [
      { label: "UI Only", type: "warn" },
      { label: "No API Key", type: "bad" },
      { label: "Setup Required", type: "warn" }
    ],
    suggestions: [
      {
        severity: "critical",
        title: "Add your Anthropic API key",
        description: "Open app.js, find the line `const API_KEY = \"API_KEY\";` near the top, and replace it with your real key from console.anthropic.com."
      },
      {
        severity: "important",
        title: "What this app does (when enabled)",
        description: "Scores your resume 0–100 for ATS compatibility, identifies missing keywords against a job description, and generates 6–8 actionable improvement suggestions."
      },
      {
        severity: "important",
        title: "Don't ship this to production with a hardcoded key",
        description: "A browser-visible API key can be stolen. For public hosting, move the key to a backend serverless function (Vercel/Netlify) before sharing the URL."
      },
      {
        severity: "nice",
        title: "Try the UI",
        description: "Even without a key, you can paste text in both panels, see the layout, and preview how the results section will render."
      }
    ]
  };
  renderResults(demoData);
}

// ============================================
// Clear inputs and results
// ============================================
function clearAll() {
  document.getElementById('resume').value = '';
  document.getElementById('jobdesc').value = '';
  document.getElementById('results').classList.remove('visible');
}
