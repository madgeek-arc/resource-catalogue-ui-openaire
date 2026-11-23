import {ChangeDetectionStrategy, Component, computed, inject, signal} from '@angular/core';
import {RouterLink} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {DatePipe} from '@angular/common';
import {NgOptionComponent, NgSelectComponent} from '@ng-select/ng-select';
import {Bundle, Service} from '../../../entities/eic-model';
import {ResourceService} from '../../../services/resource.service';
import {AdminListComponent} from '../admin-list';

@Component({
  selector: 'app-admin-all-services-dashboard',
  templateUrl: 'all-services.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgSelectComponent, FormsModule, NgOptionComponent, RouterLink, DatePipe]
})
export class AllServicesDashboardComponent extends AdminListComponent<Bundle<Service>> {
  private resourceService = inject(ResourceService);

  readonly list = this.load(parameters => this.resourceService.getBundleOfServices(parameters));
  readonly resourceState = this.vocabulary('Resource state');

  /** The providers of the current page's services, to filter by; the selected one is not read back from the URL. */
  readonly providerFacet = computed(() =>
    this.list()?.facets.find(facet => facet.field === 'resource_organisation')?.values ?? []);
  readonly provider = signal<string | null>(null);

  verifyService(id: string, active: boolean, status: string) {
    this.verify(this.resourceService.verifyService(id, active, status));
  }

  toggleServiceActive(bundle: Bundle<Service>) {
    this.toggleActive(bundle, (id, active) => this.resourceService.publishService(id, active));
  }

  deleteService(bundle: Bundle<Service>) {
    this.showLoader.set(true);
    this.resourceService.deleteService(bundle.id).subscribe({
      error: error => {
        this.showLoader.set(false);
        this.errorMessage.set('Something went bad. ' + error.error);
      },
      complete: () => window.location.reload()
    });
  }
}
