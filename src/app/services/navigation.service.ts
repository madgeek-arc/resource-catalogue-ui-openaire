import { Injectable, inject } from '@angular/core';
import {Params, Router} from '@angular/router';
import {Subject} from 'rxjs';

@Injectable({providedIn: 'root'})
export class NavigationService {
  router = inject(Router);


  public searchParams: Subject<Params> = new Subject();

  private breadcrumbs_: Subject<unknown> = new Subject<unknown>();

  service(id: string) {
    return this.router.navigate(['/service', id]);
  }

  dashboard(id: string) {
    return this.router.navigate([`/dashboard`, id]);
  }

  dashboardResources(providerId: string) {
    return this.router.navigate([`/dashboard/${providerId}/resources`]);
  }

  dashboardDraftResources(providerId: string) {
    return this.router.navigate([`/dashboard/${providerId}/draft-resources`]);
  }

  resourceDashboard(providerId: string, serviceId: string) {
    return this.router.navigate([`/resource-dashboard/${providerId}/${serviceId}/stats`]);
  }

  edit(id: string) {
    return this.router.navigateByUrl(`/provider/${id.split('.')[0]}/resource/update/${id}`);
  }

  editAIRE(id: string) {
    return this.router.navigate(['/provider/openaire/resource/update', id]);
  }

  search(params: Params) {
    return this.router.navigate(['/search', params]);
  }

  resourcesList(params: Params) {
    return this.router.navigate(['/provider/resource/all', params]);
  }

  /*login() {
      return this.router.navigate(["/signIn"]);
  }*/

  home() {
    return this.router.navigate(['/home']);
  }

  compare(params: Params) {
    return this.router.navigate(['/compare', params]);
  }

  go(url: string) {
    return this.router.navigate([url]);
  }

  goOffsite(url: string) {
    window.location.href = url;
  }

  public get paramsObservable() {
    return this.searchParams;
  }

  public get breadcrumbs() {
    return this.breadcrumbs_.asObservable();
  }

  public set breadcrumbs(breadcrumb: unknown) {
    this.breadcrumbs_.next(breadcrumb);
  }
}
