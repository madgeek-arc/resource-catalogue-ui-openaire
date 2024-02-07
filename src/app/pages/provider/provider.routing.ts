import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CanActivateViaAuthGuard} from '../../services/can-activate-auth-guard.service';
import {UpdateServiceProviderComponent} from './form/update-service-provider.component';
import {ProviderDashboardComponent} from './dashboard/provider-dashboard.component';
import {ProviderInfoComponent} from './dashboard/provider-Info/provider-info.component';
import {ProviderHomeComponent} from './dashboard/provider-home/provider-home.component';
import {ProviderHistoryComponent} from './dashboard/provider-history/provider-history.component';
import {ProviderFullHistoryComponent} from './dashboard/provider-history/provider-full-history.component';
import {ProviderServicesComponent} from './dashboard/provider-services/provider-services.component';
import {ServiceProviderFormComponent} from './form/service-provider-form.component';

const providerRoutes: Routes = [
  {
    path: 'provider/add',
    component: ServiceProviderFormComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'Add new Provider'
    }
  },
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
            path: 'history',
            component: ProviderHistoryComponent,
            canActivate: [CanActivateViaAuthGuard],
            data: {
              dashboardMode: true
            },
          },
          {
            path: 'fullHistory',
            component: ProviderFullHistoryComponent,
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
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(providerRoutes)],
  exports: [RouterModule]
})

export class ProviderRouting {
}
