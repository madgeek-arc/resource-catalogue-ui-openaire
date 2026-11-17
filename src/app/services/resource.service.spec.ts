import {provideHttpClient} from '@angular/common/http';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {TestBed} from '@angular/core/testing';
import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import {SKIP_NOT_FOUND_REDIRECT} from './authentication-interceptor';
import {ResourceService} from './resource.service';

describe('ResourceService', () => {
  let service: ResourceService;
  let backend: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), ResourceService],
    });
    service = TestBed.inject(ResourceService);
    backend = TestBed.inject(HttpTestingController);
  });

  afterEach(() => backend.verify());

  describe('search', () => {
    it('sends every value of every parameter to /api/oa/services, with credentials', () => {
      let total: number | undefined;
      service.search([
        {key: 'portfolios', values: ['Assess', 'Discover']},
        {key: 'query', values: ['data']},
      ]).subscribe(page => (total = page.total));

      const req = backend.expectOne('/api/oa/services?portfolios=Assess&portfolios=Discover&query=data');
      expect(req.request.method).toBe('GET');
      expect(req.request.withCredentials).toBe(true);
      req.flush({total: 2, from: 0, to: 2, results: []});

      expect(total).toBe(2);
    });

    it('sends no query parameters when there are none', () => {
      service.search([]).subscribe();
      backend.expectOne('/api/oa/services?').flush({total: 0, results: []});
    });
  });

  describe('getServiceOrDatasource', () => {
    it('returns the service when the id is a service, without a not-found redirect', () => {
      let result: unknown;
      service.getServiceOrDatasource('athenarc.amnesia').subscribe(r => (result = r));

      const req = backend.expectOne('/api/oa/services/athenarc.amnesia');
      expect(req.request.context.get(SKIP_NOT_FOUND_REDIRECT)).toBe(true);
      req.flush({id: 'athenarc.amnesia'});

      expect(result).toEqual({id: 'athenarc.amnesia'});
    });

    it('falls back to the datasource when the service lookup fails', () => {
      let result: unknown;
      service.getServiceOrDatasource('ds-1').subscribe(r => (result = r));

      backend.expectOne('/api/oa/services/ds-1').flush('no', {status: 404, statusText: 'Not Found'});
      const fallback = backend.expectOne('/api/oa/datasources/ds-1');
      expect(fallback.request.context.get(SKIP_NOT_FOUND_REDIRECT)).toBe(false);
      fallback.flush({id: 'ds-1'});

      expect(result).toEqual({id: 'ds-1'});
    });
  });

  describe('getServicesByIdArray', () => {
    it('makes no request for an empty or missing list', () => {
      const results: unknown[] = [];
      service.getServicesByIdArray([]).subscribe(r => results.push(r));
      service.getServicesByIdArray(null as unknown as string[]).subscribe(r => results.push(r));

      expect(results).toEqual([[], []]);
    });

    it('loads every id and leaves out the ones that fail', () => {
      let result: unknown;
      service.getServicesByIdArray(['a', 'gone', 'b']).subscribe(r => (result = r));

      const reqs = ['a', 'gone', 'b'].map(id => backend.expectOne(`/api/oa/services/${id}`));
      reqs.forEach(req => expect(req.request.context.get(SKIP_NOT_FOUND_REDIRECT)).toBe(true));
      reqs[0].flush({id: 'a'});
      reqs[1].flush('no', {status: 404, statusText: 'Not Found'});
      reqs[2].flush({id: 'b'});

      expect(result).toEqual([{id: 'a'}, {id: 'b'}]);
    });
  });

  it('groups services by a field through /api/oa/services/by/{field}', () => {
    let result: unknown;
    service.getResourcesGroupedByField('portfolios').subscribe(r => (result = r));
    backend.expectOne('/api/oa/services/by/portfolios').flush({Assess: [{id: 'a'}]});

    expect(result).toEqual({Assess: [{id: 'a'}]});
  });

  describe('removeNulls', () => {
    it('drops null and empty-string values and empty arrays, at every depth', () => {
      const obj: Record<string, unknown> = {
        keep: 'x',
        zero: 0,
        nothing: null,
        blank: '',
        empty: [],
        nested: {gone: null, kept: 1, list: ['a', null]},
      };
      ResourceService.removeNulls(obj);

      expect(obj).toEqual({keep: 'x', zero: 0, nested: {kept: 1, list: ['a']}});
    });

    it('clears the default "en" language of an empty multilingual value', () => {
      const obj: Record<string, unknown> = {title: {value: '', lang: 'en'}};
      ResourceService.removeNulls(obj);

      expect(obj).toEqual({title: {}});
    });
  });
});
