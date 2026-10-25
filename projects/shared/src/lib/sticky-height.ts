import {
  DOCUMENT,
  DestroyRef,
  Directive,
  ElementRef,
  afterNextRender,
  inject,
} from '@angular/core';

/**
 * Writes the host's rendered height to `--app-sticky-h` on `<html>` and keeps it
 * current, for `html { scroll-padding-top }`. Put it on a sticky header so a
 * newly focused element is scrolled clear of it, however tall the header gets
 * (wrapped text, an open mobile menu). WCAG 2.4.11 Focus Not Obscured.
 *
 * ```html
 * <header class="topbar" appStickyHeight>…</header>
 * ```
 */
@Directive({ selector: '[appStickyHeight]' })
export class StickyHeight {
  constructor() {
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const root = inject(DOCUMENT).documentElement;
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      if (typeof ResizeObserver === 'undefined') return;
      const observer = new ResizeObserver(([entry]) => {
        const height = entry?.borderBoxSize?.[0]?.blockSize ?? host.getBoundingClientRect().height;
        root.style.setProperty('--app-sticky-h', `${height}px`);
      });
      observer.observe(host, { box: 'border-box' });
      destroyRef.onDestroy(() => {
        observer.disconnect();
        root.style.removeProperty('--app-sticky-h');
      });
    });
  }
}
