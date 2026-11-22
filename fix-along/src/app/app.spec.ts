import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';

import { App } from './app';
import { routes } from './app.routes';

describe('App shell', () => {
  async function setup(url: string) {
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
    const fixture = TestBed.createComponent(App);
    await TestBed.inject(Router).navigateByUrl(url);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('has header, navigation and main landmarks', async () => {
    const el = await setup('/orders');
    expect(el.querySelectorAll('header')).toHaveLength(1);
    expect(el.querySelector('nav')?.getAttribute('aria-label')).toBe('Main');
    expect(el.querySelectorAll('main')).toHaveLength(1);
  });

  it('renders the page heading as the only h1, inside main', async () => {
    const el = await setup('/customers');
    const headings = el.querySelectorAll('h1');
    expect(headings).toHaveLength(1);
    expect(headings[0].textContent?.trim()).toBe('Customers');
    expect(headings[0].closest('main')).not.toBeNull();
  });

  it('marks the link to the current page with aria-current', async () => {
    const el = await setup('/customers');
    const current = el.querySelectorAll('nav [aria-current="page"]');
    expect(current).toHaveLength(1);
    expect(current[0].textContent?.trim()).toBe('Customers');
  });
});
