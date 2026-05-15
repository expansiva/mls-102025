/// <mls fileReference="_102025_/l2/collabTasksThemePicker.ts" enhancement="_102027_/l2/enhancementLit" />

/// **collab_i18n_start**
const message_pt = {
  themesTitle:     'Tema',
  imagePickerLabel:'Imagem de fundo',
};
const message_en = {
  themesTitle:     'Theme',
  imagePickerLabel:'Background image',
};
/// **collab_i18n_end**

/**
 * Reusable theme picker.
 *
 * Renders the theme cards grid + (when applicable) the background-image
 * picker. Persists the selection via the shared helpers in collabTasksTheme,
 * and dispatches two events on the top window so any open tasks screen can
 * react and stay in sync:
 *   - 'tasks-theme-changed'  detail: { theme }
 *   - 'tasks-bg-changed'     detail: { theme, url }
 *
 * Usage:
 *   <collab-tasks-theme-picker-102025
 *       variant="compact"     // or "panel" (default)
 *       hideTitle              // optional
 *   ></collab-tasks-theme-picker-102025>
 */

import { html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { StateLitElement } from '/_102029_/l2/stateLitElement.js';
import {
  type TasksTheme,
  THEME_BG_OPTIONS,
  THEME_LIST,
  getThemeMeta,
  themePreview,
  loadTasksTheme,
  loadThemeBgUrl,
  saveTasksTheme,
  saveThemeBgUrl,
} from '/_102025_/l2/collabTasksTheme.js';
// Side-effect import: ensures the design tokens stylesheet is loaded.
import '/_102025_/l2/collabTasksDesignTokens.js';

function getMsg() {
  return document.documentElement.lang === 'pt' ? message_pt : message_en;
}

@customElement('collab-tasks-theme-picker-102025')
export class CollabTasksThemePicker extends StateLitElement {

  /** Visual density. 'compact' for inline popovers, 'panel' for standalone screens. */
  @property({ type: String }) variant: 'compact' | 'panel' = 'panel';

  /** Hide the section title when the host already provides one. */
  @property({ type: Boolean }) hideTitle = false;

  @state() private _theme: TasksTheme = 'clean';
  @state() private _bgUrl: string | null = null;

  private _onThemeChanged!: EventListener;
  private _onBgChanged!: EventListener;

  connectedCallback() {
    super.connectedCallback();
    this._theme = loadTasksTheme();
    this._bgUrl = loadThemeBgUrl(this._theme);
    this.setAttribute('data-variant', this.variant);

    // Stay in sync if another picker (or another component) changes the theme.
    this._onThemeChanged = (e: Event) => {
      const detail = (e as CustomEvent).detail as { theme: TasksTheme };
      if (detail?.theme && detail.theme !== this._theme) {
        this._theme = detail.theme;
        this._bgUrl = loadThemeBgUrl(detail.theme);
      }
    };
    this._onBgChanged = (e: Event) => {
      const detail = (e as CustomEvent).detail as { theme: TasksTheme; url: string };
      if (detail?.theme === this._theme) this._bgUrl = detail.url;
    };
    const w = window?.top ?? window;
    w.addEventListener('tasks-theme-changed', this._onThemeChanged);
    w.addEventListener('tasks-bg-changed',    this._onBgChanged);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    const w = window?.top ?? window;
    w.removeEventListener('tasks-theme-changed', this._onThemeChanged);
    w.removeEventListener('tasks-bg-changed',    this._onBgChanged);
  }

  updated(changed: Map<string, unknown>) {
    super.updated(changed);
    if (changed.has('variant')) this.setAttribute('data-variant', this.variant);
  }

  private _onSelectTheme(theme: TasksTheme) {
    if (theme === this._theme) return;
    this._theme = theme;
    this._bgUrl = loadThemeBgUrl(theme);
    // saveTasksTheme persists + applies to a host element. We don't want this
    // picker to claim ownership of the theme class — that belongs to the
    // top-level screen host. So we persist directly and dispatch the event.
    localStorage.setItem('collab-board-theme', theme);
    const w = window?.top ?? window;
    w.dispatchEvent(new CustomEvent('tasks-theme-changed', {
      detail: { theme },
      bubbles: true, composed: true,
    }));
  }

  private _onSelectBg(url: string) {
    if (url === this._bgUrl) return;
    this._bgUrl = url;
    saveThemeBgUrl(this._theme, url);
    const w = window?.top ?? window;
    w.dispatchEvent(new CustomEvent('tasks-bg-changed', {
      detail: { theme: this._theme, url },
      bubbles: true, composed: true,
    }));
  }

  render() {
    const m    = getMsg();
    const lang = document.documentElement.lang ?? 'en';
    const opts = THEME_BG_OPTIONS[this._theme];
    const effectiveCurrent = this._bgUrl ?? opts?.[0]?.url ?? null;

    return html`
      ${this.hideTitle ? nothing : html`
        <div class="ctp-title">${m.themesTitle}</div>
      `}

      <div class="ctp-grid">
        ${THEME_LIST.map(meta => {
          const { label, desc } = getThemeMeta(meta.id, lang);
          const active = this._theme === meta.id;
          return html`
            <button
              type="button"
              class="ctp-card ${active ? 'is-selected' : ''} ctp-theme-${meta.id}"
              aria-pressed=${active ? 'true' : 'false'}
              @click=${() => this._onSelectTheme(meta.id)}
            >
              <div class="ctp-preview">${themePreview(meta.id)}</div>
              <div class="ctp-card-row">
                <span class="ctp-card-name">${label}</span>
                ${active ? html`
                  <svg class="ctp-check" width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                    <circle cx="6.5" cy="6.5" r="6.5" fill="currentColor"/>
                    <path d="M3.5 6.5l2 2 3.5-3.5" stroke="white" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                ` : nothing}
              </div>
              <span class="ctp-card-desc">${desc}</span>
              ${meta.hasImage ? html`<span class="ctp-img-badge" aria-hidden="true">🖼</span>` : nothing}
            </button>
          `;
        })}
      </div>

      ${opts ? html`
        <div class="ctp-img-section">
          <div class="ctp-img-label">${m.imagePickerLabel}</div>
          <div class="ctp-img-grid">
            ${opts.map(opt => html`
              <button
                type="button"
                class="ctp-img-thumb ${effectiveCurrent === opt.url ? 'is-selected' : ''}"
                title=${opt.label}
                aria-label=${opt.label}
                aria-pressed=${effectiveCurrent === opt.url ? 'true' : 'false'}
                @click=${() => this._onSelectBg(opt.url)}
                style="background-image: url('${opt.thumbUrl}')"
              >
                ${effectiveCurrent === opt.url ? html`
                  <span class="ctp-img-check" aria-hidden="true">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <circle cx="6" cy="6" r="6" fill="rgba(255,255,255,0.92)"/>
                      <path d="M3.5 6l1.8 1.8 3-3" stroke="#185fa5" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </span>
                ` : nothing}
              </button>
            `)}
          </div>
        </div>
      ` : nothing}
    `;
  }
}
