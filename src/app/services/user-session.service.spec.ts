import {provideHttpClient} from '@angular/common/http';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {TestBed} from '@angular/core/testing';
import {provideRouter} from '@angular/router';
import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import {UserInfo} from '../entities/userInfo';
import {isAppUrl, UserSessionService} from './user-session.service';
import {UserService} from './user.service';

describe('isAppUrl', () => {
  it('accepts paths inside this app', () => {
    expect(isAppUrl('/')).toBe(true);
    expect(isAppUrl('/provider/my')).toBe(true);
    expect(isAppUrl('/search?query=data#top')).toBe(true);
  });

  it('rejects anything that could point at another site', () => {
    expect(isAppUrl('//evil.example.org/x')).toBe(false);
    expect(isAppUrl('/\\evil.example.org')).toBe(false);
    expect(isAppUrl('https://evil.example.org')).toBe(false);
    expect(isAppUrl('provider/my')).toBe(false);
  });

  it('rejects empty values', () => {
    expect(isAppUrl('')).toBe(false);
    expect(isAppUrl(null)).toBe(false);
  });
});

describe('UserSessionService', () => {
  let backend: HttpTestingController;

  const user = (fields: Partial<UserInfo> = {}): UserInfo =>
    ({sub: 's', name: 'Ada', surname: 'Lovelace', fullname: 'Ada Lovelace', email: 'ada@example.org', roles: ['ROLE_USER'], ...fields}) as UserInfo;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting(), UserService],
    });
    backend = TestBed.inject(HttpTestingController);
  });

  afterEach(() => backend.verify());

  it('asks /api/user/info once and reports the user when it answers with a body', () => {
    const session = TestBed.inject(UserSessionService);
    const ready: (UserInfo | null)[] = [];
    session.ready$.subscribe(u => ready.push(u));

    expect(session.isSignedIn()).toBe(false);
    expect(ready).toEqual([]);

    backend.expectOne('/api/user/info').flush(user());

    expect(ready).toEqual([user()]);
    expect(session.isSignedIn()).toBe(true);
  });

  it('reports signed out when the user-info call fails', () => {
    const session = TestBed.inject(UserSessionService);
    const ready: (UserInfo | null)[] = [];
    session.ready$.subscribe(u => ready.push(u));

    backend.expectOne('/api/user/info').flush('no', {status: 401, statusText: 'Unauthorized'});

    expect(ready).toEqual([null]);
    expect(session.isSignedIn()).toBe(false);
    expect(session.displayName).toBe('');
  });

  it('ready$ emits once and completes, also for late subscribers', () => {
    const session = TestBed.inject(UserSessionService);
    backend.expectOne('/api/user/info').flush(user());

    let completed = false;
    const ready: (UserInfo | null)[] = [];
    session.ready$.subscribe({next: u => ready.push(u), complete: () => (completed = true)});

    expect(ready).toEqual([user()]);
    expect(completed).toBe(true);
  });

  it('builds the display name from the best field available', () => {
    const session = TestBed.inject(UserSessionService);
    backend.expectOne('/api/user/info').flush(user({fullname: '  ', name: 'Ada', surname: 'Lovelace'}));
    expect(session.displayName).toBe('Ada Lovelace');
  });

  it('falls back to the email when the user has no name', () => {
    const session = TestBed.inject(UserSessionService);
    backend.expectOne('/api/user/info').flush(user({fullname: '', name: '', surname: ''}));
    expect(session.displayName).toBe('ada@example.org');
  });
});
