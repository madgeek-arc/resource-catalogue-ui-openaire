import {ChangeDetectionStrategy, Component} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {provideRouter, Router, RouterOutlet} from '@angular/router';
import {of, Subject} from 'rxjs';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {URLParameter} from '../../entities/url-parameter';
import {ComparisonService} from '../../services/comparison.service';
import {DatasourceService} from '../../services/datasource.service';
import {EmailService} from '../../services/email.service';
import {HelpContentService} from '../../services/help-content.service';
import {ResourceService} from '../../services/resource.service';
import {UserSessionService} from '../../services/user-session.service';
import {DatasourceSearchComponent} from './datasources-search/datasourceSearch.component';
import {SearchAireComponent} from './search.aire.component';
import {paging, SearchParameters} from './search-state';

describe('search state', () => {
  it('reads and writes the query string', () => {
    const parameters = SearchParameters.fromQueryParams({users: 'a,b', query: 'graph'});
    parameters.set('query', 'zenodo');
    parameters.set('from', 20);
    expect(parameters.toQueryParams()).toEqual({users: 'a,b', query: 'zenodo', from: '20'});
    expect(parameters.value('users')).toBe('a');
  });

  it('adds a facet value and goes back to the first page', () => {
    const parameters = SearchParameters.fromQueryParams({from: '20', users: 'a'});
    parameters.addValue('users', 'b');
    parameters.addValue('portfolios', 'p');
    expect(parameters.toQueryParams()).toEqual({from: '0', users: 'a,b', portfolios: 'p'});
  });

  it('removes a facet value, and the facet once it has none', () => {
    const parameters = SearchParameters.fromQueryParams({users: 'a,b', trl: '1'});
    parameters.removeValue('users', 'a');
    parameters.removeValue('trl', '1');
    expect(parameters.toQueryParams()).toEqual({users: 'b'});
    parameters.remove('users');
    expect(parameters.toQueryParams()).toEqual({});
  });

  it.each([
    [0, 0, {pages: [], totalPages: 0, currentPage: 1}],
    [35, 0, {pages: [1, 2, 3, 4], totalPages: 4, currentPage: 1}],
    [100, 0, {pages: [1, 2, 3, 4, 5], totalPages: 10, currentPage: 1}],
    [100, 50, {pages: [4, 5, 6, 7, 8], totalPages: 10, currentPage: 6}],
    [100, 90, {pages: [6, 7, 8, 9, 10], totalPages: 10, currentPage: 10}],
  ])('pages %i results from %i', (total, from, expected) => {
    expect(paging(total, from, 10)).toEqual(expected);
  });
});

// Eager like AppComponent, so a check refreshes the page only when it read a changed signal.
@Component({
  imports: [RouterOutlet],
  template: '<router-outlet />',
  changeDetection: ChangeDetectionStrategy.Eager
})
class AppHostComponent {}

const facets = () => [{
  field: 'users', label: 'Users', values: [
    {value: 'researchers', label: 'Researchers', count: 3, isChecked: false},
    {value: 'funders', label: 'Funders', count: 1, isChecked: false}
  ]
}];
const results = (total: number, from: number, ...names: string[]) => ({
  total, from, to: from + names.length, facets: facets(),
  results: names.map(name => ({id: name.toLowerCase(), name, extras: {portfolios: ['p1'], users: [], paymentCategories: []}}))
});

describe('SearchAireComponent', () => {
  let answers: Subject<unknown>;
  let searched: URLParameter[][];

  beforeEach(() => {
    searched = [];
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{path: 'search', component: SearchAireComponent}]),
        {
          provide: ResourceService, useValue: {
            searchWithDatasource: (parameters: URLParameter[]) => {
              searched.push(parameters);
              answers = new Subject();
              return answers;
            },
            getNewVocabulariesByType: (type: string) => of(type === 'Portfolios' ? [{id: 'p1', name: 'Discover'}] : []),
            getMyServiceProviders: () => of([])
          }
        },
        {provide: UserSessionService, useValue: {ready$: of(null)}},
        {provide: ComparisonService, useValue: {servicesToCompare: []}},
        {provide: HelpContentService, useValue: {}},
        {provide: EmailService, useValue: {}}
      ]
    });
  });

  afterEach(() => vi.useRealTimers());

  const open = async (url: string) => {
    const fixture = TestBed.createComponent(AppHostComponent);
    const router = TestBed.inject(Router);
    await router.navigateByUrl(url);
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement;
    const answer = (value: unknown) => {
      answers.next(value);
      answers.complete();
      fixture.detectChanges();
    };
    const text = () => root.textContent!.replace(/\s+/g, ' ');
    const activePages = () => [...root.querySelectorAll('.uk-pagination li.uk-active')].map(li => li.textContent!.trim());
    return {fixture, root, router, answer, text, activePages};
  };

  it('shows the results, ticks the facet values in the URL and names their portfolios', async () => {
    const {root, answer, text} = await open('/search?users=researchers');
    expect(searched[0]).toEqual([{key: 'users', values: ['researchers']}]);

    answer(results(2, 0, 'Argos', 'Zenodo'));

    expect(text()).toContain('2 Services, Page 1 of 1');
    expect(text()).toContain('Discover');
    const boxes = [...root.querySelectorAll<HTMLInputElement>('.refineOption input')];
    expect(boxes.slice(0, 2).map(box => box.checked)).toEqual([true, false]);
  });

  it('adds a facet value to the URL when it is ticked', async () => {
    const {root, router, answer} = await open('/search?from=20');
    answer(results(2, 0, 'Argos', 'Zenodo'));

    const box = root.querySelectorAll<HTMLInputElement>('.refineOption input')[1];
    box.checked = true;
    box.dispatchEvent(new Event('change'));
    await new Promise(resolve => setTimeout(resolve));

    expect(router.url).toBe('/search?from=0&users=funders');
  });

  it('pages through the results, moving the page number at once', async () => {
    const {router, answer, text, activePages, fixture, root} = await open('/search');
    answer(results(100, 0, 'Argos'));
    expect(activePages()).toEqual(['1', '1']);

    const next = [...root.querySelectorAll<HTMLAnchorElement>('.uk-pagination a')].find(a => a.querySelector('[uk-pagination-next]'))!;
    next.click();
    fixture.detectChanges();
    expect(text()).toContain('Page 2 of 10');
    await new Promise(resolve => setTimeout(resolve));
    expect(router.url).toBe('/search?from=10');

    answer(results(100, 10, 'Zenodo'));
    expect(activePages()).toEqual(['2', '2']);
  });

  it('searches for what the user types after a pause', async () => {
    const {root, router} = await open('/search');
    vi.useFakeTimers();
    const input = root.querySelector<HTMLInputElement>('input.menuSearch')!;
    input.value = 'graph';
    input.dispatchEvent(new KeyboardEvent('keyup'));
    vi.advanceTimersByTime(499);
    expect(router.url).toBe('/search');
    vi.advanceTimersByTime(1);
    vi.useRealTimers();
    await new Promise(resolve => setTimeout(resolve));
    expect(router.url).toBe('/search?query=graph');
  });
});

describe('DatasourceSearchComponent', () => {
  let answers: Subject<unknown>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{path: 'datasources/search', component: DatasourceSearchComponent}]),
        {provide: HelpContentService, useValue: {}}
      ]
    });
    TestBed.overrideComponent(DatasourceSearchComponent, {
      set: {
        providers: [{
          provide: DatasourceService, useValue: {
            getDatasources: () => answers = new Subject(),
            getDatasourceTypes: () => of({terms: [{englishName: 'Repository', code: 'repo'}]})
          }
        }]
      }
    });
  });

  it('shows the results and takes the sort order and query from the URL', async () => {
    const fixture = TestBed.createComponent(AppHostComponent);
    await TestBed.inject(Router).navigateByUrl('/datasources/search?order=asc&query=graph');
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement;

    answers.next({...results(40, 0, 'Argos'), results: [{id: 'd1', officialname: 'Argos', eoscDatasourceType: 'Repository'}]});
    answers.complete();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(root.textContent!.replace(/\s+/g, ' ')).toContain('Page 1 of 2');
    expect(root.querySelector<HTMLSelectElement>('#sortBy')!.value).toBe('asc');
    expect(root.querySelector<HTMLInputElement>('input.menuSearch')!.value).toBe('graph');
  });
});
