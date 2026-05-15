/// <mls fileReference="_102025_/l2/collabTasksTheme.ts" enhancement="_blank"/>

/**
 * Shared theme utilities for the Tasks tab.
 * Board and My Tasks share the same localStorage key so theme changes
 * are reflected everywhere immediately.
 */

import { html, TemplateResult, nothing } from 'lit';

// ── Types & constants ─────────────────────────────────────────────────────

export type TasksTheme = 'clean' | 'amber' | 'forest' | 'trello' | 'clickup';

export const TASKS_THEME_KEY       = 'collab-board-theme';
export const TASKS_BG_KEY_PREFIX   = 'collab-tasks-bg-';
export const TASKS_VALID_THEMES: TasksTheme[] = ['clean', 'amber', 'forest', 'trello', 'clickup'];

// ── Background image catalogs ─────────────────────────────────────────────

export const THEME_BG_OPTIONS: Partial<Record<TasksTheme, { url: string; thumbUrl: string; label: string }[]>> = {
  forest: [
    {
      label: 'Dark Forest',
      url:      'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1920&q=80',
      thumbUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=300&q=70',
    },
    {
      label: 'Misty Pines',
      url:      'https://images.unsplash.com/photo-1542401886-65d6c61db217?w=1920&q=80',
      thumbUrl: 'https://images.unsplash.com/photo-1542401886-65d6c61db217?w=300&q=70',
    },
    {
      label: 'Forest Path',
      url:      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&q=80',
      thumbUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&q=70',
    },
    {
      label: 'Redwood',
      url:      'https://images.unsplash.com/photo-1511497584788-876760111969?w=1920&q=80',
      thumbUrl: 'https://images.unsplash.com/photo-1511497584788-876760111969?w=300&q=70',
    },
  ],
  trello: [
    {
      label: 'Open Office',
      url:      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80',
      thumbUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=300&q=70',
    },
    {
      label: 'Blue Mountains',
      url:      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80',
      thumbUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&q=70',
    },
    {
      label: 'Ocean Calm',
      url:      'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=1920&q=80',
      thumbUrl: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=300&q=70',
    },
    {
      label: 'Workspace',
      url:      'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1920&q=80',
      thumbUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&q=70',
    },
  ],
  clickup: [
    {
      label: 'Purple Galaxy',
      url:      'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=1920&q=80',
      thumbUrl: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=300&q=70',
    },
    {
      label: 'Neon Lights',
      url:      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1920&q=80',
      thumbUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&q=70',
    },
    {
      label: 'Dark Abstract',
      url:      'https://images.unsplash.com/photo-1614728263952-84ea256f9679?w=1920&q=80',
      thumbUrl: 'https://images.unsplash.com/photo-1614728263952-84ea256f9679?w=300&q=70',
    },
    {
      label: 'Deep Space',
      url:      'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1920&q=80',
      thumbUrl: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=300&q=70',
    },
  ],
};

// ── localStorage helpers ──────────────────────────────────────────────────

export function loadTasksTheme(): TasksTheme {
  const saved = localStorage.getItem(TASKS_THEME_KEY) as TasksTheme | null;
  return saved && TASKS_VALID_THEMES.includes(saved) ? saved : 'clean';
}

export function loadThemeBgUrl(theme: TasksTheme): string | null {
  const opts = THEME_BG_OPTIONS[theme];
  if (!opts) return null;
  const saved = localStorage.getItem(`${TASKS_BG_KEY_PREFIX}${theme}`);
  // Return saved if valid, otherwise first option
  if (saved && opts.some(o => o.url === saved)) return saved;
  return opts[0].url;
}

export function saveThemeBgUrl(theme: TasksTheme, url: string) {
  localStorage.setItem(`${TASKS_BG_KEY_PREFIX}${theme}`, url);
}

export function applyThemeToHost(theme: TasksTheme, host: HTMLElement) {
  TASKS_VALID_THEMES.forEach(t => host.classList.remove(`theme-${t}`));
  host.classList.add(`theme-${theme}`);
  // Apply background image if supported
  const bgUrl = loadThemeBgUrl(theme);
  if (bgUrl) {
    host.style.setProperty('--theme-bg-url', `url("${bgUrl}")`);
  } else {
    host.style.removeProperty('--theme-bg-url');
  }
}

export function saveTasksTheme(theme: TasksTheme, host: HTMLElement) {
  localStorage.setItem(TASKS_THEME_KEY, theme);
  applyThemeToHost(theme, host);
}

// ── Theme metadata ────────────────────────────────────────────────────────

export interface ThemeMeta {
  id:      TasksTheme;
  labelPt: string;
  labelEn: string;
  descPt:  string;
  descEn:  string;
  hasImage: boolean;
}

export const THEME_LIST: ThemeMeta[] = [
  { id: 'clean',   labelPt: 'Limpo',     labelEn: 'Clean',    descPt: 'Neutro e minimalista',         descEn: 'Neutral and minimal',    hasImage: false },
  { id: 'amber',   labelPt: 'Âmbar',     labelEn: 'Amber',    descPt: 'Tons quentes tipo cobre',      descEn: 'Warm copper tones',      hasImage: false },
  { id: 'forest',  labelPt: 'Floresta',  labelEn: 'Forest',   descPt: 'Imagem de fundo + cartões brancos', descEn: 'Background image + white cards', hasImage: true },
  { id: 'trello',  labelPt: 'Workspace', labelEn: 'Workspace', descPt: 'Inspirado no Trello',         descEn: 'Trello-inspired',        hasImage: true },
  { id: 'clickup', labelPt: 'Dark Pro',  labelEn: 'Dark Pro',  descPt: 'Roxo escuro, inspirado no ClickUp', descEn: 'Dark purple, ClickUp-inspired', hasImage: true },
];

export function getThemeMeta(id: TasksTheme, lang: string): { label: string; desc: string } {
  const m = THEME_LIST.find(t => t.id === id)!;
  return lang === 'pt'
    ? { label: m.labelPt, desc: m.descPt }
    : { label: m.labelEn, desc: m.descEn };
}

// ── Preview templates ─────────────────────────────────────────────────────

export function themePreview(id: TasksTheme): TemplateResult {
  const cols3 = (colBg: string, cardBg: string, boardBg: string, border = 'transparent') => html`
    <div class="tp-row" style="background:${boardBg};gap:2px;padding:3px">
      <div class="tp-col" style="background:${colBg};border:0.5px solid ${border}">
        <div class="tp-card" style="background:${cardBg}"></div>
        <div class="tp-card" style="background:${cardBg}"></div>
      </div>
      <div class="tp-col" style="background:${colBg};border:0.5px solid ${border}">
        <div class="tp-card" style="background:${cardBg}"></div>
      </div>
      <div class="tp-col" style="background:${colBg};border:0.5px solid ${border}">
        <div class="tp-card" style="background:${cardBg}"></div>
        <div class="tp-card" style="background:${cardBg}"></div>
        <div class="tp-card" style="background:${cardBg}"></div>
      </div>
      <div class="tp-col" style="background:${colBg};border:0.5px solid ${border}">
        <div class="tp-card" style="background:${cardBg}"></div>
      </div>
    </div>
  `;

  if (id === 'clean') {
    return cols3('#f5f3ef', '#ffffff', '#e9e7e0', 'rgba(0,0,0,0.10)');
  }
  if (id === 'amber') {
    return cols3('#fef9ee', '#ffffff', 'linear-gradient(150deg,#b87333,#d4a53a)', 'rgba(120,68,8,0.15)');
  }
  if (id === 'forest') {
    return html`
      <div class="tp-row" style="background:url(https://images.unsplash.com/photo-1448375240586-882707db888b?w=300&q=50) center/cover;gap:2px;padding:3px">
        <div class="tp-col" style="background:rgba(255,255,255,0.90);border:0.5px solid rgba(0,0,0,0.08)">
          <div class="tp-card" style="background:#fff"></div>
          <div class="tp-card" style="background:#fff"></div>
        </div>
        <div class="tp-col" style="background:rgba(255,255,255,0.88);border:0.5px solid rgba(0,0,0,0.08)">
          <div class="tp-card" style="background:#fff"></div>
        </div>
        <div class="tp-col" style="background:rgba(255,255,255,0.90);border:0.5px solid rgba(0,0,0,0.08)">
          <div class="tp-card" style="background:#fff"></div>
          <div class="tp-card" style="background:#fff"></div>
        </div>
        <div class="tp-col" style="background:rgba(255,255,255,0.88);border:0.5px solid rgba(0,0,0,0.08)">
          <div class="tp-card" style="background:#fff"></div>
          <div class="tp-card" style="background:#fff"></div>
          <div class="tp-card" style="background:#fff"></div>
        </div>
      </div>
    `;
  }
  if (id === 'trello') {
    return html`
      <div class="tp-row" style="background:url(https://images.unsplash.com/photo-1497366216548-37526070297c?w=300&q=50) center/cover;gap:2px;padding:3px">
        <div class="tp-col" style="background:#ebecf0;border-radius:3px;border:none">
          <div class="tp-card" style="background:#fff;box-shadow:0 1px 2px rgba(9,30,66,0.2)"></div>
          <div class="tp-card" style="background:#fff;box-shadow:0 1px 2px rgba(9,30,66,0.2)"></div>
        </div>
        <div class="tp-col" style="background:#ebecf0;border-radius:3px">
          <div class="tp-card" style="background:#fff;box-shadow:0 1px 2px rgba(9,30,66,0.2)"></div>
        </div>
        <div class="tp-col" style="background:#ebecf0;border-radius:3px">
          <div class="tp-card" style="background:#fff;box-shadow:0 1px 2px rgba(9,30,66,0.2)"></div>
          <div class="tp-card" style="background:#fff;box-shadow:0 1px 2px rgba(9,30,66,0.2)"></div>
          <div class="tp-card" style="background:#fff;box-shadow:0 1px 2px rgba(9,30,66,0.2)"></div>
        </div>
        <div class="tp-col" style="background:#ebecf0;border-radius:3px">
          <div class="tp-card" style="background:#fff;box-shadow:0 1px 2px rgba(9,30,66,0.2)"></div>
        </div>
      </div>
    `;
  }
  // clickup
  return html`
    <div class="tp-row" style="background:linear-gradient(135deg,#13042a,#1e1257,#0d0626);gap:2px;padding:3px">
      <div class="tp-col" style="background:rgba(147,51,234,0.18);border:0.5px solid rgba(147,51,234,0.25);border-radius:6px">
        <div class="tp-card" style="background:rgba(255,255,255,0.10);border:0.5px solid rgba(147,51,234,0.20)"></div>
        <div class="tp-card" style="background:rgba(255,255,255,0.10);border:0.5px solid rgba(147,51,234,0.20)"></div>
      </div>
      <div class="tp-col" style="background:rgba(147,51,234,0.12);border:0.5px solid rgba(147,51,234,0.20);border-radius:6px">
        <div class="tp-card" style="background:rgba(255,255,255,0.10);border:0.5px solid rgba(147,51,234,0.20)"></div>
      </div>
      <div class="tp-col" style="background:rgba(147,51,234,0.18);border:0.5px solid rgba(147,51,234,0.25);border-radius:6px">
        <div class="tp-card" style="background:rgba(255,255,255,0.10);border:0.5px solid rgba(147,51,234,0.20)"></div>
        <div class="tp-card" style="background:rgba(255,255,255,0.10);border:0.5px solid rgba(147,51,234,0.20)"></div>
        <div class="tp-card" style="background:rgba(255,255,255,0.10);border:0.5px solid rgba(147,51,234,0.20)"></div>
      </div>
      <div class="tp-col" style="background:rgba(147,51,234,0.12);border:0.5px solid rgba(147,51,234,0.20);border-radius:6px">
        <div class="tp-card" style="background:rgba(255,255,255,0.10);border:0.5px solid rgba(147,51,234,0.20)"></div>
      </div>
    </div>
  `;
}

// ── Theme card renderer ───────────────────────────────────────────────────

export function renderThemeCards(
  currentTheme: TasksTheme,
  lang: string,
  onSelect: (t: TasksTheme) => void,
): TemplateResult {
  return html`
    <div class="theme-grid">
      ${THEME_LIST.map(meta => {
        const { label, desc } = getThemeMeta(meta.id, lang);
        const active = currentTheme === meta.id;
        return html`
          <button
            class="theme-card ${active ? 'selected' : ''} theme-id-${meta.id}"
            @click=${() => onSelect(meta.id)}
          >
            <div class="theme-board-preview">${themePreview(meta.id)}</div>
            <div class="theme-card-info">
              <span class="theme-card-name">${label}</span>
              ${active ? html`
                <svg class="theme-check-icon" width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <circle cx="6.5" cy="6.5" r="6.5" fill="currentColor"/>
                  <path d="M3.5 6.5l2 2 3.5-3.5" stroke="white" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              ` : nothing}
            </div>
            <span class="theme-card-desc">${desc}</span>
            ${meta.hasImage ? html`<span class="theme-img-badge">🖼</span>` : nothing}
          </button>
        `;
      })}
    </div>
  `;
}

// ── Image picker renderer ─────────────────────────────────────────────────

export function renderImagePicker(
  theme: TasksTheme,
  currentUrl: string | null,
  lang: string,
  onSelect: (url: string) => void,
): TemplateResult {
  const opts = THEME_BG_OPTIONS[theme];
  if (!opts) return html``;

  const titlePt = 'Imagem de fundo';
  const titleEn = 'Background image';
  const title = lang === 'pt' ? titlePt : titleEn;

  const effectiveCurrent = currentUrl ?? opts[0].url;

  return html`
    <div class="img-picker-section">
      <div class="img-picker-label">${title}</div>
      <div class="img-picker-grid">
        ${opts.map(opt => html`
          <button
            class="img-thumb ${effectiveCurrent === opt.url ? 'selected' : ''}"
            title="${opt.label}"
            @click=${() => onSelect(opt.url)}
            style="background-image: url('${opt.thumbUrl}')"
          >
            ${effectiveCurrent === opt.url ? html`
              <span class="img-thumb-check">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <circle cx="6" cy="6" r="6" fill="rgba(255,255,255,0.90)"/>
                  <path d="M3.5 6l1.8 1.8 3-3" stroke="#185fa5" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </span>
            ` : nothing}
          </button>
        `)}
      </div>
    </div>
  `;
}
