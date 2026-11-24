import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {RouterLink} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {DatePipe} from '@angular/common';
import {NgOptionComponent, NgSelectComponent} from '@ng-select/ng-select';
import {ProviderBundle} from '../../../entities/eic-model';
import {ProviderService} from '../../../services/provider.service';
import {AdminListComponent} from '../admin-list';

@Component({
  selector: 'app-admin-all-providers-dashboard',
  templateUrl: 'all-providers.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgSelectComponent, FormsModule, NgOptionComponent, RouterLink, DatePipe]
})
export class AllProvidersDashboardComponent extends AdminListComponent<ProviderBundle> {
  private providerService = inject(ProviderService);

  readonly list = this.load(parameters => this.providerService.getProviderBundles(parameters));
  readonly providerState = this.vocabulary('Provider state');

  verifyProvider(id: string, active: boolean, status: string) {
    this.verify(this.providerService.verifyProvider(id, active, status));
  }

  toggleProviderActive(bundle: ProviderBundle) {
    this.toggleActive(bundle, (id, active) => this.providerService.publishProvider(id, active));
  }

  deleteProvider(providerId: string) {
    this.providerService.deleteProvider(providerId).subscribe({
      next: () => {
        UIkit.modal('#deletionModal').hide();
        location.reload();
      },
      error: error => {
        UIkit.modal('#deletionModal').hide();
        console.log(error);
      }
    });
  }
}
