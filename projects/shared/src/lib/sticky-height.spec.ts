import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { StickyHeight } from './sticky-height';

@Component({
  imports: [StickyHeight],
  template: `<header appStickyHeight>Header</header>`,
})
class Host {}

describe('StickyHeight', () => {
  const original = globalThis.ResizeObserver;
  let observed: { el: Element; resize: (h: number) => void; disconnected: boolean }[] = [];

  beforeEach(() => {
    observed = [];
    // jsdom has no ResizeObserver; this one reports a border-box height on demand.
    globalThis.ResizeObserver = class {
      private entry?: (typeof observed)[number];
      constructor(private readonly callback: ResizeObserverCallback) {}
      observe(el: Element): void {
        const resize = (h: number) =>
          this.callback(
            [
              {
                target: el,
                borderBoxSize: [{ blockSize: h, inlineSize: 0 }],
              } as unknown as ResizeObserverEntry,
            ],
            this as unknown as ResizeObserver,
          );
        this.entry = { el, resize, disconnected: false };
        observed.push(this.entry);
      }
      unobserve(): void {}
      disconnect(): void {
        if (this.entry) this.entry.disconnected = true;
      }
    } as unknown as typeof ResizeObserver;
  });

  afterEach(() => {
    globalThis.ResizeObserver = original;
    document.documentElement.style.removeProperty('--app-sticky-h');
  });

  it('writes the host height to --app-sticky-h, follows resizes and clears it on destroy', async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await fixture.whenStable();

    const root = document.documentElement;
    expect(observed.length).toBe(1);
    expect(observed[0].el.tagName).toBe('HEADER');

    observed[0].resize(64);
    expect(root.style.getPropertyValue('--app-sticky-h')).toBe('64px');
    // A wrapped bar or an open menu makes it taller.
    observed[0].resize(180);
    expect(root.style.getPropertyValue('--app-sticky-h')).toBe('180px');

    fixture.destroy();
    expect(observed[0].disconnected).toBe(true);
    expect(root.style.getPropertyValue('--app-sticky-h')).toBe('');
  });
});
