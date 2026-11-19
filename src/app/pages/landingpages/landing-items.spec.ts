import {ChangeDetectionStrategy, Component} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {provideRouter, Router, RouterOutlet} from '@angular/router';
import {of, Subject, throwError} from 'rxjs';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {ResourceService} from '../../services/resource.service';
import {HomeAireComponent} from '../home/home.aire.component';
import {PortfolioItemComponent} from './portfolio/portfolio-item.component';
import {UserItemComponent} from './user/user-item.component';

// Eager like AppComponent, so a check refreshes the page only when it read a changed signal.
@Component({
  imports: [RouterOutlet],
  template: '<router-outlet />',
  changeDetection: ChangeDetectionStrategy.Eager
})
class AppHostComponent {}

const vocabulary = (id: string, name: string) => ({id, name, description: `About ${name}`, extras: {image: '', tagline: `${name} tagline`}});
const service = (id: string, name: string) => ({id, name, tagline: '', extras: {image: ''}});
const page = (...results: unknown[]) => ({results, total: results.length});

describe('landing pages for a portfolio, a user type and home', () => {
  let resources: Record<string, ReturnType<typeof vi.fn>>;

  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
    resources = {
      getVocabularyById: vi.fn((id: string) => of(vocabulary(id, id === 'researchers' ? 'Researchers' : 'Data'))),
      getServicesByVocabularyTypeAndId: vi.fn(() => of(page(service('argos', 'Argos')))),
      getNewVocabulariesByType: vi.fn((type: string) => of(type === 'Portfolios'
        ? [vocabulary('data', 'Data'), vocabulary('science', 'Science')]
        : [vocabulary('researchers', 'Researchers')])),
      getServicesSnippetByUserContentAndPortfolioType: vi.fn((user: string, portfolio?: string) =>
        of(page(...(portfolio === 'science' ? [] : [service('argos', 'Argos')])))),
      getResourcesGroupedByField: vi.fn(() => of({Data: [service('argos', 'Argos')], Science: []}))
    };
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          {path: '', component: HomeAireComponent},
          {path: 'portfolio/:id', component: PortfolioItemComponent},
          {path: 'user/:id', component: UserItemComponent}
        ]),
        {provide: ResourceService, useValue: resources}
      ]
    });
  });

  afterEach(() => vi.mocked(console.log).mockRestore());

  const open = async (url: string) => {
    const fixture = TestBed.createComponent(AppHostComponent);
    await TestBed.inject(Router).navigateByUrl(url);
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement;
    return {fixture, root, text: () => root.textContent!.replace(/\s+/g, ' ')};
  };

  describe('PortfolioItemComponent', () => {
    it('shows the loader, then the portfolio and its services', async () => {
      const answer = new Subject<unknown>();
      resources['getVocabularyById'].mockReturnValue(answer);
      const {fixture, root, text} = await open('/portfolio/data');
      expect(root.querySelector('.loader-big')).not.toBeNull();

      answer.next(vocabulary('data', 'Data'));
      answer.complete();
      fixture.detectChanges();

      expect(root.querySelector('.loader-big')).toBeNull();
      expect(text()).toContain('Data Portfolio');
      expect(text()).toContain('Argos');
      expect(resources['getServicesByVocabularyTypeAndId']).toHaveBeenCalledWith('portfolios', 'data');
    });

    it('keeps the loader after a failed load, as before', async () => {
      resources['getVocabularyById'].mockReturnValue(throwError(() => 'server down'));
      const {root} = await open('/portfolio/data');
      expect(root.querySelector('.loader-big')).not.toBeNull();
    });
  });

  describe('UserItemComponent', () => {
    it('shows the user type, then the services for all portfolios and for each one', async () => {
      const {text} = await open('/user/researchers');

      expect(text()).toContain('Researchers tagline');
      expect(text()).toContain('Which service is right for you?');
      expect(text()).toContain('Argos');
      expect(resources['getServicesSnippetByUserContentAndPortfolioType'].mock.calls).toEqual([
        ['researchers', undefined], ['researchers', 'data'], ['researchers', 'science']
      ]);
    });

    it('shows the user type before the portfolio lists have answered', async () => {
      const lists = new Subject<unknown>();
      resources['getServicesSnippetByUserContentAndPortfolioType'].mockReturnValue(lists);
      const {fixture, text} = await open('/user/researchers');
      expect(text()).toContain('Researchers tagline');
      expect(text()).not.toContain('Which service is right for you?');

      lists.next(page(service('argos', 'Argos')));
      lists.complete();
      fixture.detectChanges();
      expect(text()).toContain('Which service is right for you?');
    });

    it('hides the portfolio section when one of the lists fails, as before', async () => {
      resources['getServicesSnippetByUserContentAndPortfolioType'].mockImplementation((user: string, portfolio?: string) =>
        portfolio === 'science' ? throwError(() => 'server down') : of(page(service('argos', 'Argos'))));
      const {text} = await open('/user/researchers');
      expect(text()).toContain('Researchers tagline');
      expect(text()).not.toContain('Which service is right for you?');
    });

    it('escapes & in the user type for the service lists', async () => {
      await open('/user/' + encodeURIComponent('a&b'));
      expect(resources['getServicesSnippetByUserContentAndPortfolioType']).toHaveBeenCalledWith('a%26b', undefined);
    });
  });

  describe('HomeAireComponent', () => {
    it('shows the user types and the portfolios with their services once all have loaded', async () => {
      const grouped = new Subject<unknown>();
      resources['getResourcesGroupedByField'].mockReturnValue(grouped);
      const {fixture, text} = await open('/');
      expect(text()).toContain('Researchers');
      expect(text()).not.toContain('Data portfolio');

      grouped.next({Data: [service('argos', 'Argos')], Science: []});
      grouped.complete();
      fixture.detectChanges();
      expect(text()).toContain('Data portfolio');
      expect(text()).toContain('Science portfolio');
    });

    it('still shows the user types when the portfolios fail to load', async () => {
      resources['getResourcesGroupedByField'].mockReturnValue(throwError(() => 'server down'));
      const {text} = await open('/');
      expect(text()).toContain('Researchers');
      expect(text()).not.toContain('Data portfolio');
    });

    it('marks the dot of the slide that was picked', async () => {
      const {fixture, root} = await open('/');
      const dots = () => [...root.querySelectorAll('#slideShow ~ * .uk-dotnav li, #slideShow .uk-dotnav li')];
      const home = fixture.debugElement.query(debug => debug.componentInstance instanceof HomeAireComponent)
        .componentInstance as HomeAireComponent;
      home.slide.set(0);
      fixture.detectChanges();
      expect(dots().map(li => li.classList.contains('uk-active'))).toEqual([true]);
    });
  });
});
