import {Routes} from '@angular/router';
import {SearchAireComponent} from './pages/search/search.aire.component';
import {authGuard} from './services/auth.guard';
import {ForbiddenPageComponent} from './shared/forbidden-page/forbidden-page.component';
import {NotFoundPageComponent} from './shared/not-found-page/not-found-page.component';
import {HomeAireComponent} from './pages/home/home.aire.component';
import {PortfolioItemComponent} from './pages/landingpages/portfolio/portfolio-item.component';
import {UserItemComponent} from './pages/landingpages/user/user-item.component';
import {FormsComponent} from './pages/forms/forms.component';
import {DatasourceSearchComponent} from './pages/search/datasources-search/datasourceSearch.component';
import {Datasource} from './pages/landingpages/datasource/datasource';
import {ProviderJoinComponent} from './pages/provider/join/provider-join.component';
import {JoinComponent} from './pages/public/join.component';
import {AboutComponent} from './pages/public/about.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    component: HomeAireComponent,
    data: {
      breadcrumb: 'Home'
    }
  },
  {
    path: 'search',
    component: SearchAireComponent,
    data: {
      breadcrumb: 'Search'
    }
  },
  {
    path: 'datasources/search',
    component: DatasourceSearchComponent,
    data: {
      breadcrumb: 'Datasources'
    }
  },
  {
    path: 'provider/:providerId/service/add',
    component: FormsComponent,
    canActivate: [authGuard],
    data: {
      breadcrumb: 'add service'
    }
  },
  {
    path: 'service/edit/:resourceId',
    component: FormsComponent,
    canActivate: [authGuard],
    data: {
      breadcrumb: 'edit service'
    }
  },
  {
    path: ':resourceType/subprofile/add/:resourceId',
    component: FormsComponent,
    canActivate: [authGuard],
    data: {
      breadcrumb: 'add datasource'
    }
  },
  {
    path: ':resourceType/subprofile/edit/:datasourceId',
    component: FormsComponent,
    canActivate: [authGuard],
    data: {
      breadcrumb: 'edit datasource'
    }
  },
  {
    path: 'form',
    component: FormsComponent,
    // canActivate: [authGuard],
    data: {
      breadcrumb: 'forms'
    }
  },
  {
    path: 'portfolios/:id',
    component: PortfolioItemComponent,
    data: {
      breadcrumb: 'portfolio'
    }
  },
  {
    path: 'users/:id',
    component: UserItemComponent,
    data: {
      breadcrumb: 'Users'
    }
  },
  {
    path: 'datasource/:datasourceId',
    component: Datasource,
    data: {
      breadcrumb: 'Datasource'
    }
  },
  {
    path: 'join/:token',
    component: ProviderJoinComponent,
    canActivate: [authGuard],
    data: {
      breadcrumb: 'Join'
    }
  },
  {
    path: 'join',
    component: JoinComponent,
    data: {
      breadcrumb: 'Join'
    }
  },
  {
    path: 'about',
    component: AboutComponent,
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
    component: ForbiddenPageComponent,
    data: {
      breadcrumb: 'Forbidden'
    }
  },
  {
    path: 'notFound',
    component: NotFoundPageComponent,
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
