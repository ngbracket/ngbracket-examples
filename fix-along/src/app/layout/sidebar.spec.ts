import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Sidebar } from './sidebar';

describe('Sidebar', () => {
  function setup() {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(Sidebar);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const toggle = Array.from(el.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Reports'),
    )!;
    const reportLinks = () => el.querySelectorAll('a[href^="/reports/"]');
    return { fixture, toggle, reportLinks };
  }

  it('keeps collapsed report links out of the page, so Tab skips them', () => {
    const { toggle, reportLinks } = setup();
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(reportLinks().length).toBe(0);
  });

  it('shows the report links when the menu is expanded', async () => {
    const { fixture, toggle, reportLinks } = setup();
    toggle.click();
    await fixture.whenStable();
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(reportLinks().length).toBe(5);
  });
});
