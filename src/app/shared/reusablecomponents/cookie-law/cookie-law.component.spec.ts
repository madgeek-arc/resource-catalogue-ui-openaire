import {ChangeDetectionStrategy, Component, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {provideNoopAnimations} from '@angular/platform-browser/animations';
import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import {CookieLawComponent, CookieLawPosition} from './cookie-law.component';

// The host is OnPush like AppComponent, so a host check refreshes the banner only when it
// marked itself for check or read a changed signal.
@Component({
  imports: [CookieLawComponent],
  template: `
    <cookie-law [position]="position()" (isSeen)="seenEvents.push($event)">
      <span class="projected">Projected text</span>
    </cookie-law>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
class HostComponent {
  readonly position = signal<CookieLawPosition>('bottom');
  readonly seenEvents: boolean[] = [];
}

// No projected content, so the banner falls back to its own text.
@Component({
  imports: [CookieLawComponent],
  template: `<cookie-law learnMore="/privacy" />`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
class EmptyHostComponent {}

const clearCookie = () => {
  document.cookie = 'cookieLawSeen=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
};

describe('CookieLawComponent', () => {
  beforeEach(() => {
    clearCookie();
    TestBed.configureTestingModule({providers: [provideNoopAnimations()]});
  });

  afterEach(clearCookie);

  const setUp = (configure?: (host: HostComponent) => void) => {
    const fixture = TestBed.createComponent(HostComponent);
    configure?.(fixture.componentInstance);
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement;
    return {
      fixture, root,
      host: root.querySelector<HTMLElement>('cookie-law')!,
      wrapper: () => root.querySelector<HTMLElement>('.cookie-law-wrapper'),
    };
  };

  it('shows the projected text at the bottom when the cookie is not set', () => {
    const {host, wrapper} = setUp();
    expect(wrapper()).not.toBeNull();
    expect(wrapper()!.querySelector('.projected')!.textContent).toBe('Projected text');
    expect(wrapper()!.style.top).toBe('');
    expect(host.hasAttribute('seen')).toBe(false);
  });

  it('shows nothing and marks the host as seen when the cookie is set', () => {
    document.cookie = 'cookieLawSeen=true; path=/';
    const {host, wrapper} = setUp();
    expect(wrapper()).toBeNull();
    expect(host.getAttribute('seen')).toBe('true');
  });

  it('sticks to the top when position is "top"', () => {
    const {wrapper} = setUp(host => host.position.set('top'));
    expect(wrapper()!.style.top).toBe('0px');
    expect(wrapper()!.style.bottom).toBe('initial');
  });

  it('shows the default text with the learn more link when nothing is projected', () => {
    const fixture = TestBed.createComponent(EmptyHostComponent);
    fixture.detectChanges();
    const wrapper = () => (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>('.cookie-law-wrapper');
    const link = wrapper()!.querySelector<HTMLAnchorElement>('.copy a[target]')!;
    expect(wrapper()!.textContent).toContain("you're agreeing to our use of cookies");
    expect(link.getAttribute('href')).toBe('/privacy');
    expect(link.getAttribute('target')).toBe('_blank');
  });

  it('stores the cookie on dismiss and reports it once the banner has slid out', async () => {
    const {fixture, host, wrapper} = setUp();
    wrapper()!.querySelector<HTMLAnchorElement>('a.dismiss')!.click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(document.cookie).toContain('cookieLawSeen=true');
    expect(host.getAttribute('seen')).toBe('true');
    expect(fixture.componentInstance.seenEvents).toEqual([true]);
  });
});
