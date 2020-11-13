import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {BrowseCategoriesComponent} from '../lib/pages/browsecategories/browse-categories.component';
import {CompareServicesComponent} from '../lib/pages/compare/compare-services.component';
import {HomeComponent} from '../lib/pages/home/home.component';
import {CommonModule} from '@angular/common';
import {SearchComponent} from '../lib/pages/search/search.component';
import {SearchAireComponent} from './pages/search/search.aire.component';
import {CanActivateViaAuthGuard} from '../lib/services/can-activate-auth-guard.service';
import {ServiceLandingPageComponent} from '../lib/pages/landingpages/service/service-landing-page.component';
import {ServiceLandingPageExtendedComponent} from './pages/landingpages/service/service-landing-page-extended.component';
import {ForbiddenPageComponent} from '../lib/shared/forbidden-page/forbidden-page.component';
import {NotFoundPageComponent} from '../lib/shared/not-found-page/not-found-page.component';
// import {ProviderModule} from './pages/provider/provider.module';
import {ServiceUploadExtendedComponent} from './pages/eInfraServices/service-upload-extended.component';
import {ServiceEditExtendedComponent} from './pages/eInfraServices/service-edit-extended.component';
import {environment} from '../environments/environment';

const appRoutes: Routes = [
  {
    path: '',
    redirectTo: '/search',
    pathMatch: 'full'
  },
  // {
  //   path: 'home',
  //   component: HomeComponent,
  //   data: {
  //     breadcrumb: 'Home'
  //   }
  // },
  {
    path: 'search',
    component: SearchAireComponent,
    data: {
      breadcrumb: 'Search'
    }
  },

  {
    path: 'resource-dashboard',
    loadChildren: '../lib/pages/provider/dashboard/resource-dashboard/resource-dashboard.module#ResourceDashboardModule',
    canActivate: [CanActivateViaAuthGuard]
  },

  {
    path: 'service/:id',
    component: ServiceLandingPageExtendedComponent,
    data: {
      breadcrumb: 'Service'
    }
  },
  {
    path: 'service/:id/:version',
    component: ServiceLandingPageComponent,
    data: {
      breadcrumb: 'Service'
    }
  },
  {
    path: 'provider/openaire/resource/add',
    component: ServiceUploadExtendedComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'Add ' + environment.serviceORresource
    }
  },
  {
    path: 'provider/openaire/resource/update/:resourceId',
    component: ServiceEditExtendedComponent,
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
    RouterModule.forRoot(appRoutes)
  ],
  declarations: [],
  exports: [RouterModule]
})

export class AppRoutingModule {
}
