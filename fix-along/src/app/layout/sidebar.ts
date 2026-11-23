import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { REPORTS } from '../data';
import { Icon } from './icon';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, Icon],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  protected readonly reports = REPORTS;
  protected readonly reportsOpen = signal(false);

  protected toggleReports(): void {
    this.reportsOpen.update((open) => !open);
  }
}
