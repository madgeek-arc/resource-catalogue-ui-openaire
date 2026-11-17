import {TestBed} from '@angular/core/testing';
import {ActivatedRouteSnapshot, RouterStateSnapshot} from '@angular/router';
import {firstValueFrom, Observable, of} from 'rxjs';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {UserInfo} from '../entities/userInfo';
import {CanActivateViaAuthGuard} from './can-activate-auth-guard.service';
import {CanActivateViaPubGuard} from './can-activate-pub-guard.service';
import {NavigationService} from './navigation.service';
import {UserSessionService} from './user-session.service';

const route = {} as ActivatedRouteSnapshot;
const state = (url: string) => ({url}) as RouterStateSnapshot;
const signedIn = {sub: 's', name: 'Ada'} as UserInfo;

describe('route guards', () => {
  let session: {ready$: Observable<UserInfo | null>; login: ReturnType<typeof vi.fn>};
  let navigation: {home: ReturnType<typeof vi.fn>};

  const setUp = (user: UserInfo | null) => {
    session = {ready$: of(user), login: vi.fn()};
    navigation = {home: vi.fn().mockResolvedValue(true)};
    TestBed.configureTestingModule({
      providers: [
        CanActivateViaAuthGuard,
        CanActivateViaPubGuard,
        {provide: UserSessionService, useValue: session},
        {provide: NavigationService, useValue: navigation},
      ],
    });
  };

  beforeEach(() => TestBed.resetTestingModule());

  describe('CanActivateViaAuthGuard', () => {
    it('lets a signed-in user through', async () => {
      setUp(signedIn);
      const allowed = await firstValueFrom(TestBed.inject(CanActivateViaAuthGuard).canActivate(route, state('/provider/my')));

      expect(allowed).toBe(true);
      expect(session.login).not.toHaveBeenCalled();
    });

    it('sends a signed-out visitor to log in, returning to the page they asked for', async () => {
      setUp(null);
      const allowed = await firstValueFrom(TestBed.inject(CanActivateViaAuthGuard).canActivate(route, state('/provider/my?tab=2')));

      expect(allowed).toBe(false);
      expect(session.login).toHaveBeenCalledWith('/provider/my?tab=2');
    });
  });

  describe('CanActivateViaPubGuard', () => {
    it('lets a signed-out visitor through', async () => {
      setUp(null);
      const allowed = await firstValueFrom(TestBed.inject(CanActivateViaPubGuard).canActivate(route, state('/join')));

      expect(allowed).toBe(true);
      expect(navigation.home).not.toHaveBeenCalled();
    });

    it('sends a signed-in user home', async () => {
      setUp(signedIn);
      const allowed = await firstValueFrom(TestBed.inject(CanActivateViaPubGuard).canActivate(route, state('/join')));

      expect(allowed).toBe(false);
      expect(navigation.home).toHaveBeenCalledTimes(1);
    });
  });
});
