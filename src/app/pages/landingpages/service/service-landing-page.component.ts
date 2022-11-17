import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Subscription} from 'rxjs';
import {Provider, Service, URL} from '../../../entities/eic-model';
import {ResourceService} from '../../../services/resource.service';
import {environment} from 'src/environments/environment';
import {FormModel} from '../../../entities/dynamic-form-model';
import {zip} from 'rxjs/internal/observable/zip';

@Component({
  selector: 'app-service-landing-page',
  templateUrl: './service-static-landing-page.component.html',
  // styleUrls: ['../landing-page.component.css']
})
export class ServiceLandingPageComponent implements OnInit, OnDestroy {

  private subscriptions: Subscription[] = [];
  projectName = environment.projectName;
  vocabularies: Map<string, object[]>;
  model: FormModel[] = null;
  id: string;
  ready = false;

  path: string;
  myProviders:  Provider[] = [];
  canAddOrEditService = false;

  relatedServices: Service[] = null;
  resourcePayload: Service = null;

  constructor(public route: ActivatedRoute, public resourceService: ResourceService) {
  }

  ngOnInit() {
    this.ready = false;

    this.subscriptions.push(
      this.route.params.subscribe(
        params => {
          this.id = params['id'];
          this.subscriptions.push(
            zip(this.resourceService.getResource(this.id),
              this.resourceService.getUiVocabularies()).subscribe(
              next => {
                  this.resourcePayload = next[0];
                  this.vocabularies = next[1];
                  this.resourceService.getServicesByIdArray(this.resourcePayload.relatedResources).subscribe(
                    next => {this.relatedServices = next},
                    error => {console.log(error)},
                    () => {this.ready = true}
                  );
                },
              error => {console.log(error);},
              () => {}
            )
          );
        }
      )
    );
  }

  ngOnDestroy(): void {
    for (let i = 0; i < this.subscriptions.length; i++) {
      this.subscriptions[i].unsubscribe();
    }
  }

  timeOut(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  onOutletLoaded(component) {
    if (!this.ready) {
      this.timeOut(300).then(() => this.onOutletLoaded(component));
      return;
    } else {
      component.resourcePayload = this.resourcePayload;
      component.vocabularies = this.vocabularies;
      component.relatedServices = this.relatedServices;
    }
    if (window.location.toString().includes('overview')) {
      this.path = 'overview';
    } else if (window.location.toString().includes('pricing')) {
      this.path = 'pricing';
    } else if (window.location.toString().includes('resourcesAndSupport')) {
      this.path = 'resourcesAndSupport';
    } else if (window.location.toString().includes('miscellaneous')) {
      this.path = 'miscellaneous';
    }

    return;
  }

  goto(url: URL) {
    window.open(url.toString(), '_blank');
  }

}
