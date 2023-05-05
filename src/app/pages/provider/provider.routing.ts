import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CanActivateViaAuthGuard} from '../../services/can-activate-auth-guard.service';
import {UpdateServiceProviderComponent} from './form/update-service-provider.component';
import {ProviderDashboardComponent} from './dashboard/provider-dashboard.component';
import {ProviderInfoComponent} from './dashboard/provider-Info/provider-info.component';
import {ProviderHomeComponent} from './dashboard/provider-home/provider-home.component';
import {ProviderUpdateHistoryComponent} from './dashboard/provider-update-history/provider-update-history.component';
import {ProviderServicesComponent} from './dashboard/provider-services/provider-services.component';

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
            path: '',
            redirectTo: 'home',
            pathMatch: 'full',
            data: {
              dashboardMode: true
            },
          },
          {
            path: 'home',
            component: ProviderHomeComponent,
            canActivate: [CanActivateViaAuthGuard],
            data: {
              dashboardMode: true
            },
          },
          {
            path: 'info',
            component: ProviderInfoComponent,
            canActivate: [CanActivateViaAuthGuard],
            data: {
              dashboardMode: true
            },
          },
          {
            path: 'updateHistory',
            component: ProviderUpdateHistoryComponent,
            canActivate: [CanActivateViaAuthGuard],
            data: {
              dashboardMode: true
            },
          },
          {
            path: 'services',
            component: ProviderServicesComponent,
            canActivate: [CanActivateViaAuthGuard],
            data: {
              dashboardMode: true
            },
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
