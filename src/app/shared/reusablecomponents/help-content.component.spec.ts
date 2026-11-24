import {ChangeDetectionStrategy, Component, viewChild} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {provideRouter} from '@angular/router';
import {Subject} from 'rxjs';
import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import {environment} from '../../../environments/environment';
import {PageContent} from '../../entities/page-content';
import {HelpContentService} from '../../services/help-content.service';
import {AsideHelpContentComponent, HelpContentComponent} from './help-content.component';

// The host is Eager, so every fixture check reaches the children; a host check refreshes the
// children only when they marked themselves for check (OnPush) or read a changed signal.
@Component({
  imports: [HelpContentComponent, AsideHelpContentComponent],
  template: `
    <app-help-content #top position="top" />
    <app-aside-help-content #right position="right" />
    <p class="top-present">{{ top.isPresent() }}</p>
  `,
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection -- Eager on purpose, see above
  changeDetection: ChangeDetectionStrategy.Eager
})
class HostComponent {
  readonly top = viewChild.required<HelpContentComponent>('top');
  readonly right = viewChild.required<AsideHelpContentComponent>('right');
}

const content = (html: string) =>
  ({_id: html, page: 'p', placement: 'top', order: 0, content: html, isActive: true});

describe('HelpContentComponent', () => {
  const showHelpContent = environment.showHelpContent;
  let response: Subject<PageContent>;

  beforeEach(() => {
    environment.showHelpContent = true;
    response = new Subject<PageContent>();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {provide: HelpContentService, useValue: {getActivePageContent: () => response}}
      ]
    });
  });

  afterEach(() => {
    environment.showHelpContent = showHelpContent;
  });

  it('renders the contents of its position when the page content arrives', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('app-help-content')!.children.length).toBe(0);
    expect(fixture.componentInstance.top().isPresent()).toBe(false);

    response.next({
      _id: '1', name: 'search', route: '/search',
      content: {top: [content('<b>Top one</b>'), content('<b>Top two</b>')], right: [content('<i>Aside</i>')], bottom: [], left: []}
    });
    fixture.detectChanges();

    expect(root.querySelector('app-help-content')!.textContent).toContain('Top one');
    expect(root.querySelector('app-help-content')!.textContent).toContain('Top two');
    expect(root.querySelector('app-aside-help-content .uk-card')!.textContent).toBe('Aside');
    expect(fixture.componentInstance.top().isPresent()).toBe(true);
    expect(root.querySelector('.top-present')!.textContent).toBe('true');
  });

  it('renders nothing and is not present when its position is empty', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    response.next({_id: '1', name: 'search', route: '/search', content: {top: [], right: undefined, bottom: [], left: []}});
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('app-help-content')!.children.length).toBe(0);
    expect(root.querySelector('app-aside-help-content')!.children.length).toBe(0);
    expect(fixture.componentInstance.right().isPresent()).toBe(false);
  });

  it('does not ask for content when help content is turned off', () => {
    environment.showHelpContent = false;
    let asked = false;
    TestBed.overrideProvider(HelpContentService, {useValue: {getActivePageContent: () => { asked = true; return response; }}});
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    expect(asked).toBe(false);
  });
});
