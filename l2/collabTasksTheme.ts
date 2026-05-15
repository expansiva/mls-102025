/// <mls fileReference="_102025_/l2/collabTasksTheme.ts" enhancement="_blank"/>

/**
 * Shared theme utilities for the Tasks tab.
 * Both Board and My Tasks read/write the same localStorage key so theme
 * changes are reflected everywhere immediately.
 */

import { html, TemplateResult } from 'lit';
import { nothing } from 'lit';

export type TasksTheme = 'clean' | 'amber' | 'forest';
export const TASKS_THEME_KEY    = 'collab-board-theme';
export const TASKS_VALID_THEMES: TasksTheme[] = ['clean', 'amber', 'forest'];

export function loadTasksTheme(): TasksTheme {
  const saved = localStorage.getItem(TASKS_THEME_KEY) as TasksTheme | null;
  return saved && TASKS_VALID_THEMES.includes(saved) ? saved : 'clean';
}

export function saveTasksTheme(theme: TasksTheme, host: HTMLElement) {
  localStorage.setItem(TASKS_THEME_KEY, theme);
  TASKS_VALID_THEMES.forEach(t => host.classList.remove(`theme-${t}`));
  host.classList.add(`theme-${theme}`);
}

// ── Theme metadata ─────────────────────────────────────────────────────────

export interface ThemeMeta {
  id:      TasksTheme;
  labelPt: string;
  labelEn: string;
  descPt:  string;
  descEn:  string;
}

export const THEME_LIST: ThemeMeta[] = [
  {
    id:      'clean',
    labelPt: 'Limpo',
    labelEn: 'Clean',
    descPt:  'Visual neutro e minimalista',
    descEn:  'Neutral and minimal',
  },
  {
    id:      'amber',
    labelPt: 'Âmbar',
    labelEn: 'Amber',
    descPt:  'Tons quentes e aconchegantes',
    descEn:  'Warm and cozy tones',
  },
  {
    id:      'forest',
    labelPt: 'Floresta',
    labelEn: 'Forest',
    descPt:  'Natureza com imagem de fundo',
    descEn:  'Nature background image',
  },
];

export function getThemeMeta(id: TasksTheme, lang: string): { label: string; desc: string } {
  const m = THEME_LIST.find(t => t.id === id)!;
  return lang === 'pt'
    ? { label: m.labelPt, desc: m.descPt }
    : { label: m.labelEn, desc: m.descEn };
}

// ── Preview templates (no innerHTML) ─────────────────────────────────────

export function themePreview(id: TasksTheme): TemplateResult {
  if (id === 'clean') {
    return html`
      <div class="tp-row">
        <div class="tp-col" style="background:#f0eeea"></div>
        <div class="tp-col" style="background:#f7f6f3">
          <div class="tp-card" style="background:#fff"></div>
          <div class="tp-card" style="background:#fff"></div>
        </div>
        <div class="tp-col" style="background:#f0eeea">
          <div class="tp-card" style="background:#fff"></div>
        </div>
        <div class="tp-col" style="background:#f7f6f3">
          <div class="tp-card" style="background:#fff"></div>
          <div class="tp-card" style="background:#fff"></div>
          <div class="tp-card" style="background:#fff"></div>
        </div>
      </div>
    `;
  }
  if (id === 'amber') {
    return html`
      <div class="tp-row" style="background:#e8d5a8">
        <div class="tp-col" style="background:#f7eed8">
          <div class="tp-card" style="background:#fffdf5"></div>
          <div class="tp-card" style="background:#fffdf5"></div>
        </div>
        <div class="tp-col" style="background:#f0e4c2">
          <div class="tp-card" style="background:#fffdf5"></div>
        </div>
        <div class="tp-col" style="background:#f7eed8">
          <div class="tp-card" style="background:#fffdf5"></div>
          <div class="tp-card" style="background:#fffdf5"></div>
          <div class="tp-card" style="background:#fffdf5"></div>
        </div>
        <div class="tp-col" style="background:#f0e4c2">
          <div class="tp-card" style="background:#fffdf5"></div>
        </div>
      </div>
    `;
  }
  // forest
  return html`
    <div class="tp-row" style="background:linear-gradient(135deg,#0f2316 0%,#1a3a1f 100%)">
      <div class="tp-col" style="background:rgba(255,255,255,0.08)">
        <div class="tp-card" style="background:rgba(255,255,255,0.09)"></div>
        <div class="tp-card" style="background:rgba(255,255,255,0.07)"></div>
      </div>
      <div class="tp-col" style="background:rgba(255,255,255,0.05)">
        <div class="tp-card" style="background:rgba(255,255,255,0.09)"></div>
      </div>
      <div class="tp-col" style="background:rgba(255,255,255,0.08)">
        <div class="tp-card" style="background:rgba(255,255,255,0.07)"></div>
        <div class="tp-card" style="background:rgba(255,255,255,0.09)"></div>
        <div class="tp-card" style="background:rgba(255,255,255,0.07)"></div>
      </div>
      <div class="tp-col" style="background:rgba(255,255,255,0.05)">
        <div class="tp-card" style="background:rgba(255,255,255,0.09)"></div>
        <div class="tp-card" style="background:rgba(255,255,255,0.07)"></div>
      </div>
    </div>
  `;
}

// ── Shared settings card renderer ─────────────────────────────────────────

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
            class="theme-card ${active ? 'selected' : ''}"
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
          </button>
        `;
      })}
    </div>
  `;
}
