import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {RouterLink} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {DatePipe} from '@angular/common';
import {NgOptionComponent, NgSelectComponent} from '@ng-select/ng-select';
import {Bundle, Datasource} from '../../../entities/eic-model';
import {ResourceService} from '../../../services/resource.service';
import {AdminListComponent} from '../admin-list';

@Component({
  selector: 'app-admin-all-datasources-dashboard',
  templateUrl: 'all-datasources.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgSelectComponent, FormsModule, NgOptionComponent, RouterLink, DatePipe]
})
export class AllDatasourcesDashboardComponent extends AdminListComponent<Bundle<Datasource>> {
  private resourceService = inject(ResourceService);

  readonly list = this.load(parameters => this.resourceService.getBundleOfDatasources(parameters));
  readonly datasourceState = this.vocabulary('Datasource state');

  verifyDatasource(id: string, active: boolean, status: string) {
    this.verify(this.resourceService.verifyDatasource(id, active, status));
  }

  toggleDatasourceActive(bundle: Bundle<Datasource>) {
    this.toggleActive(bundle, (id, active) => this.resourceService.publishDatasource(id, active));
  }

  deleteDatasource(bundle: Bundle<Datasource>) {
    this.showLoader.set(true);
    this.resourceService.deleteDatasource(bundle.id).subscribe({
      error: error => {
        this.showLoader.set(false);
        this.errorMessage.set('Something went bad. ' + error.error);
      },
      complete: () => window.location.reload()
    });
  }
}
