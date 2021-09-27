import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {BrowseCategoriesComponent} from '../lib/pages/browsecategories/browse-categories.component';
import {CompareServicesComponent} from '../lib/pages/compare/compare-services.component';
import {HomeComponent} from '../lib/pages/home/home.component';
import {CommonModule} from '@angular/common';
import {SearchComponent} from '../lib/pages/search/search.component';
import {SearchAireComponent} from './pages/search/search.aire.component';
import {CanActivateViaAuthGuard} from '../lib/services/can-activate-auth-guard.service';
import {ServiceLandingPageComponent} from 'src/app/pages/landingpages/service/service-landing-page.component';
import {ForbiddenPageComponent} from '../lib/shared/forbidden-page/forbidden-page.component';
import {NotFoundPageComponent} from '../lib/shared/not-found-page/not-found-page.component';
// import {ProviderModule} from './pages/provider/provider.module';
import {environment} from '../environments/environment';
import {ServiceUploadComponent} from '../lib/pages/provider-resources/service-upload.component';
import {ServiceEditComponent} from '../lib/pages/provider-resources/service-edit.component';
import {DynamicFormEditComponent} from '../lib/pages/provider-resources/dynamic-service-form/dynamic-form-edit.component';
import {DynamicFormComponent} from '../lib/pages/provider-resources/dynamic-service-form/dynamic-form.component';
import {HomeAireComponent} from './pages/home/home.aire.component';
import {PortfolioItemComponent} from './pages/landingpages/portfolio/portfolio-item.component';
import {UserItemComponent} from './pages/landingpages/user/user-item.component';

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
    path: 'form',
    component: DynamicFormComponent,
    data: {
      breadcrumb: 'forms'
    }
  },

  {
    path: 'edit/:id',
    component: DynamicFormEditComponent,
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
    path: 'provider',
    loadChildren: () => import('../lib/pages/provider/provider.module').then(m => m.ProviderModule),
    canActivate: [CanActivateViaAuthGuard]
  },

  {
    path: 'resource-dashboard',
    loadChildren: () => import('../lib/pages/provider/dashboard/resource-dashboard/resource-dashboard.module').then(m => m.ResourceDashboardModule),
    canActivate: [CanActivateViaAuthGuard]
  },

  {
    path: 'service',
    loadChildren: () => import('../app/pages/landingpages/service/service-landing-page.module').then(m => m.ServiceLandingPageModule),
  },
  // {
  //   path: 'service/:id/:version',
  //   component: ServiceLandingPageComponent,
  //   data: {
  //     breadcrumb: 'Service'
  //   }
  // },
  {
    path: 'provider/openaire/resource/add',
    component: ServiceUploadComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'Add ' + environment.serviceORresource
    }
  },
  {
    path: 'provider/openaire/resource/update/:resourceId',
    component: ServiceEditComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'Edit ' + environment.serviceORresource
    }
  },
  {
    path: 'assets/files/:fileName',
    children: [ ]
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
    RouterModule.forRoot(appRoutes, { relativeLinkResolution: 'legacy' })
  ],
  declarations: [],
  exports: [RouterModule]
})

export class AppRoutingModule {
}
