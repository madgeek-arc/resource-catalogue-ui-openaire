import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CanActivateViaAuthGuard} from '../../services/can-activate-auth-guard.service';
import {UpdateServiceProviderComponent} from './form/update-service-provider.component';
import {ProviderDashboardComponent} from './dashboard/provider-dashboard.component';
import {ProviderInfoComponent} from './dashboard/providerInfo/provider-info.component';

const providerRoutes: Routes = [
  {
    path: 'provider/:providerId',
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        component: ProviderDashboardComponent,
        children: [
          {
            path: 'info',
            component: ProviderInfoComponent,
            canActivate: [CanActivateViaAuthGuard]
          }
        ]
      },
      {
        path: 'update',
        component: UpdateServiceProviderComponent,
        canActivate: [CanActivateViaAuthGuard],
        data: {
          breadcrumb: 'Update Provider'
        }
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(providerRoutes)],
  exports: [RouterModule]
})

export class ProviderRouting {
}
