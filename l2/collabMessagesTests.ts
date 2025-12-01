/// <mls shortName="collabMessagesTests" project="102025" enhancement="_100554_enhancementLit" />

import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { StateLitElement } from '_100554_/l2/stateLitElement';

@customElement('collab-messages-tests-102025')
export class CollabMessagesTests100000 extends StateLitElement {

    @property() name: string = 'Somebody';

    render() {
        return html`<p> Hello, ${this.name} !</p>`;
    }
}

