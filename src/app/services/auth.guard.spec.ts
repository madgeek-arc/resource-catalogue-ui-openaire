import {TestBed} from '@angular/core/testing';
import {ActivatedRouteSnapshot, RouterStateSnapshot} from '@angular/router';
import {firstValueFrom, Observable, of} from 'rxjs';
import {describe, expect, it, vi} from 'vitest';
import {UserInfo} from '../entities/userInfo';
import {authGuard} from './auth.guard';
import {UserSessionService} from './user-session.service';

const route = {} as ActivatedRouteSnapshot;
const state = (url: string) => ({url}) as RouterStateSnapshot;

describe('authGuard', () => {
  const run = (user: UserInfo | null, url: string) => {
    const session = {ready$: of(user), login: vi.fn()};
    TestBed.configureTestingModule({providers: [{provide: UserSessionService, useValue: session}]});
    const result = TestBed.runInInjectionContext(() => authGuard(route, state(url))) as Observable<boolean>;
    return {session, allowed: firstValueFrom(result)};
  };

  it('lets a signed-in user through', async () => {
    const {session, allowed} = run({sub: 's', name: 'Ada'} as UserInfo, '/provider/my');

    expect(await allowed).toBe(true);
    expect(session.login).not.toHaveBeenCalled();
  });

  it('sends a signed-out visitor to log in, returning to the page they asked for', async () => {
    const {session, allowed} = run(null, '/provider/my?tab=2');

    expect(await allowed).toBe(false);
    expect(session.login).toHaveBeenCalledWith('/provider/my?tab=2');
  });
});
