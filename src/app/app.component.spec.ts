import {Component} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {provideRouter, Router, RouterOutlet} from '@angular/router';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {AppComponent} from './app.component';

// The menu, footer and banner need the app's services; these stand in for them.
@Component({selector: 'app-top-menu-aire', template: 'menu'})
class TopMenuStubComponent {}

@Component({selector: 'app-footer-aire', template: 'footer'})
class FooterStubComponent {}

@Component({selector: 'app-cookie-consent', template: 'cookies'})
class CookieConsentStubComponent {}

@Component({template: 'page'})
class PageComponent {}

describe('AppComponent', () => {
  let scrollTo: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
    TestBed.configureTestingModule({
      providers: [provideRouter([
        {path: 'home', component: PageComponent},
        {path: 'changeLogClean', component: PageComponent},
        {path: 'provider/:providerId/dashboard', component: PageComponent}
      ])]
    });
    TestBed.overrideComponent(AppComponent, {
      set: {imports: [RouterOutlet, TopMenuStubComponent, FooterStubComponent, CookieConsentStubComponent]}
    });
  });

  afterEach(() => scrollTo.mockRestore());

  const open = async (url: string) => {
    const fixture = TestBed.createComponent(AppComponent);
    const router = TestBed.inject(Router);
    fixture.detectChanges();
    const go = async (next: string) => {
      await router.navigateByUrl(next);
      fixture.detectChanges();
    };
    await go(url);
    const root: HTMLElement = fixture.nativeElement;
    const text = () => root.textContent!.replace(/\s+/g, ' ').trim();
    const footer = () => root.querySelector('app-footer-aire');
    return {root, go, text, footer};
  };

  it('shows the menu, the page, the footer and the cookie banner', async () => {
    const {text, footer} = await open('/home');
    expect(text()).toBe('menupagefootercookies');
    expect(footer()!.parentElement!.style.marginLeft).toBe('');
  });

  it('shows the clean change log alone, and the rest again on leaving it', async () => {
    const {go, text} = await open('/changeLogClean');
    expect(text()).toBe('page');

    await go('/home');
    expect(text()).toBe('menupagefootercookies');
  });

  it('moves the footer clear of the dashboard sidebar', async () => {
    const {go, footer} = await open('/provider/openaire/dashboard');
    expect(getComputedStyle(footer()!.parentElement!).marginLeft).toBe('320px');

    await go('/home');
    expect(getComputedStyle(footer()!.parentElement!).marginLeft).not.toBe('320px');
  });

  it('scrolls to the top after each navigation', async () => {
    const {go} = await open('/home');
    expect(scrollTo).toHaveBeenCalledTimes(1);

    await go('/changeLogClean');
    expect(scrollTo).toHaveBeenCalledTimes(2);
    expect(scrollTo).toHaveBeenLastCalledWith(0, 0);
  });
});
