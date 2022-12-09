import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CommonModule} from '@angular/common';
import {SearchAireComponent} from './pages/search/search.aire.component';
import {CanActivateViaAuthGuard} from './services/can-activate-auth-guard.service';
import {ForbiddenPageComponent} from './shared/forbidden-page/forbidden-page.component';
import {NotFoundPageComponent} from './shared/not-found-page/not-found-page.component';
import {HomeAireComponent} from './pages/home/home.aire.component';
import {PortfolioItemComponent} from './pages/landingpages/portfolio/portfolio-item.component';
import {UserItemComponent} from './pages/landingpages/user/user-item.component';
import {FormsComponent} from './pages/forms/forms.component';
import {DatasourceSearchComponent} from './pages/search/datasources-search/datasourceSearch.component';
import {Datasource} from './pages/landingpages/datasource/datasource';

const appRoutes: Routes = [
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
    path: 'provider/:providerId/:resourceType/add',
    component: FormsComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'forms'
    }
  },
  {
    path: 'form',
    component: FormsComponent,
    // canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'forms'
    }
  },
  {
    path: 'edit/:resourceId',
    component: FormsComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'edit'
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
    path: 'provider',
    loadChildren: () => import('../app/pages/provider/provider.module').then(m => m.ProviderModule),
    canActivate: [CanActivateViaAuthGuard]
  },

  {
    path: 'resource-dashboard',
    loadChildren: () => import('../app/pages/resource-dashboard/resource-dashboard.module').then(m => m.ResourceDashboardModule),
    canActivate: [CanActivateViaAuthGuard]
  },

  {
    path: 'service',
    loadChildren: () => import('../app/pages/landingpages/service/service-landing-page.module').then(m => m.ServiceLandingPageModule),
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

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forRoot(appRoutes,
      {
        relativeLinkResolution: 'legacy',
        // scrollPositionRestoration: 'enabled',
        scrollPositionRestoration: 'disabled',
        onSameUrlNavigation: 'reload'
      })
  ],
  declarations: [],
  exports: [RouterModule]
})

export class AppRoutingModule {
}
