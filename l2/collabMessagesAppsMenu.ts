/// <mls fileReference="_102025_/l2/collabMessagesAppsMenu.ts" enhancement="_102027_/l2/enhancementLit" />

import { html } from 'lit';
import { customElement, state, property } from 'lit/decorators.js';
import { StateLitElement } from '/_102029_/l2/stateLitElement.js';

export interface IMenu {
    name: string;
    icon: string;
    project: number;
    path: string,
    menu: IMenuItem[];
}

export interface IMenuItem {
    title: string;
    icon: string;
    url: string;
    pageName: string;
    target?: string,
    children?: IMenuItem[];
}

type IFilter = 'all' | 'favorites' | 'history';

/// **collab_i18n_start**
const message_pt = {
    searchPlaceholder: 'Buscar...',
    filterAll: 'Todos',
    filterFavorites: 'Favoritos',
    filterHistory: 'Histórico',
    favoritesTitle: 'Favoritos',
    historyTitle: 'Histórico',
    emptyFavorites: 'Nenhum favorito.',
    emptyHistory: 'Nenhum acesso recente.',
    emptySearch: 'Nada encontrado.'
}

const message_en = {
    searchPlaceholder: 'Search...',
    filterAll: 'All',
    filterFavorites: 'Favorites',
    filterHistory: 'History',
    favoritesTitle: 'Favorites',
    historyTitle: 'History',
    emptyFavorites: 'No favorites.',
    emptyHistory: 'No recent access.',
    emptySearch: 'Nothing found.'
}

type MessageType = typeof message_en;
const messages: { [key: string]: MessageType } = {
    'en': message_en,
    'pt': message_pt
}
/// **collab_i18n_end**

const HISTORY_LIMIT = 20;

@customElement('collab-messages-apps-menu-102025')
export class CollabMessagesAppsMenu extends StateLitElement {

    private msg: MessageType = messages['en'];

    @property() keyFavoritesLocalStorage: string = 'menuFavorites';

    @property() keyHistoryLocalStorage: string = 'menuHistory';

    @property() identifier: string = '';

    @property() menuTitle: string = '';

    @state() menuModules: IMenu[] = [];

    @state() favorites: string[] = [];

    @state() history: string[] = [];

    @state() searchTerm: string = '';

    @state() activeFilter: IFilter = 'all';


    firstUpdated(_changedProperties: Map<PropertyKey, unknown>) {
        super.firstUpdated(_changedProperties);
        this.loadFavorites();
        this.loadHistory();
        this.loadFilter();
    }

    // Scope key isolates favorites/history per project. Falls back to identifier when
    // the menu has no modules loaded yet.
    private getScope(): string {
        const project = this.menuModules[0]?.project;
        if (project !== undefined && project !== null) return String(project);
        return this.identifier?.toString() || 'default';
    }

    private readStore(key: string): Record<string, string[]> {
        try {
            const raw = localStorage.getItem(key);
            const parsed = raw ? JSON.parse(raw) : {};
            return parsed && typeof parsed === 'object' ? parsed : {};
        } catch {
            return {};
        }
    }

    private loadFavorites() {
        this.favorites = this.readStore(this.keyFavoritesLocalStorage)[this.getScope()] ?? [];
    }

    private loadHistory() {
        this.history = this.readStore(this.keyHistoryLocalStorage)[this.getScope()] ?? [];
    }

    private loadFilter() {
        try {
            const raw = localStorage.getItem(this.keyFavoritesLocalStorage + 'Filter');
            const parsed = raw ? JSON.parse(raw) : {};
            const value = parsed?.[this.getScope()];
            if (value === 'all' || value === 'favorites' || value === 'history') this.activeFilter = value;
        } catch {
            // keep default
        }
    }

    private setFilter(filter: IFilter) {
        this.activeFilter = filter;
        try {
            const key = this.keyFavoritesLocalStorage + 'Filter';
            const stored = this.readStore(key) as unknown as Record<string, string>;
            stored[this.getScope()] = filter;
            localStorage.setItem(key, JSON.stringify(stored));
        } catch {
            // persisting the filter preference is best-effort
        }
    }

    private getItemPath(moduleItem: IMenu, item: IMenuItem): string {
        const findPath = (menu: IMenuItem[], target: IMenuItem, path: string[]): string[] | null => {
            for (const m of menu) {
                const currentPath = [...path, m.title];
                if (m === target) return currentPath;
                if (m.children) {
                    const found = findPath(m.children, target, currentPath);
                    if (found) return found;
                }
            }
            return null;
        };

        const path = findPath(moduleItem.menu, item, [moduleItem.name]);
        return path ? path.join('/') : moduleItem.name;
    }


    private toggleFavorite(moduleItem: IMenu, item: IMenuItem) {
        const key = this.getItemPath(moduleItem, item);
        const scope = this.getScope();

        const stored = this.readStore(this.keyFavoritesLocalStorage);
        if (!Array.isArray(stored[scope])) stored[scope] = [];

        const favorites = stored[scope];
        const index = favorites.indexOf(key);
        if (index >= 0) favorites.splice(index, 1);
        else favorites.push(key);

        stored[scope] = favorites;
        localStorage.setItem(this.keyFavoritesLocalStorage, JSON.stringify(stored));

        this.favorites = [...favorites];
        this.requestUpdate();
    }

    private isFavorite(moduleItem: IMenu, item: IMenuItem): boolean {
        const key = this.getItemPath(moduleItem, item);
        return this.favorites.includes(key);
    }

    // Records the opened item at the top of the history (most recent first, deduped, capped).
    private recordHistory(moduleItem: IMenu, item: IMenuItem) {
        const key = this.getItemPath(moduleItem, item);
        const scope = this.getScope();

        const stored = this.readStore(this.keyHistoryLocalStorage);
        const current = Array.isArray(stored[scope]) ? stored[scope] : [];
        const next = [key, ...current.filter(k => k !== key)].slice(0, HISTORY_LIMIT);

        stored[scope] = next;
        localStorage.setItem(this.keyHistoryLocalStorage, JSON.stringify(stored));
        this.history = next;
    }

    private handleMenuClick(moduleItem: IMenu, item: IMenuItem) {
        this.recordHistory(moduleItem, item);
        this.dispatchEvent(new CustomEvent('menu-selected', { detail: { ...item, project: moduleItem.project, module: moduleItem.name, path: moduleItem.path } }));
    }

    private onSearch(e: Event) {
        this.searchTerm = (e.target as HTMLInputElement).value ?? '';
    }

    // Case-insensitive title match used by search.
    private matchesSearch(title: string): boolean {
        const term = this.searchTerm.trim().toLowerCase();
        if (!term) return true;
        return title.toLowerCase().includes(term);
    }

    // Keeps items that match the search or have matching descendants.
    private filterItems(items: IMenuItem[]): IMenuItem[] {
        if (!this.searchTerm.trim()) return items;
        const result: IMenuItem[] = [];
        for (const item of items) {
            const children = item.children ? this.filterItems(item.children) : undefined;
            if (this.matchesSearch(item.title) || (children && children.length > 0)) {
                result.push({ ...item, children });
            }
        }
        return result;
    }

    private renderMenuItem(moduleItem: IMenu, item: IMenuItem): any {
        const hasChildren = item.children && item.children.length > 0;

        return html`
			<li class="menu-item">
				<div class="menu-item-header" @click=${() => this.handleMenuClick(moduleItem, item)}>
					<span class="icon" .innerHTML=${item.icon}></span>
					<span class="title">${item.title}</span>
					<span
						class="favorite ${this.isFavorite(moduleItem, item) ? 'active' : ''}"
						title="Favoritar"
						@click=${(e: Event) => {
                e.stopPropagation();
                this.toggleFavorite(moduleItem, item);
            }}
					>★</span>
				</div>

				${hasChildren
                ? html`
						<ul class="submenu">
							${item.children!.map(child => this.renderMenuItem(moduleItem, child))}
						</ul>
					`
                : null}
			</li>
		`;
    }

    render() {
        const lang = this.getMessageKey(messages);
        this.msg = messages[lang];

        return html`
			<div class="menu-container">
                ${this.renderToolbar()}
                ${this.renderContent()}
			</div>
		`;
    }

    private renderToolbar() {
        const filters: { id: IFilter, label: string }[] = [
            { id: 'all', label: this.msg.filterAll },
            { id: 'favorites', label: this.msg.filterFavorites },
            { id: 'history', label: this.msg.filterHistory }
        ];
        return html`
            <div class="apps-toolbar">
                <input
                    class="apps-search"
                    type="search"
                    .value=${this.searchTerm}
                    placeholder=${this.msg.searchPlaceholder}
                    @input=${(e: Event) => this.onSearch(e)}
                />
                <div class="apps-filters">
                    ${filters.map(f => html`
                        <button
                            class="apps-filter ${this.activeFilter === f.id ? 'active' : ''}"
                            @click=${() => this.setFilter(f.id)}
                        >${f.label}</button>
                    `)}
                </div>
            </div>
        `;
    }

    private renderContent() {
        if (this.activeFilter === 'favorites') return this.renderKeyList(this.favorites, this.msg.emptyFavorites, this.msg.favoritesTitle);
        if (this.activeFilter === 'history') return this.renderKeyList(this.history, this.msg.emptyHistory, this.msg.historyTitle);
        return this.renderModules();
    }

    // Renders a flat list (favorites/history) resolved from stored path keys.
    private renderKeyList(keys: string[], emptyLabel: string, title: string) {
        const resolved = keys
            .map(key => ({ key, ...this.findItemByPath(key) }))
            .filter(r => r.menuItem && r.moduleItem)
            .filter(r => this.matchesSearch((r.menuItem as IMenuItem).title) || this.matchesSearch(r.key.replace(/\//g, ' ')));

        return html`
            <h3>${title}</h3>
            ${resolved.length === 0
                ? html`<p class="empty">${this.searchTerm.trim() ? this.msg.emptySearch : emptyLabel}</p>`
                : html`
                    <ul class="favorites">
                        ${resolved.map(r => {
                            const pathDisplay = r.key.replace(/\//g, ' / ');
                            return html`
                                <li
                                    class="favorite-item"
                                    title=${pathDisplay}
                                    @click=${() => this.handleMenuClick(r.moduleItem as IMenu, r.menuItem as IMenuItem)}
                                >
                                    <span class="icon" .innerHTML=${(r.menuItem as IMenuItem).icon}></span>
                                    <span class="title">${pathDisplay}</span>
                                </li>
                            `;
                        })}
                    </ul>
                `}
        `;
    }

    private renderModules() {
        const searching = !!this.searchTerm.trim();
        const modules = this.menuModules
            .map(module => ({ module, items: this.filterItems(module.menu) }))
            .filter(m => !searching || m.items.length > 0);

        if (modules.length === 0) {
            return html`
                <h3>${this.menuTitle}</h3>
                <p class="empty">${this.msg.emptySearch}</p>
            `;
        }

        return html`
            <h3>${this.menuTitle}</h3>
            ${modules.map(({ module, items }) => html`
                <details class="menu-module" ?open=${searching}>
                    <summary>
                        <span class="icon" .innerHTML=${module.icon}></span>
                        <span class="name">${module.name}</span>
                    </summary>
                    <ul class="menu-list">
                        ${items.map(item => this.renderMenuItem(module, item))}
                    </ul>
                </details>
            `)}
        `;
    }

    private findItemByPath(path: string): {
        menuItem: IMenuItem | null,
        moduleItem: IMenu | undefined
    } {
        const parts = path.split('/');
        const moduleName = parts.shift();
        const module = this.menuModules.find(m => m.name === moduleName);
        if (!module) return {
            menuItem: null,
            moduleItem: undefined
        };

        let currentItems = module.menu;
        let found: IMenuItem | null = null;

        for (const part of parts) {
            found = currentItems.find(i => i.title === part) || null;
            if (!found) {
                return {
                    menuItem: null,
                    moduleItem: undefined
                };
            }
            currentItems = found.children || [];
        }

        return {
            menuItem: found,
            moduleItem: module
        }
    }
}
