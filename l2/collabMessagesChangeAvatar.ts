/// <mls fileReference="_102025_/l2/collabMessagesChangeAvatar.ts" enhancement="_102027_/l2/enhancementLit" />

import { html, unsafeHTML, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { defaultThreadImage } from '/_102025_/l2/collabMessagesHelper.js';
import { environment } from '/_102036_/l2/environmentContract.js';
import { StateLitElement } from '/_102029_/l2/stateLitElement.js';

/// **collab_i18n_start** 
const message_pt = {
  changeAvatar: "Alterar avatar",
  changeButton: "Trocar imagem",
  generateButton: "Gerar com IA",
  panelTitle: "Gerar Avatar com IA",
  generateLabel: "Descreva o avatar",
  generatePlaceholder: "Digite aqui sua descrição...",
  actionGenerate: "Gerar",
  saveButton: "Salvar",
  cancelButton: "Cancelar",
  generating: "Gerando..."
}

const message_en = {
  changeAvatar: "Change avatar",
  changeButton: "Change image",
  generateButton: "Generate with AI",
  panelTitle: "Generate Avatar with AI",
  generateLabel: "Describe the avatar",
  generatePlaceholder: "Type your description here...",
  actionGenerate: "Generate",
  saveButton: "Save",
  cancelButton: "Cancel",
  generating: "Generating..."
}

type MessageType = typeof message_en;
const messages: { [key: string]: MessageType } = {
  'en': message_en,
  'pt': message_pt
}
/// **collab_i18n_end**


@customElement("collab-messages-change-avatar-102025")
export class CollabChangeAvatar extends StateLitElement {

  private msg: MessageType = messages['en'];

  @property({ type: String }) value?: string;
  @property({ type: String }) userId: string = "20250417120841.1000";
  @property({ type: String }) threadId: string = "20250825143728.1000";

  @state() private avatarPrompt: string = "";

  @state() private avatarFile?: File;
  @state() private isOpen: boolean = false;
  @state() private generating: boolean = false;
  @state() private preview?: string;

  firstUpdated(_changedProperties: Map<PropertyKey, unknown>) {
    super.firstUpdated(_changedProperties)
    this.preview = this.value || defaultThreadImage;
  }

  render() {

    const lang = this.getMessageKey(messages);
    this.msg = messages[lang];

    const svgGenerateEnabled = environment.config.generateSvgAvatarEnabled();

    return html`
    <div class="avatar-section">
      <div class="preview">
        ${this.preview
        ? this.preview.startsWith("<svg")
          ? html`${this.safeSvg(this.preview)}`
          : html`<img src="${this.preview}" alt="Avatar" />`
        : this.value
          ? this.value.startsWith("<svg")
            ? html`${this.safeSvg(this.value)}`
            : html`<img src="${this.value}" alt="Avatar" />`
          : html`<div class="placeholder">?</div>`}
      </div>

      <div class="actions-avatar">
        <a style="display:none"  href="#" class="btn" @click=${this.triggerFileInput}>${this.msg.changeButton}</a>
        <input 
          type="file" 
          accept="image/*" 
          class="hidden-file-input"
          @change=${this.onFileSelect}
        />
        ${svgGenerateEnabled ? html`  <a href="#" class="btn" @click=${(e: MouseEvent) => { e.preventDefault(); this.isOpen = true }}>
          ${this.msg.generateButton}
        </a>` : nothing}
      
      </div>
    </div>

    ${this.isOpen ? html`
      <div class="panel">
        <h4>${this.msg.panelTitle}</h4>

        <label>${this.msg.generateLabel}</label>
        <textarea
          placeholder=${this.msg.generatePlaceholder}
          .value=${this.avatarPrompt}
          @input=${(e: Event) => this.avatarPrompt = (e.target as HTMLTextAreaElement).value}
        ></textarea>

        <div class="actions-ia">
          <button ?disabled=${this.generating} @click=${this.generateAvatarFromPrompt}>
            ${this.generating ? html`<span class="loader"></span>` : this.msg.actionGenerate}
          </button>
          <button @click=${() => this.isOpen = false}>${this.msg.cancelButton}</button>
        </div>
      </div>
    ` : ""}
  `;
  }


  private onFileSelect(e: Event) {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.avatarFile = input.files[0];
      this.preview = URL.createObjectURL(this.avatarFile);
    }
  }

  private triggerFileInput(e: MouseEvent) {
    e.preventDefault();
    const input = this.querySelector<HTMLInputElement>(".hidden-file-input");
    input?.click();
  }

  private async generateAvatarFromPrompt() {
    if (!this.avatarPrompt) return;
    this.generating = true;

    try {

      const svgStr = await environment.agents.generateSvgAvatar(this.threadId, this.userId, this.avatarPrompt);
      if (!svgStr) return;
      this.preview = svgStr;
      this.emitValueChanged(this.preview);

    } catch (err: any) {
      console.error("Erro ao gerar avatar via IA", err);
    } finally {
      this.generating = false;
    }
  }

  private emitValueChanged(value: string) {
    this.dispatchEvent(new CustomEvent('value-changed', {
      detail: value,
      bubbles: true,
      composed: true
    }));
  }


  private safeSvg(svg: string) {
    return html`${unsafeHTML(svg)}`;
  }
}
