/// <mls fileReference="_102025_/l2/collabTasksSettings.ts" enhancement="_102027_/l2/enhancementLit" />

/// **collab_i18n_start**
const message_pt = {
  title:          'Configurações',
  subtitle:       'Tasks',
  appearance:     'Aparência',
  appearanceDesc: 'Escolha o tema visual do board e das telas de tasks.',
  tags:           'Vocabulário de tags',
  tagsDesc:       'Tags configuradas para esta organização.',
  tagsEmpty:      'Nenhuma tag configurada.',
  future:         'Em breve',
  settingNotif:   'Notificações',
  settingNotifD:  'Quando e como notificar aprovadores e responsáveis.',
  settingExport:  'Exportação e auditoria',
  settingExportD: 'CSV, PDF e trilha completa de instâncias de processo.',
  settingPerms:   'Perfis e permissões',
  settingPermsD:  'Quem pode criar, editar e aprovar workflows.',
  reload:         'Recarregar',
  loadError:      'Não consegui carregar.',
  retry:          'Tentar de novo',
};
const message_en = {
  title:          'Settings',
  subtitle:       'Tasks',
  appearance:     'Appearance',
  appearanceDesc: 'Choose the visual theme for the board and task screens.',
  tags:           'Tag vocabulary',
  tagsDesc:       'Tags configured for this organization.',
  tagsEmpty:      'No tags configured.',
  future:         'Coming soon',
  settingNotif:   'Notifications',
  settingNotifD:  'When and how to notify approvers and owners.',
  settingExport:  'Export & audit',
  settingExportD: 'CSV, PDF and full process instance trail.',
  settingPerms:   'Profiles & permissions',
  settingPermsD:  'Who can create, edit and approve workflows.',
  reload:         'Reload',
  loadError:      'Could not load.',
  retry:          'Retry',
};
/// **collab_i18n_end**

import { html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { StateLitElement } from '/_102029_/l2/stateLitElement.js';
import * as msg from '/_102025_/l2/shared/interfaces.js';
import { msgGetOrgPreferences } from '/_102025_/l2/shared/api.js';
import { getUserId } from '/_102025_/l2/collabMessagesHelper.js';
import {
  type TasksTheme,
  loadTasksTheme,
  saveTasksTheme,
  renderThemeCards,
} from '/_102025_/l2/collabTasksTheme.js';

function getMsg() {
  return document.documentElement.lang === 'pt' ? message_pt : message_en;
}

const TAG_COLOR_LABEL: Record<string, { bg: string; text: string }> = {
  bug:      { bg: '#fcebeb', text: '#a32d2d' },
  feature:  { bg: '#e6f1fb', text: '#185fa5' },
  business: { bg: '#faeeda', text: '#854f0b' },
  process:  { bg: '#e1f5ee', text: '#085041' },
  neutral:  { bg: '#f5f4f0', text: '#5f5e5a' },
};

@customElement('collab-tasks-settings-102025')
export class CollabTasksSettings extends StateLitElement {

  @property({ type: String }) userId       = '';
  @property({ type: String }) organizationId = 'collabcodes';

  @state() private _theme: TasksTheme = 'clean';
  @state() private tagVocabulary: msg.TagVocabularyEntry[] = [];
  @state() private loadingTags = true;
  @state() private errorTags: string | null = null;

  connectedCallback() {
    super.connectedCallback();
    if (!this.userId) this.userId = getUserId() || '';
    this._theme = loadTasksTheme();
    this._applyTheme(this._theme);
    this._loadTags();
  }

  private _applyTheme(theme: TasksTheme) {
    this._theme = theme;
    saveTasksTheme(theme, this);
    // Also propagate to the whole tasks tab so board/my-tasks update when opened next
  }

  private async _loadTags() {
    this.loadingTags = true;
    this.errorTags   = null;
    try {
      const res = await msgGetOrgPreferences({ organizationId: this.organizationId, userId: this.userId });
      if (res.success) this.tagVocabulary = res.response?.tagVocabulary ?? [];
      else this.errorTags = res.error ?? 'error';
    } catch (err: any) {
      this.errorTags = err?.message ?? 'error';
    }
    this.loadingTags = false;
  }

  render() {
    const m    = getMsg();
    const lang = document.documentElement.lang ?? 'en';

    return html`
      <div class="st-header">
        <div class="st-header-left">
          <span class="st-title">${m.title}</span>
          <span class="st-sep">·</span>
          <span class="st-sub">${m.subtitle}</span>
        </div>
        <button class="st-icon-btn" title="${m.reload}" @click=${() => this._loadTags()}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="23 4 23 10 17 10"></polyline>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
          </svg>
        </button>
      </div>

      <div class="st-body">

        <!-- ── Appearance ── -->
        <section class="st-section">
          <div class="st-section-header">
            <div class="st-section-title">${m.appearance}</div>
            <div class="st-section-desc">${m.appearanceDesc}</div>
          </div>
          ${renderThemeCards(this._theme, lang, (t) => this._applyTheme(t))}
        </section>

        <!-- ── Tag vocabulary ── -->
        <section class="st-section">
          <div class="st-section-header">
            <div class="st-section-title">${m.tags}</div>
            <div class="st-section-desc">${m.tagsDesc}</div>
          </div>

          ${this.errorTags ? html`
            <div class="st-error">
              <span>${m.loadError}</span>
              <button @click=${() => this._loadTags()}>${m.retry}</button>
            </div>
          ` : this.loadingTags ? html`
            <div class="tag-chips">
              ${[60, 80, 55, 70, 45].map(w => html`
                <div class="skel" style="width:${w}px;height:22px;border-radius:12px"></div>
              `)}
            </div>
          ` : this.tagVocabulary.length === 0 ? html`
            <div class="st-empty">${m.tagsEmpty}</div>
          ` : html`
            <div class="tag-chips">
              ${this.tagVocabulary.map(entry => {
                const colors = TAG_COLOR_LABEL[entry.color] ?? TAG_COLOR_LABEL.neutral;
                const label  = entry.label
                  ? (lang === 'pt' ? entry.label.pt : entry.label.en) || entry.tag
                  : entry.tag;
                return html`
                  <span class="tag-chip" style="background:${colors.bg};color:${colors.text}">
                    ${label}
                  </span>
                `;
              })}
            </div>
          `}
        </section>

        <!-- ── Coming soon ── -->
        <section class="st-section">
          <div class="st-section-header">
            <div class="st-section-title">${m.future}</div>
          </div>
          <div class="st-future-list">
            ${([
              { name: m.settingNotif,  desc: m.settingNotifD,  icon: '🔔' },
              { name: m.settingPerms,  desc: m.settingPermsD,  icon: '👥' },
              { name: m.settingExport, desc: m.settingExportD, icon: '📦' },
            ]).map(item => html`
              <div class="st-future-row">
                <div class="st-future-icon">${item.icon}</div>
                <div class="st-future-info">
                  <div class="st-future-name">${item.name}</div>
                  <div class="st-future-desc">${item.desc}</div>
                </div>
                <span class="st-soon-badge">soon</span>
              </div>
            `)}
          </div>
        </section>

      </div>
    `;
  }
}
