import {provideHttpClient} from '@angular/common/http';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {TestBed} from '@angular/core/testing';
import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import {ProviderService} from './provider.service';

describe('ProviderService', () => {
  let service: ProviderService;
  let backend: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), ProviderService],
    });
    service = TestBed.inject(ProviderService);
    backend = TestBed.inject(HttpTestingController);
  });

  afterEach(() => backend.verify());

  describe('getServicesOfProvider', () => {
    it('asks /api/oa/services/bundles once for the provider, passing the filters and page through', () => {
      let total: number | undefined;
      service.getServicesOfProvider('openaire', [
        {key: 'quantity', values: ['9']},
        {key: 'from', values: ['9']},
        {key: 'status', values: ['pending']},
        {key: 'sort', values: ['modifiedAt']},
        {key: 'order', values: ['desc']},
      ]).subscribe(page => (total = page.total));

      const req = backend.expectOne(
        '/api/oa/services/bundles?resourceProviders=openaire&quantity=9&from=9&status=pending&sort=modifiedAt&order=desc');
      expect(req.request.method).toBe('GET');
      expect(req.request.withCredentials).toBe(true);
      req.flush({total: 15, from: 9, to: 10, results: [{id: 'b1', status: 'pending', active: false, service: {id: 'openaire.x'}}]});

      expect(total).toBe(15);
    });

    it('sends only the provider when there are no parameters', () => {
      service.getServicesOfProvider('cern').subscribe();
      backend.expectOne('/api/oa/services/bundles?resourceProviders=cern').flush({total: 0, from: 0, to: 0, results: []});
    });
  });
});
