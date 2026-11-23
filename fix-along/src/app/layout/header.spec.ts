import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Header } from './header';

describe('Header', () => {
  function setup() {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(Header);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('names every icon-only button', () => {
    const names = Array.from(setup().querySelectorAll('button')).map((b) =>
      b.getAttribute('aria-label'),
    );
    expect(names).toEqual(['Notifications', 'Help', 'Settings']);
  });

  it('hides the icons from assistive technology', () => {
    const icons = Array.from(setup().querySelectorAll('svg'));
    expect(icons.length).toBeGreaterThan(0);
    for (const svg of icons) {
      expect(svg.getAttribute('aria-hidden')).toBe('true');
      expect(svg.hasAttribute('role')).toBe(false);
    }
  });
});
