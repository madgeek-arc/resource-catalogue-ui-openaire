import {ChangeDetectionStrategy, Component} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {provideRouter, Router, RouterOutlet} from '@angular/router';
import {Subject} from 'rxjs';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {DatasourceService} from '../../../services/datasource.service';
import {Datasource} from './datasource';

// Eager like AppComponent, so a check refreshes the page only when it read a changed signal.
@Component({
  imports: [RouterOutlet],
  template: '<router-outlet />',
  changeDetection: ChangeDetectionStrategy.Eager
})
class AppHostComponent {}

const zenodo = {id: 'zenodo', officialname: 'Zenodo', description: 'Research. Shared.', websiteurl: 'https://zenodo.org'};

describe('Datasource', () => {
  let answers: Record<string, Subject<unknown>>;

  beforeEach(() => {
    answers = {zenodo: new Subject(), arxiv: new Subject()};
    TestBed.configureTestingModule({
      providers: [provideRouter([{path: 'datasource/:datasourceId', component: Datasource}])]
    });
    TestBed.overrideComponent(Datasource, {
      set: {providers: [{provide: DatasourceService, useValue: {getDatasourceById: (id: string) => answers[id]}}]}
    });
  });

  const open = async (url: string) => {
    const fixture = TestBed.createComponent(AppHostComponent);
    const router = TestBed.inject(Router);
    fixture.detectChanges();
    await router.navigateByUrl(url);
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement;
    const answer = (id: string, value: unknown) => {
      answers[id].next(value);
      fixture.detectChanges();
    };
    const go = async (next: string) => {
      await router.navigateByUrl(next);
      fixture.detectChanges();
    };
    const text = () => root.textContent!.replace(/\s+/g, ' ');
    return {fixture, root, answer, go, text};
  };

  it('shows the datasource once it arrives', async () => {
    const {root, answer, text} = await open('/datasource/zenodo');
    expect(text()).toContain('We can\'t find the datasource you are looking for.');

    answer('zenodo', {results: [zenodo]});

    expect(root.querySelector('h1')!.textContent).toBe('Zenodo');
    expect(text()).toContain('Research. Shared.');
    expect(root.querySelector('a')!.getAttribute('href')).toBe('https://zenodo.org');
    expect(root.querySelector('pre')!.textContent).toContain('"officialname": "Zenodo"');
  });

  it('says it cannot find a datasource the search does not single out', async () => {
    const {answer, text} = await open('/datasource/zenodo');
    answer('zenodo', {results: []});
    expect(text()).toContain('We can\'t find the datasource you are looking for.');
  });

  it('shows the next datasource when the URL changes, with the page reused', async () => {
    const {root, answer, go} = await open('/datasource/zenodo');
    answer('zenodo', {results: [zenodo]});

    await go('/datasource/arxiv');
    answer('arxiv', {results: [{id: 'arxiv', officialname: 'arXiv'}]});

    expect(root.querySelector('h1')!.textContent).toBe('arXiv');
    expect(root.querySelector('a')).toBeNull();
  });

  it('logs a failed search and keeps the page usable for the next one', async () => {
    const quiet = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const {root, answer, go, text} = await open('/datasource/zenodo');

    answers['zenodo'].error({status: 500});
    expect(quiet).toHaveBeenCalledWith({status: 500});
    expect(text()).toContain('We can\'t find the datasource you are looking for.');

    await go('/datasource/arxiv');
    answer('arxiv', {results: [{id: 'arxiv', officialname: 'arXiv'}]});
    expect(root.querySelector('h1')!.textContent).toBe('arXiv');
    quiet.mockRestore();
  });
});
