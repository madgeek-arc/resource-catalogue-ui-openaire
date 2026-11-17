import {HTTP_INTERCEPTORS, HttpClient, HttpErrorResponse, provideHttpClient, withInterceptorsFromDi, withXhr} from '@angular/common/http';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {TestBed} from '@angular/core/testing';
import {Router, provideRouter} from '@angular/router';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {AuthenticationInterceptor, skipNotFoundRedirect} from './authentication-interceptor';

describe('AuthenticationInterceptor', () => {
  let http: HttpClient;
  let backend: HttpTestingController;
  let navigate: ReturnType<typeof vi.spyOn>;

  // Sends a GET and records everything the caller would see.
  const get = (url: string, context?: ReturnType<typeof skipNotFoundRedirect>) => {
    const seen = {values: [] as unknown[], error: undefined as HttpErrorResponse | undefined, completed: false};
    http.get(url, {context}).subscribe({
      next: value => seen.values.push(value),
      error: (error: HttpErrorResponse) => (seen.error = error),
      complete: () => (seen.completed = true),
    });
    return seen;
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withXhr(), withInterceptorsFromDi()),
        provideHttpClientTesting(),
        {provide: HTTP_INTERCEPTORS, useClass: AuthenticationInterceptor, multi: true},
      ],
    });
    http = TestBed.inject(HttpClient);
    backend = TestBed.inject(HttpTestingController);
    navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
  });

  afterEach(() => {
    backend.verify();
    vi.restoreAllMocks();
  });

  it('hands a successful response to the caller untouched', () => {
    const seen = get('/api/oa/services');
    backend.expectOne('/api/oa/services').flush({total: 3});

    expect(seen.values).toEqual([{total: 3}]);
    expect(seen.completed).toBe(true);
    expect(navigate).not.toHaveBeenCalled();
  });

  it('shows the forbidden page on a 403, and the caller still gets the error', () => {
    const seen = get('/api/oa/providers/my');
    backend.expectOne('/api/oa/providers/my').flush('no', {status: 403, statusText: 'Forbidden'});

    expect(navigate).toHaveBeenCalledWith(['/forbidden']);
    expect(seen.error?.status).toBe(403);
  });

  it('never moves the visitor on a 403 from the user-info call', () => {
    const seen = get('/api/user/info');
    backend.expectOne('/api/user/info').flush('no', {status: 403, statusText: 'Forbidden'});

    expect(navigate).not.toHaveBeenCalled();
    expect(seen.error?.status).toBe(403);
  });

  it('treats a 401 as "signed out": no navigation, and the caller gets the error', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const seen = get('/api/user/info');
    backend.expectOne('/api/user/info').flush('no', {status: 401, statusText: 'Unauthorized'});

    expect(navigate).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
    expect(seen.error?.status).toBe(401);
  });

  it('shows the not-found page on a 404', () => {
    const seen = get('/api/oa/services/missing');
    backend.expectOne('/api/oa/services/missing').flush('no', {status: 404, statusText: 'Not Found'});

    expect(navigate).toHaveBeenCalledWith(['/notFound']);
    expect(seen.error?.status).toBe(404);
  });

  it('leaves a 404 to the caller when the request opted out with skipNotFoundRedirect', () => {
    const seen = get('/api/oa/services/maybe', skipNotFoundRedirect());
    backend.expectOne('/api/oa/services/maybe').flush('no', {status: 404, statusText: 'Not Found'});

    expect(navigate).not.toHaveBeenCalled();
    expect(seen.error?.status).toBe(404);
  });

  it('does not show the not-found page when the FAQ route lookup has no page', () => {
    const url = 'https://faq.example.org/faq/api/page/route?q=home';
    const seen = get(url);
    backend.expectOne(url).flush('no', {status: 404, statusText: 'Not Found'});

    expect(navigate).not.toHaveBeenCalled();
    expect(seen.error?.status).toBe(404);
  });

  it('swallows a status-0 failure: the caller sees completion, not an error', () => {
    const seen = get('/api/oa/services');
    backend.expectOne('/api/oa/services').error(new ProgressEvent('error'));

    expect(seen.error).toBeUndefined();
    expect(seen.values).toEqual([]);
    expect(seen.completed).toBe(true);
  });

  it('logs other server errors and passes them on without navigating', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const seen = get('/api/oa/services');
    backend.expectOne('/api/oa/services').flush({detail: 'boom'}, {status: 500, statusText: 'Server Error'});

    expect(navigate).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith('Backend returned code 500, body was: {"detail":"boom"}');
    expect(seen.error?.status).toBe(500);
  });
});
