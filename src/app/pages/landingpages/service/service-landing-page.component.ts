import {ChangeDetectionStrategy, Component, computed, inject, signal} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {ActivatedRoute, NavigationEnd, Router, RouterLink, RouterOutlet} from '@angular/router';
import {EMPTY, Observable, of, zip} from 'rxjs';
import {catchError, filter, map, switchMap} from 'rxjs/operators';
import {Service, URL} from '../../../entities/eic-model';
import {canEditOpenAireServices} from '../../../shared/can-edit-openaire-services';
import {ResourceService} from '../../../services/resource.service';
import {environment} from '../../../../environments/environment';

@Component({
  selector: 'app-service-landing-page',
  templateUrl: './service-static-landing-page.component.html',
  styleUrl: './service-static-landing-page.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterOutlet],
  host: {'(window:scroll)': 'checkNavbarSticky()'}
})
export class ServiceLandingPageComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private resourceService = inject(ResourceService);

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
      this.resourceService.getUiVocabularies()
    ).pipe(
      switchMap(([service, vocabularies]) => {
        // Newest first; a service without a change log shows none (the tabs check for it).
        service.extras['openAireChangeLog']?.reverse();
        return this.relatedServices(service).pipe(map(relatedServices => ({service, vocabularies, relatedServices})));
      }),
      catchError(error => {
        console.error(error);
        return EMPTY;
      })
    ))
  ), {initialValue: null});

  readonly ready = computed(() => this.data() !== null);
  readonly payload = computed(() => this.data()?.service ?? null);

  /** The tab in the menu to highlight. */
  readonly path = toSignal(this.router.events.pipe(
    filter(event => event instanceof NavigationEnd),
    map(event => tabOf(event.urlAfterRedirects))
  ), {initialValue: tabOf(this.router.url)});

  /** Only OpenAIRE's own members may edit a service from here. */
  readonly canAddOrEditService = canEditOpenAireServices();

  readonly showLogo = signal(false);

  private relatedServices(service: Service): Observable<Service[]> {
    const ids = service.relatedResources;
    if (ids == null || ids.length === 0 || (ids.length === 1 && ids[0] === null)) {
      return of([]);
    }
    return this.resourceService.getServicesByIdArray(ids).pipe(
      catchError(error => {
        console.error(error);
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
