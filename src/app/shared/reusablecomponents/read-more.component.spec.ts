import {ChangeDetectionStrategy, Component, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {ReadMoreComponent, ReadMoreTextComponent} from './read-more.component';

// jsdom does no layout, so offsetHeight is always 0. Each test sets the height the content would have.
let contentHeight = 0;

// The host is Eager like the pages that use these components, so a host check refreshes the children
// only when they marked themselves for check (OnPush) or read a changed signal.
@Component({
  imports: [ReadMoreComponent, ReadMoreTextComponent],
  template: `
    <read-more [maxHeight]="100"><p>Projected content</p></read-more>
    <read-more-text [maxHeight]="46" [text]="text()" />
  `,
  changeDetection: ChangeDetectionStrategy.Eager
})
class HostComponent {
  readonly text = signal('<p>Description</p>');
}

describe('ReadMoreComponent', () => {
  let offsetHeight: PropertyDescriptor | undefined;

  beforeEach(() => {
    vi.useFakeTimers();
    offsetHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetHeight');
    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {configurable: true, get: () => contentHeight});
  });

  afterEach(() => {
    vi.useRealTimers();
    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', offsetHeight!);
  });

  const setUp = () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement;
    return {
      fixture, root,
      box: (selector: string) => root.querySelector<HTMLElement>(`${selector} > div`)!,
      link: (selector: string) => root.querySelector<HTMLAnchorElement>(`${selector} > a`),
    };
  };

  it('collapses content taller than maxHeight and toggles it with the link', () => {
    contentHeight = 300;
    const {fixture, box, link} = setUp();
    expect(link('read-more')).toBeNull();

    vi.advanceTimersByTime(200);
    fixture.detectChanges();

    for (const selector of ['read-more', 'read-more-text']) {
      expect(box(selector).classList).toContain('collapsed');
      expect(link(selector)!.textContent).toBe('View more...');
    }
    expect(box('read-more').style.height).toBe('100px');
    expect(box('read-more-text').style.height).toBe('46px');
    expect(box('read-more-text').innerHTML).toBe('<p>Description</p>');

    link('read-more')!.click();
    fixture.detectChanges();
    expect(box('read-more').classList).not.toContain('collapsed');
    expect(box('read-more').style.height).toBe('auto');
    expect(link('read-more')!.textContent).toBe('View less...');
    expect(box('read-more-text').classList).toContain('collapsed');
  });

  it('leaves content within maxHeight expanded with no link', () => {
    contentHeight = 40;
    const {fixture, box, link} = setUp();
    vi.advanceTimersByTime(200);
    fixture.detectChanges();

    for (const selector of ['read-more', 'read-more-text']) {
      expect(box(selector).classList).not.toContain('collapsed');
      expect(link(selector)).toBeNull();
    }
  });

  it('measures read-more-text again when its text changes', () => {
    contentHeight = 40;
    const {fixture, box, link} = setUp();
    vi.advanceTimersByTime(200);
    fixture.detectChanges();
    expect(link('read-more-text')).toBeNull();

    contentHeight = 300;
    fixture.componentInstance.text.set('<p>A much longer description</p>');
    fixture.detectChanges();
    vi.advanceTimersByTime(200);
    fixture.detectChanges();

    expect(box('read-more-text').innerHTML).toBe('<p>A much longer description</p>');
    expect(link('read-more-text')!.textContent).toBe('View more...');
  });
});
