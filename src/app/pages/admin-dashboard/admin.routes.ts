import {Routes} from '@angular/router';
import {authGuard} from '../../services/auth.guard';





export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./admin-dashboard.component').then(m => m.AdminDashboardComponent),
    children: [
      {
        path: '',
        redirectTo: 'providers',
        pathMatch: 'full'
      },
      {
        path: 'providers',
        loadComponent: () => import('./providers/all-providers.component').then(m => m.AllProvidersDashboardComponent),
        canActivate: [authGuard],
        data: {
          dashboardMode: true
        },
      },
      {
        path: 'services',
        loadComponent: () => import('./services/all-services.component').then(m => m.AllServicesDashboardComponent),
        canActivate: [authGuard],
        data: {
          dashboardMode: true
        },
      },
      {
        path: 'datasources',
        loadComponent: () => import('./datasources/all-datasources.component').then(m => m.AllDatasourcesDashboardComponent),
        canActivate: [authGuard],
        data: {
          dashboardMode: true
        },
      }
    ]
  }
];
