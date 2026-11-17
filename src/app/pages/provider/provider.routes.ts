import {Routes} from '@angular/router';
import {authGuard} from '../../services/auth.guard';









// Loaded under /provider (app.routes.ts), so the paths here leave that prefix out.
export const PROVIDER_ROUTES: Routes = [
  {
    path: 'add',
    loadComponent: () => import('./form/service-provider-form.component').then(m => m.ServiceProviderFormComponent),
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
        loadComponent: () => import('./dashboard/provider-dashboard.component').then(m => m.ProviderDashboardComponent),
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
            loadComponent: () => import('./dashboard/provider-home/provider-home.component').then(m => m.ProviderHomeComponent),
            canActivate: [authGuard],
            data: {
              dashboardMode: true
            },
          },
          {
            path: 'info',
            loadComponent: () => import('./dashboard/provider-Info/provider-info.component').then(m => m.ProviderInfoComponent),
            canActivate: [authGuard],
            data: {
              dashboardMode: true
            },
          },
          {
            path: 'history',
            loadComponent: () => import('./dashboard/provider-history/provider-history.component').then(m => m.ProviderHistoryComponent),
            canActivate: [authGuard],
            data: {
              dashboardMode: true
            },
          },
          {
            path: 'fullHistory',
            loadComponent: () => import('./dashboard/provider-history/provider-full-history.component').then(m => m.ProviderFullHistoryComponent),
            canActivate: [authGuard],
            data: {
              dashboardMode: true
            },
          },
          {
            path: 'services',
            loadComponent: () => import('./dashboard/provider-services/provider-services.component').then(m => m.ProviderServicesComponent),
            canActivate: [authGuard],
            data: {
              dashboardMode: true
            },
          }
        ]
      },
      {
        path: 'update',
        loadComponent: () => import('./form/update-service-provider.component').then(m => m.UpdateServiceProviderComponent),
        canActivate: [authGuard],
        data: {
          breadcrumb: 'Update Provider'
        }
      }
    ]
  }
];
