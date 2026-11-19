import {ChangeDetectionStrategy, Component} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {provideRouter, Router} from '@angular/router';
import {BehaviorSubject, Subject} from 'rxjs';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {Provider} from '../../entities/eic-model';
import {UserInfo} from '../../entities/userInfo';
import {DataSharingService} from '../../services/data-sharing.service';
import {ResourceService} from '../../services/resource.service';
import {UserSessionService} from '../../services/user-session.service';
import {UserService} from '../../services/user.service';
import {AireTopMenuComponent} from './topmenu.component';

// The host is Eager like AppComponent, so a host check refreshes the menu only when it marked itself
// for check (OnPush) or read a changed signal.
@Component({
  imports: [AireTopMenuComponent],
  template: '<app-top-menu-aire />',
  changeDetection: ChangeDetectionStrategy.Eager
})
class HostComponent {}

@Component({template: ''})
class EmptyComponent {}

const ada = {sub: '1', name: 'Ada', surname: 'Lovelace', fullname: 'Ada Lovelace', email: 'ada@example.org', roles: ['USER']} as unknown as UserInfo;
const admin = {...ada, roles: ['ADMIN']} as unknown as UserInfo;

describe('AireTopMenuComponent', () => {
  let user$: BehaviorSubject<UserInfo | null>;
  let loading$: BehaviorSubject<boolean>;
  let providers: Subject<Provider[]>;
  let resources: Subject<Record<string, {id: string, name: string}[]>>;
  let session: {user$: BehaviorSubject<UserInfo | null>, loading$: BehaviorSubject<boolean>, displayName: string, login: ReturnType<typeof vi.fn>, logout: ReturnType<typeof vi.fn>};

  beforeEach(() => {
    user$ = new BehaviorSubject<UserInfo | null>(null);
    loading$ = new BehaviorSubject(true);
    providers = new Subject<Provider[]>();
    resources = new Subject();
    session = {
      user$, loading$,
      get displayName() { return user$.value?.fullname ?? ''; },
      login: vi.fn(), logout: vi.fn()
    };
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          {path: '', component: EmptyComponent},
          {path: 'dashboard', component: EmptyComponent, data: {dashboardMode: true}}
        ]),
        {provide: UserSessionService, useValue: session},
        {provide: UserService, useValue: {getMyProviders: () => providers}},
        {provide: ResourceService, useValue: {getResourcesGroupedByField: () => resources}},
        // A fresh one per test: the real service is a root singleton that starts with refreshRequired = true.
        {provide: DataSharingService, useValue: {refreshRequired: new BehaviorSubject(true)}}
      ]
    });
  });

  const setUp = () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement;
    const text = (selector: string) => root.querySelector(selector)?.textContent!.replace(/\s+/g, ' ').trim() ?? null;
    const loginLink = () => [...root.querySelectorAll('a')].find(a => a.textContent!.includes('Login')) ?? null;
    return {fixture, root, text, loginLink};
  };

  it('shows neither Login nor the user menu while the session is loading', () => {
    const {root, loginLink} = setUp();
    expect(loginLink()).toBeNull();
    expect(root.querySelector('.user_actions')).toBeNull();
  });

  it('shows Login once the session answers signed out, and logs in on click', () => {
    const {fixture, root, loginLink} = setUp();
    loading$.next(false);
    fixture.detectChanges();

    expect(root.querySelector('.user_actions')).toBeNull();
    loginLink()!.click();
    expect(session.login).toHaveBeenCalled();
  });

  it('shows the signed-in user, then their providers when they arrive', () => {
    const {fixture, root, text, loginLink} = setUp();
    loading$.next(false);
    user$.next(ada);
    fixture.detectChanges();

    expect(loginLink()).toBeNull();
    expect(text('.user_actions svg text')).toBe('AL');
    expect(text('#userActions .uk-text-bold')).toBe('Ada Lovelace');
    expect(text('#userActions .uk-text-meta')).toBe('ada@example.org');
    expect(root.querySelectorAll('#userActions li.groups').length).toBe(0);

    providers.next([{id: 'openaire', name: 'OpenAIRE'}, {id: 'cern', name: 'CERN'}] as Provider[]);
    fixture.detectChanges();

    const links = [...root.querySelectorAll<HTMLAnchorElement>('#userActions li.groups a')];
    expect(links.map(a => a.textContent!.replace('group', '').trim())).toEqual(['OpenAIRE', 'CERN']);
    expect(links[0].getAttribute('href')).toBe('/provider/openaire/dashboard/home');
    expect(text('#userActions')).not.toContain('Admin pages');
  });

  it('links admins to the admin pages', () => {
    const {fixture, text} = setUp();
    loading$.next(false);
    user$.next(admin);
    fixture.detectChanges();
    expect(text('#userActions')).toContain('Admin pages');
  });

  it('clears the user menu and the providers when the user signs out', () => {
    const {fixture, root, loginLink} = setUp();
    loading$.next(false);
    user$.next(ada);
    providers.next([{id: 'openaire', name: 'OpenAIRE'}] as Provider[]);
    fixture.detectChanges();
    expect(root.querySelectorAll('#userActions li.groups').length).toBe(1);

    user$.next(null);
    fixture.detectChanges();
    expect(root.querySelector('.user_actions')).toBeNull();
    expect(loginLink()).not.toBeNull();
  });

  it('lists the portfolios and their services in the Browse dropdown when they arrive', () => {
    const {fixture, root} = setUp();
    expect(root.querySelectorAll('#ukDrop h6').length).toBe(0);

    resources.next({
      'Portfolio A': [{id: 'openaire.argos', name: 'Argos'}, {id: 'cern.zenodo', name: 'Zenodo'}],
      'Portfolio B': []
    });
    resources.complete();
    fixture.detectChanges();

    expect([...root.querySelectorAll('#ukDrop h6')].map(h => h.textContent)).toEqual(['Portfolio A']);
    expect([...root.querySelectorAll('#ukDrop .uk-navbar-dropdown-close a')].map(a => a.textContent)).toEqual(['Argos', 'Zenodo']);
    expect([...root.querySelectorAll('#module-menu-mobile h6')].map(h => h.textContent)).toEqual(['Portfolio A', 'Portfolio B']);
    expect(TestBed.inject(DataSharingService).refreshRequired.value).toBe(false);
  });

  it('loads the portfolios again on the next refresh after a failed load', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const {fixture, root} = setUp();
    const refreshRequired = TestBed.inject(DataSharingService).refreshRequired;

    resources.error('server down');
    expect(consoleError).toHaveBeenCalledWith('server down');
    expect(refreshRequired.value).toBe(true);

    resources = new Subject();
    refreshRequired.next(true);
    resources.next({'Portfolio A': [{id: 'openaire.argos', name: 'Argos'}]});
    fixture.detectChanges();

    expect([...root.querySelectorAll('#ukDrop h6')].map(h => h.textContent)).toEqual(['Portfolio A']);
    consoleError.mockRestore();
  });

  it('pins the menu on dashboard routes', async () => {
    const {fixture, root} = setUp();
    const router = TestBed.inject(Router);
    const menu = () => root.querySelector('.main-menu')!;

    await router.navigateByUrl('/dashboard');
    fixture.detectChanges();
    expect(menu().classList).toContain('fixed-navbar');

    await router.navigateByUrl('/');
    fixture.detectChanges();
    expect(menu().classList).not.toContain('fixed-navbar');
  });

  it('unpins the menu when a page has turned off route reuse', async () => {
    const {fixture, root} = setUp();
    const router = TestBed.inject(Router);
    const menu = () => root.querySelector('.main-menu')!;

    // ProviderHomeComponent does this, so every later navigation builds a new root ActivatedRoute.
    await router.navigateByUrl('/dashboard');
    router.routeReuseStrategy.shouldReuseRoute = () => false;
    fixture.detectChanges();
    expect(menu().classList).toContain('fixed-navbar');

    await router.navigateByUrl('/');
    fixture.detectChanges();
    expect(menu().classList).not.toContain('fixed-navbar');
  });

  it('switches the mobile menu between the portfolio list and one portfolio', () => {
    const {fixture, root} = setUp();
    resources.next({'Portfolio A': [{id: 'openaire.argos', name: 'Argos'}]});
    fixture.detectChanges();
    const list = () => root.querySelector('#module-menu-mobile > div')!;
    expect(list().classList).toContain('uk-display-block');

    root.querySelector<HTMLAnchorElement>('#module-menu-mobile a')!.click();
    fixture.detectChanges();
    expect(list().classList).toContain('uk-display-none');
    expect(list().classList).not.toContain('uk-display-block');
  });
});
