import {Routes} from '@angular/router';







export const SERVICE_LANDING_PAGE_ROUTES: Routes = [
  {
    path: ':id',
    loadComponent: () => import('./service-landing-page.component').then(m => m.ServiceLandingPageComponent),
    data: {
      breadcrumb: 'Service'
    },
    children: [
      {
        path: '',
        redirectTo: 'overview',
        pathMatch: 'full',
      },
      {
        path: 'overview',
        loadComponent: () => import('./overview/overview.component').then(m => m.OverviewComponent),
      },
      {
        path: 'subscriptions',
        loadComponent: () => import('./pricing/pricing.component').then(m => m.PricingComponent),
      },
      {
        path: 'resourcesAndSupport',
        loadComponent: () => import('./resourcesAndSupport/resourcesAndSupport.component').then(m => m.ResourcesAndSupportComponent),
      },
      {
        path: 'miscellaneous',
        loadComponent: () => import('./miscellaneous/miscellaneous.component').then(m => m.MiscellaneousComponent),
      },
      {
        path: 'changeLog',
        loadComponent: () => import('./resourcesAndSupport/changeLog/change-log.component').then(m => m.ChangeLogComponent),
      },
      {
        path: 'changeLogClean',
        loadComponent: () => import('./resourcesAndSupport/changeLog/change-log.component').then(m => m.ChangeLogComponent),
      }
    ],
    runGuardsAndResolvers: 'always'
  }
];
