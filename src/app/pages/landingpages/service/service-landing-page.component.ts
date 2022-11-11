import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Subscription} from 'rxjs';
import {Provider} from '../../../entities/eic-model';
import {ResourceService} from '../../../services/resource.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {environment} from 'src/environments/environment';
import {FormModel, UiVocabulary} from '../../../entities/dynamic-form-model';
import {PremiumSortPipe} from '../../../shared/pipes/premium-sort.pipe';

@Component({
  selector: 'app-service-landing-page',
  templateUrl: './service-static-landing-page.component.html',
  // styleUrls: ['../landing-page.component.css']
})
export class ServiceLandingPageComponent implements OnInit, OnDestroy {

  private subscriptions: Subscription[] = [];
  projectName = environment.projectName;
  vocabularies: Map<string, UiVocabulary[]>;
  model: FormModel[] = null;
  form: FormGroup = this.fb.group({service: this.fb.group({}), extras: this.fb.group({})}, Validators.required);
  id: string;
  ready = false;

  premiumSort = new PremiumSortPipe();
  path: string;
  myProviders:  Provider[] = [];
  canAddOrEditService = false;

  relatedServices: Object = null;
  resourcePayload: Object = null;

  constructor(public route: ActivatedRoute, public resourceService: ResourceService, private fb: FormBuilder) {
  }

  ngOnInit() {
    this.ready = false;

    this.subscriptions.push(
      this.route.params.subscribe(
        params => {
          this.id = params['id'];
          this.subscriptions.push(
            this.resourceService.getResource(this.id).subscribe(
              next => {this.resourcePayload = next;},
              error => {console.log(error);},
            () => {this.ready = true}
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
      component.model = this.model;
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

  goto(url: string) {
    window.open(url, '_blank');
  }

}
