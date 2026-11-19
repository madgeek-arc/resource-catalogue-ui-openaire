import {ChangeDetectionStrategy, Component, computed, inject, signal} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {ActivatedRoute, NavigationEnd, Router, RouterLink, RouterOutlet} from '@angular/router';
import {EMPTY, Observable, of, zip} from 'rxjs';
import {catchError, filter, map, switchMap} from 'rxjs/operators';
import {Service, URL} from '../../../entities/eic-model';
import {UiVocabulary} from '../../../entities/dynamic-form-model';
import {UserSessionService} from '../../../services/user-session.service';
import {ResourceService} from '../../../services/resource.service';
import {environment} from '../../../../environments/environment';
import {ServiceLandingData} from './service-landing-data';

@Component({
  selector: 'app-service-landing-page',
  templateUrl: './service-static-landing-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterOutlet],
  host: {'(window:scroll)': 'checkNavbarSticky()'}
})
export class ServiceLandingPageComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private resourceService = inject(ResourceService);
  private session = inject(UserSessionService);

  readonly projectName = environment.projectName;
  readonly cleanView = this.router.url.includes('/changeLogClean');

  readonly id = toSignal(this.route.params.pipe(map(params => params['id'] as string)));

  /**
   * The service, the vocabularies and the related services, passed to the tabs through the router outlet.
   * Stays on the previous service while the next one loads; a failed related-services call shows none.
   */
  readonly data = toSignal(this.route.params.pipe(
    switchMap(params => zip(
      this.resourceService.getServiceOrDatasource(params['id']) as Observable<Service>,
      this.resourceService.getUiVocabularies() as unknown as Observable<Map<string, UiVocabulary[]>>
    ).pipe(
      switchMap(([service, vocabularies]) => {
        service.extras['openAireChangeLog'].reverse();
        return this.relatedServices(service).pipe(map(relatedServices => ({service, vocabularies, relatedServices})));
      }),
      catchError(error => {
        console.log(error);
        return EMPTY;
      })
    ))
  ), {initialValue: null as ServiceLandingData | null});

  readonly ready = computed(() => this.data() !== null);
  readonly payload = computed(() => this.data()?.service ?? null);

  /** The tab in the menu to highlight. */
  readonly path = toSignal(this.router.events.pipe(
    filter(event => event instanceof NavigationEnd),
    map(event => tabOf(event.urlAfterRedirects))
  ), {initialValue: tabOf(this.router.url)});

  /** Only OpenAIRE's own members may edit a service from here. */
  readonly canAddOrEditService = toSignal(this.session.ready$.pipe(
    switchMap(user => user && this.projectName === 'OpenAIRE Catalogue'
      ? this.resourceService.getMyServiceProviders().pipe(
        map(providers => providers.some(provider => provider.id === 'openaire')),
        catchError(error => {
          console.log(error.error);
          return of(false);
        }))
      : of(false))
  ), {initialValue: false});

  readonly showLogo = signal(false);

  private relatedServices(service: Service): Observable<Service[]> {
    const ids = service.relatedResources;
    if (ids == null || ids.length === 0 || (ids.length === 1 && ids[0] === null)) {
      return of([]);
    }
    return this.resourceService.getServicesByIdArray(ids).pipe(
      catchError(error => {
        console.log(error);
        return of([]);
      })
    );
  }

  goto(url: URL) {
    window.open(url.toString(), '_blank');
  }

  checkNavbarSticky() {
    const navbar = document.getElementById('myNavBar');
    this.showLogo.set(!!navbar && navbar.classList.contains('uk-active') && navbar.classList.contains('uk-navbar-sticky'));
  }
}

function tabOf(url: string): string | undefined {
  return ['overview', 'subscriptions', 'resourcesAndSupport', 'miscellaneous'].find(tab => url.includes(tab));
}
