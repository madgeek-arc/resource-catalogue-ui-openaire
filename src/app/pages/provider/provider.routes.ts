import {Routes} from '@angular/router';
import {authGuard} from '../../services/auth.guard';
import {UpdateServiceProviderComponent} from './form/update-service-provider.component';
import {ProviderDashboardComponent} from './dashboard/provider-dashboard.component';
import {ProviderInfoComponent} from './dashboard/provider-Info/provider-info.component';
import {ProviderHomeComponent} from './dashboard/provider-home/provider-home.component';
import {ProviderHistoryComponent} from './dashboard/provider-history/provider-history.component';
import {ProviderFullHistoryComponent} from './dashboard/provider-history/provider-full-history.component';
import {ProviderServicesComponent} from './dashboard/provider-services/provider-services.component';
import {ServiceProviderFormComponent} from './form/service-provider-form.component';

// Loaded under /provider (app.routes.ts), so the paths here leave that prefix out.
export const PROVIDER_ROUTES: Routes = [
  {
    path: 'add',
    component: ServiceProviderFormComponent,
    canActivate: [authGuard],
    data: {
      breadcrumb: 'Add new Provider'
    }
  },
  {
    path: ':providerId',
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
            canActivate: [authGuard],
            data: {
              dashboardMode: true
            },
          },
          {
            path: 'info',
            component: ProviderInfoComponent,
            canActivate: [authGuard],
            data: {
              dashboardMode: true
            },
          },
          {
            path: 'history',
            component: ProviderHistoryComponent,
            canActivate: [authGuard],
            data: {
              dashboardMode: true
            },
          },
          {
            path: 'fullHistory',
            component: ProviderFullHistoryComponent,
            canActivate: [authGuard],
            data: {
              dashboardMode: true
            },
          },
          {
            path: 'services',
            component: ProviderServicesComponent,
            canActivate: [authGuard],
            data: {
              dashboardMode: true
            },
          }
        ]
      },
      {
        path: 'update',
        component: UpdateServiceProviderComponent,
        canActivate: [authGuard],
        data: {
          breadcrumb: 'Update Provider'
        }
      }
    ]
  }
];
