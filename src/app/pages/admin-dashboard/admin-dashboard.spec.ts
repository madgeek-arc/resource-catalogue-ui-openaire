import {ChangeDetectionStrategy, Component, forwardRef, input, Type} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {NgOptionComponent, NgSelectComponent} from '@ng-select/ng-select';
import {TestBed} from '@angular/core/testing';
import {provideRouter, Router, RouterOutlet} from '@angular/router';
import {of, Subject} from 'rxjs';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {ProviderService} from '../../services/provider.service';
import {ResourceService} from '../../services/resource.service';
import {UserService} from '../../services/user.service';
import {AdminDashboardComponent} from './admin-dashboard.component';
import {AllDatasourcesDashboardComponent} from './datasources/all-datasources.component';
import {AllProvidersDashboardComponent} from './providers/all-providers.component';
import {AllServicesDashboardComponent} from './services/all-services.component';

// Eager like AppComponent, so a check refreshes the admin pages only when they read a changed signal.
@Component({
  imports: [RouterOutlet],
  template: '<router-outlet />',
  changeDetection: ChangeDetectionStrategy.Eager
})
class AppHostComponent {}

// ng-select ships prebuilt and loads a second copy of Angular core under Vitest; these stand in for it.
@Component({
  selector: 'ng-select',
  template: '<ng-content />',
  providers: [{provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => NgSelectStubComponent), multi: true}]
})
class NgSelectStubComponent implements ControlValueAccessor {
  readonly items = input<unknown[]>();
  value: unknown;
  writeValue(value: unknown) { this.value = value; }
  registerOnChange() { /* not needed */ }
  registerOnTouched() { /* not needed */ }
}

@Component({selector: 'ng-option', template: '<ng-content />'})
class NgOptionStubComponent {
  readonly value = input<unknown>();
}

const providerBundle = (id: string, name: string, status: string, active = true) => ({
  id, status, active, metadata: {}, provider: {id, name, logo: ''}
});
const serviceBundle = (id: string, name: string) => ({id, status: 'approved', active: true, metadata: {}, service: {id, name, logo: '', extras: {}}});
const page = (total: number, from: number, results: unknown[], facets: unknown[] = []) => ({total, from, results, facets});

describe('admin dashboard', () => {
  let providers: ReturnType<typeof vi.fn>;
  let publish: ReturnType<typeof vi.fn>;
  let verify: ReturnType<typeof vi.fn>;
  let userInfo: Subject<unknown>;
  let invitation: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    providers = vi.fn(() => of(page(2, 0, [providerBundle('openaire', 'OpenAIRE', 'approved'), providerBundle('cern', 'CERN', 'pending', false)])));
    publish = vi.fn(() => of(null));
    verify = vi.fn(() => of(null));
    userInfo = new Subject();
    invitation = vi.fn(() => of('t0ken'));
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{
          path: 'admin', component: AdminDashboardComponent, children: [
            {path: 'providers', component: AllProvidersDashboardComponent},
            {path: 'services', component: AllServicesDashboardComponent},
            {path: 'datasources', component: AllDatasourcesDashboardComponent}
          ]
        }]),
        {provide: ProviderService, useValue: {getProviderBundles: providers, publishProvider: publish, verifyProvider: verify}},
        {
          provide: ResourceService, useValue: {
            getNewVocabulariesByType: (type: string) => of([{id: type, name: type}]),
            getBundleOfServices: () => of(page(1, 0, [serviceBundle('argos', 'Argos')],
              [{field: 'resource_organisation', values: [{value: 'openaire', label: 'OpenAIRE'}]}])),
            getBundleOfDatasources: () => of(page(0, 0, []))
          }
        },
        {provide: UserService, useValue: {getUserInfo: () => userInfo, getInvitationToken: invitation}}
      ]
    });
    for (const list of [AllProvidersDashboardComponent, AllServicesDashboardComponent, AllDatasourcesDashboardComponent] as Type<unknown>[]) {
      TestBed.overrideComponent(list, {
        remove: {imports: [NgSelectComponent, NgOptionComponent]},
        add: {imports: [NgSelectStubComponent, NgOptionStubComponent]}
      });
    }
  });

  const open = async (url: string) => {
    const fixture = TestBed.createComponent(AppHostComponent);
    const router = TestBed.inject(Router);
    const settle = async () => {
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
    };
    // The app's outlet is there before the first navigation, so the dashboard sees that navigation end.
    fixture.detectChanges();
    await router.navigateByUrl(url);
    await settle();
    const root: HTMLElement = fixture.nativeElement;
    const text = () => root.textContent!.replace(/\s+/g, ' ');
    const go = async (next: string) => {
      await router.navigateByUrl(next);
      await settle();
    };
    const link = (label: string) => [...root.querySelectorAll<HTMLAnchorElement>('a')].find(a => a.textContent!.trim().endsWith(label))!;
    const inviteButton = () => root.querySelector('button[uk-toggle="target: #invite-modal"]');
    const list = <T>(type: Type<T>) => fixture.debugElement.query(debug => debug.componentInstance instanceof type).componentInstance as T;
    return {fixture, root, router, settle, text, go, link, list, inviteButton};
  };

  describe('AdminDashboardComponent', () => {
    it('titles and highlights the list the user moves to', async () => {
      const {root, go} = await open('/admin/providers');
      expect(root.querySelector('h5')!.textContent).toBe('All Providers');
      expect(root.querySelector('.current_section')!.textContent).toContain('All Providers');

      await go('/admin/datasources');

      expect(root.querySelector('h5')!.textContent).toBe('All Datasource Subprofiles');
      expect(root.querySelector('.current_section')!.textContent).toContain('All Datasource Subprofiles');
    });

    it('offers to invite a provider once the user turns out to be an admin, and makes the invitation link', async () => {
      const {root, settle, inviteButton} = await open('/admin/providers');
      expect(inviteButton()).toBeNull();

      userInfo.next({roles: ['ADMIN']});
      await settle();
      expect(inviteButton()).not.toBeNull();

      const create = [...root.querySelectorAll('button')].find(button => button.textContent!.includes('Create invitation token'))!;
      expect(create.disabled).toBe(true);
      const email = root.querySelector<HTMLInputElement>('input#email')!;
      email.value = 'ada@example.org';
      email.dispatchEvent(new Event('input'));
      await settle();
      expect(create.disabled).toBe(false);

      create.click();
      await settle();

      expect(invitation).toHaveBeenCalledWith('ada@example.org');
      expect(root.querySelector('#invite-modal pre')!.textContent).toBe(location.origin + '/join/t0ken');

      root.querySelector<HTMLButtonElement>('#invite-modal .uk-modal-close-default')!.click();
      await settle();
      expect(root.querySelector('#invite-modal pre')).toBeNull();
      expect(root.querySelector<HTMLInputElement>('input#email')!.value).toBe('');
    });

    it('does not offer invitations to other users', async () => {
      const {settle, inviteButton} = await open('/admin/providers');
      userInfo.next({roles: ['USER']});
      await settle();
      expect(inviteButton()).toBeNull();
    });
  });

  describe('AllProvidersDashboardComponent', () => {
    it('asks for the first page of 9 and shows the providers with their status', async () => {
      const {root, text} = await open('/admin/providers');
      expect(providers).toHaveBeenCalledWith([{key: 'quantity', values: ['9']}]);
      expect(text()).toContain('2 Providers, Page 1 of 1');
      expect(text()).toContain('OpenAIRE');
      expect(text()).toContain('CERN');
      expect(root.querySelector('#resourceState')).not.toBeNull();
    });

    it('shows the filters of the URL and keeps them when the user filters again, back on the first page', async () => {
      const {router, list, fixture} = await open('/admin/providers?status=pending&from=9');
      const providerList = list(AllProvidersDashboardComponent);
      expect(providerList.status()).toBe('pending');
      expect(fixture.debugElement.query(debug => debug.componentInstance instanceof NgSelectStubComponent).componentInstance.value).toBe('pending');

      await providerList.filterSelection('active', 'true');

      expect(router.url).toBe('/admin/providers?status=pending&from=0&quantity=9&active=true');
      expect(providerList.activeStatus()).toBe('true');
    });

    it('moves the page number at once on next', async () => {
      providers.mockReturnValue(of(page(30, 0, [providerBundle('openaire', 'OpenAIRE', 'approved')])));
      const {router, root, fixture, text} = await open('/admin/providers');
      expect(text()).toContain('Page 1 of 4');

      providers.mockReturnValue(new Subject());
      [...root.querySelectorAll<HTMLAnchorElement>('.uk-pagination a')].find(a => a.querySelector('[uk-pagination-next]'))!.click();
      fixture.detectChanges();
      expect(text()).toContain('Page 2 of 4');
      await fixture.whenStable();
      expect(router.url).toBe('/admin/providers?quantity=9&from=9');
    });

    it('deactivates a provider and shows the page again', async () => {
      const {link, settle, text} = await open('/admin/providers');
      providers.mockReturnValue(of(page(1, 0, [providerBundle('openaire', 'OpenAIRE', 'approved', false)])));

      link('Deactivate').click();
      await settle();

      expect(publish).toHaveBeenCalledWith('openaire', false);
      expect(providers).toHaveBeenCalledTimes(2);
      expect(text()).toContain('1 Providers');
      expect(text()).toContain('Inactive');
    });

    it('approves a pending provider and shows the page again', async () => {
      const {root, settle} = await open('/admin/providers');

      [...root.querySelectorAll('li')].find(li => li.textContent!.includes('Approve Provider'))!.click();
      await settle();

      expect(verify).toHaveBeenCalledWith('cern', true, 'approved');
      expect(providers).toHaveBeenCalledTimes(2);
    });

    it('names the provider the user asked to delete', async () => {
      (window as unknown as {UIkit: unknown}).UIkit = {modal: () => ({show: vi.fn()})};
      const {link, settle, text} = await open('/admin/providers');

      link('Delete').click();
      await settle();

      expect(text()).toContain('Are you sure you want to delete "OpenAIRE" ?');
    });
  });

  describe('AllServicesDashboardComponent', () => {
    it('shows the services and offers their providers as a filter', async () => {
      const {fixture, text} = await open('/admin/services');
      expect(text()).toContain('1 Services, Page 1 of 1');
      expect(text()).toContain('Argos');
      const selects = fixture.debugElement.queryAll(debug => debug.componentInstance instanceof NgSelectStubComponent)
        .map(debug => debug.componentInstance as NgSelectStubComponent);
      expect(selects[0].items()).toEqual([{value: 'openaire', label: 'OpenAIRE'}]);
      expect(selects[1].items()).toEqual([{id: 'Resource state', name: 'Resource state'}]);
    });
  });

  describe('AllDatasourcesDashboardComponent', () => {
    it('shows the datasource states to filter by, and no list when there are no datasources', async () => {
      const {root, text} = await open('/admin/datasources');
      expect(root.querySelector('#resourceState')).not.toBeNull();
      expect(text()).not.toContain('Datasources, Page');
    });
  });
});
