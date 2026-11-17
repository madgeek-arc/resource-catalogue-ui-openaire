import {Routes} from '@angular/router';

import {authGuard} from './services/auth.guard';












export const routes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.aire.component').then(m => m.HomeAireComponent),
    data: {
      breadcrumb: 'Home'
    }
  },
  {
    path: 'search',
    loadComponent: () => import('./pages/search/search.aire.component').then(m => m.SearchAireComponent),
    data: {
      breadcrumb: 'Search'
    }
  },
  {
    path: 'datasources/search',
    loadComponent: () => import('./pages/search/datasources-search/datasourceSearch.component').then(m => m.DatasourceSearchComponent),
    data: {
      breadcrumb: 'Datasources'
    }
  },
  {
    path: 'provider/:providerId/service/add',
    loadComponent: () => import('./pages/forms/forms.component').then(m => m.FormsComponent),
    canActivate: [authGuard],
    data: {
      breadcrumb: 'add service'
    }
  },
  {
    path: 'service/edit/:resourceId',
    loadComponent: () => import('./pages/forms/forms.component').then(m => m.FormsComponent),
    canActivate: [authGuard],
    data: {
      breadcrumb: 'edit service'
    }
  },
  {
    path: ':resourceType/subprofile/add/:resourceId',
    loadComponent: () => import('./pages/forms/forms.component').then(m => m.FormsComponent),
    canActivate: [authGuard],
    data: {
      breadcrumb: 'add datasource'
    }
  },
  {
    path: ':resourceType/subprofile/edit/:datasourceId',
    loadComponent: () => import('./pages/forms/forms.component').then(m => m.FormsComponent),
    canActivate: [authGuard],
    data: {
      breadcrumb: 'edit datasource'
    }
  },
  {
    path: 'form',
    loadComponent: () => import('./pages/forms/forms.component').then(m => m.FormsComponent),
    // canActivate: [authGuard],
    data: {
      breadcrumb: 'forms'
    }
  },
  {
    path: 'portfolios/:id',
    loadComponent: () => import('./pages/landingpages/portfolio/portfolio-item.component').then(m => m.PortfolioItemComponent),
    data: {
      breadcrumb: 'portfolio'
    }
  },
  {
    path: 'users/:id',
    loadComponent: () => import('./pages/landingpages/user/user-item.component').then(m => m.UserItemComponent),
    data: {
      breadcrumb: 'Users'
    }
  },
  {
    path: 'datasource/:datasourceId',
    loadComponent: () => import('./pages/landingpages/datasource/datasource').then(m => m.Datasource),
    data: {
      breadcrumb: 'Datasource'
    }
  },
  {
    path: 'join/:token',
    loadComponent: () => import('./pages/provider/join/provider-join.component').then(m => m.ProviderJoinComponent),
    canActivate: [authGuard],
    data: {
      breadcrumb: 'Join'
    }
  },
  {
    path: 'join',
    loadComponent: () => import('./pages/public/join.component').then(m => m.JoinComponent),
    data: {
      breadcrumb: 'Join'
    }
  },
  {
    path: 'about',
    loadComponent: () => import('./pages/public/about.component').then(m => m.AboutComponent),
    data: {
      breadcrumb: 'About'
    }
  },
  {
    path: 'provider',
    loadChildren: () => import('./pages/provider/provider.routes').then(m => m.PROVIDER_ROUTES),
    canActivate: [authGuard]
  },

  {
    path: 'service-dashboard',
    loadChildren: () => import('./pages/service-dashboard/service-dashboard.routes').then(m => m.SERVICE_DASHBOARD_ROUTES),
    canActivate: [authGuard]
  },

  {
    path: 'service',
    loadChildren: () => import('./pages/landingpages/service/service-landing-page.routes').then(m => m.SERVICE_LANDING_PAGE_ROUTES),
  },

  {
    path: 'admin',
    loadChildren: () => import('./pages/admin-dashboard/admin.routes').then(m => m.ADMIN_ROUTES),
    canActivate: [authGuard]
  },

  {
    path: 'forbidden',
    loadComponent: () => import('./shared/forbidden-page/forbidden-page.component').then(m => m.ForbiddenPageComponent),
    data: {
      breadcrumb: 'Forbidden'
    }
  },
  {
    path: 'notFound',
    loadComponent: () => import('./shared/not-found-page/not-found-page.component').then(m => m.NotFoundPageComponent),
    data: {
      breadcrumb: 'Not Found'
    }
  },
  {
    path: '**',
    redirectTo: 'notFound',
    pathMatch: 'full',
    data: {
      breadcrumb: 'Not Found'
    }
  }
];
