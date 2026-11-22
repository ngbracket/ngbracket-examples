import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Icon } from './icon';

@Component({
  selector: 'app-header',
  imports: [RouterLink, Icon],
  template: `
    <a class="brand" routerLink="/orders">
      <app-icon name="logo" />
      <span>Ops</span>
    </a>
    <div class="actions">
      <button type="button" class="icon-button">
        <app-icon name="bell" />
      </button>
      <button type="button" class="icon-button">
        <app-icon name="help" />
      </button>
      <button type="button" class="icon-button">
        <app-icon name="settings" />
      </button>
    </div>
  `,
  styles: `
    :host {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.5rem 1rem;
    }

    .brand {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--accent);
      font-weight: 700;
      font-size: 1.125rem;
      text-decoration: none;
    }

    .actions {
      display: flex;
      gap: 0.25rem;
    }

    .icon-button {
      display: inline-grid;
      place-items: center;
      width: 2.5rem;
      height: 2.5rem;
      border: 0;
      border-radius: 0.5rem;
      background: transparent;
      color: var(--text);
      cursor: pointer;
    }

    .icon-button:hover {
      background: var(--surface-alt);
    }
  `,
})
export class Header {}
