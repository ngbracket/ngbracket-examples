import { TestBed } from '@angular/core/testing';

import { Orders } from './orders';

function setup() {
  const fixture = TestBed.createComponent(Orders);
  fixture.detectChanges();
  const el: HTMLElement = fixture.nativeElement;
  const orderIds = () =>
    Array.from(el.querySelectorAll('tbody tr td:nth-child(2)')).map((td) => td.textContent?.trim());
  return { fixture, el, orderIds };
}

describe('Orders', () => {
  it('lists the newest orders first', () => {
    const { orderIds } = setup();
    expect(orderIds().slice(0, 3)).toEqual(['#1042', '#1041', '#1040']);
  });

  it('filters by customer name', async () => {
    const { fixture, el, orderIds } = setup();
    const filter = el.querySelector<HTMLInputElement>('input[type="search"]')!;
    filter.value = 'grace';
    filter.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(orderIds()).toEqual(['#1036']);
  });

  it('sorts by highest total', async () => {
    const { fixture, el, orderIds } = setup();
    const sort = el.querySelector('select')!;
    sort.value = 'total';
    sort.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    expect(orderIds().slice(0, 2)).toEqual(['#1040', '#1036']);
  });

  it('selects every visible row from the header checkbox', async () => {
    const { fixture, el } = setup();
    el.querySelector<HTMLInputElement>('thead input[type="checkbox"]')!.click();
    await fixture.whenStable();
    const rows = Array.from(el.querySelectorAll<HTMLInputElement>('tbody input[type="checkbox"]'));
    expect(rows.length).toBe(8);
    expect(rows.every((box) => box.checked)).toBe(true);
  });

  it('labels the filter and the sort', () => {
    const { el } = setup();
    const filter = el.querySelector<HTMLInputElement>('input[type="search"]')!;
    const sort = el.querySelector('select')!;
    expect(filter.labels?.[0]?.textContent?.trim()).toBe('Filter by customer');
    expect(sort.labels?.[0]?.textContent?.trim()).toBe('Sort');
  });

  it('names each checkbox after its row', () => {
    const { el } = setup();
    const boxes = Array.from(el.querySelectorAll('input[type="checkbox"]'));
    expect(boxes.map((box) => box.getAttribute('aria-label')).slice(0, 3)).toEqual([
      'Select all orders',
      'Select order 1042',
      'Select order 1041',
    ]);
  });
});
