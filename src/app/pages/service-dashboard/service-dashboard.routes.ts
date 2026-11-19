import {Routes} from '@angular/router';
import {authGuard} from '../../services/auth.guard';



import {environment} from '../../../environments/environment';

export const SERVICE_DASHBOARD_ROUTES: Routes = [
  {
    path: ':providerId/:resourceId',
    loadComponent: () => import('./service-dashboard.component').then(m => m.ServiceDashboardComponent),
    canActivate: [authGuard],
    data: {
      breadcrumb: environment.serviceORresource + ' dashboard'
      // breadcrumb: 'My Service Providers',
      // link: '/provider/my'
    },
    children : [
      {
        path: '',
        redirectTo: 'history',
        pathMatch: 'full',
        // data: {
        //   breadcrumb: 'Provider Dashboard'
        // }
      },
      {
        path: 'history',
        loadComponent: () => import('./service-history.component').then(m => m.ServiceHistoryComponent),
        data: {
          dashboardMode: true
        },
      },
      {
        path: 'fullHistory',
        loadComponent: () => import('./service-full-history.component').then(m => m.ServiceFullHistoryComponent),
        data: {
          dashboardMode: true
        },
      }
    ]
  },
];
