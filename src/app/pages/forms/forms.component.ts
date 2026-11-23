import { Component, OnInit, ChangeDetectionStrategy, DestroyRef, inject, signal } from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {UntypedFormGroup} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {Model, VocabularyLookup} from '../../../catalogue-ui/domain/dynamic-form-model';
import {FormControlService} from '../../../catalogue-ui/services/form-control.service';
import {SurveyComponent} from '../../../catalogue-ui/pages/dynamic-form/survey.component';
import {ResourceService} from '../../services/resource.service';
import {zip} from 'rxjs';
import {Datasource, Service, Vocabulary} from '../../entities/eic-model';
import {PremiumSortPipe} from '../../shared/pipes/premium-sort.pipe';


@Component({
    selector: 'app-form',
    templateUrl: 'forms.component.html',
    providers: [FormControlService],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [SurveyComponent]
})

export class FormsComponent implements OnInit{
  private formService = inject(FormControlService);
  private resourceService = inject(ResourceService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  tabsHeader: string | null = null;
  /** The form model, the resource being edited and the vocabularies, set together once they have all loaded. */
  readonly model = signal<Model | null>(null);
  readonly vocabulariesMap = signal<VocabularyLookup>({});
  readonly subVocabulariesMap = signal<VocabularyLookup | null>(null);
  premiumSort = new PremiumSortPipe();
  providerId: string | null = null;
  resourceId: string | null = null;
  datasourceId: string | null = null;
  resourceType: string | null = null;
  readonly payloadAnswer = signal<object | null>(null); // Find a way to do this better
  readonly ready = signal(false);
  readonly errorMessage = signal<string | null>(null);
  editMode = false;

  ngOnInit() {
    this.ready.set(false);
    this.route.params.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
      params => {
        this.providerId = params['providerId'];
        this.resourceId = params['resourceId'];
        this.datasourceId = params['datasourceId'];
        // The router has the new URL by the time the route's params arrive.
        const url = this.router.url;
        if (url.includes('service/add') || url.includes('service/edit')) this.resourceType = 'service';
        if (url.includes('subprofile/add') || url.includes('subprofile/edit')) this.resourceType = 'datasource';
        if (url.includes('service/edit') || url.includes('subprofile/edit')) this.editMode = true;
        if (this.editMode) { // edit
          // The edit routes are service/edit/:resourceId and :resourceType/subprofile/edit/:datasourceId.
          zip(
            this.resourceType === 'service' ? this.resourceService.getService(this.resourceId!) : this.resourceService.getDatasource(this.datasourceId!),
            this.formService.getFormModelByResourceType(this.resourceType),
            this.resourceService.getUiVocabularies()).subscribe(
            next => {
              const model = next[1].results[0];
              const vocabularies = next[2];
              const subVocabularies = this.prepareVocabularies(vocabularies);
              this.vocabulariesMap.set(vocabularies);
              this.subVocabulariesMap.set(subVocabularies);
              this.model.set(model);
              this.payloadAnswer.set({answer: {[this.sectionName]: next[0]}});
            },
            error => {console.log(error);},
            () => this.ready.set(true)
          );
        } else { // add new
          // console.log('add new');
          zip(
            this.formService.getFormModelByResourceType(this.resourceType),
            this.resourceService.getUiVocabularies()).subscribe(
            next => {
              const vocabularies = next[1];
              const subVocabularies = this.prepareVocabularies(vocabularies);
              this.vocabulariesMap.set(vocabularies);
              this.subVocabulariesMap.set(subVocabularies);
              this.model.set(next[0].results[0]);
            },
            error => {console.log(error);},
            () => this.ready.set(true)
          );
        }

      },
      error => {console.log(error);}
    );
  }

  /**
   * The form group holding the resource is named after the model's section: 'service' or 'datasource' in the
   * current form models ('Service' in older ones).
   */
  get sectionName(): string {
    return this.model()?.sections?.[0]?.name || 'Service';
  }

  /** The survey emits its form and whether it was editing. */
  submitForm(value: [UntypedFormGroup, boolean]) {
    this.ready.set(false);
    // console.log(value[0].get('Service').value);
    // The survey's form has a group named after the model's section (see sectionName).
    const service: Service = {...value[0].get(this.sectionName)!.value};
    // for (const element in value[0].get('Service').controls) {
    //   console.log(element+' is '+ value[0].get('Service').get(element).valid);
    //   console.log(value[0].get('Service').get(element).value);
    // }
    if (this.resourceType === 'service') {
      // The form always holds both lists, with at least one entry each; an empty first entry clears the list.
      if (!service.multimedia![0].multimediaURL) service.multimedia = null;
      if (!service.useCases![0].useCaseURL) service.useCases = null;
      if (value[1]) {
        this.resourceService.editService(service).subscribe(
          next => {
            this.router.navigate([`/service/${next.id}/overview`]);
          },
          error => {
            console.log(error);
            this.errorMessage.set(error.error.message + '\nFor more information please provide the error code to the system administrators. \nError Code: '+ error.error.transactionId);
            this.ready.set(true);
          }
        );
      } else {
        this.resourceService.postService(service).subscribe(
          next => {
            this.router.navigate([`/service/${next.id}/overview`]);
          },
          error => {
            console.log(error);
            this.errorMessage.set(error.error.message + '\nFor more information please provide the error code to the system administrators. \nError Code: '+ error.error.transactionId);
            this.ready.set(true);
          }
        );
      }
    }
    if (this.resourceType === 'datasource') {
      const datasource: Datasource = {...value[0].get(this.sectionName)!.value};
      // Subprofile routes have a resourceId (add) or a datasourceId (edit).
      const id = (this.resourceId || this.datasourceId)!;
      datasource.id = id;
      datasource.serviceId = id;
      datasource.catalogueId = 'openaire';
      if (value[1]) {
        this.resourceService.editDatasource(datasource).subscribe(
          next => {
            this.router.navigate([`/service/${next.id}/overview`]); //todo change page
          },
          error => {
            console.log(error);
            this.errorMessage.set(error.error.message + '\nFor more information please provide the error code to the system administrators. Error Code: '+ error.error.transactionId);
            this.ready.set(true);
          }
        );
      } else {
        this.resourceService.postDatasource(datasource).subscribe(
          next => {
            this.router.navigate([`/service/${next.id}/overview`]); //todo change page
          },
          error => {
            console.log(error);
            this.errorMessage.set(error.error.message + '\nFor more information please provide the error code to the system administrators. Error Code: '+ error.error.transactionId);
            this.ready.set(true);
          }
        );
      }
    }
  }

  /** Sorts the vocabularies in place, adds RegionOrCountry, and returns the sub-vocabularies grouped by parent. */
  prepareVocabularies(vocabulariesMap: Record<string, Vocabulary[]>): VocabularyLookup {
    this.sortVocabulariesByName(vocabulariesMap['Scientific domain']);
    this.sortVocabulariesByName(vocabulariesMap['Scientific subdomain']);
    this.sortVocabulariesByName(vocabulariesMap['Category']);
    this.sortVocabulariesByName(vocabulariesMap['Subcategory']);
    const voc: Vocabulary[] = vocabulariesMap['Subcategory'].concat(vocabulariesMap['Scientific subdomain']);
    const subVocabularies = this.groupByKey(voc, 'parentId');
    this.sortVocabulariesByName(vocabulariesMap['Access type']);
    this.sortVocabulariesByName(vocabulariesMap['Access mode']);
    this.sortVocabulariesByName(vocabulariesMap['Target user']);
    this.sortVocabulariesByName(vocabulariesMap['Language']);
    this.sortVocabulariesByName(vocabulariesMap['Country']);
    this.sortVocabulariesByName(vocabulariesMap['Technology readiness level']);
    this.sortVocabulariesByName(vocabulariesMap['Life cycle status']);
    this.sortVocabulariesByName(vocabulariesMap['Funding body']);
    this.sortVocabulariesByName(vocabulariesMap['Funding program']);
    vocabulariesMap['RegionOrCountry'] = vocabulariesMap['Country'].concat(vocabulariesMap['Region']);
    this.premiumSort.transform(vocabulariesMap['RegionOrCountry'], ['Europe', 'Worldwide']);
    return subVocabularies;
  }

  groupByKey(array: Vocabulary[], key: keyof Vocabulary): Record<string, Vocabulary[]> {
    return array.reduce<Record<string, Vocabulary[]>>((hash, obj) => {
      if (obj[key] === undefined) {
        return hash;
      }
      // Object keys are strings, so the value is the key as it was before.
      const group = String(obj[key]);
      return Object.assign(hash, {[group]: (hash[group] || []).concat(obj)});
    }, {});
  }

  sortVocabulariesByName(vocabularies: Vocabulary[]): Vocabulary[] {
    return vocabularies.sort((vocabulary1, vocabulary2) => {
      if (vocabulary1.name > vocabulary2.name) {
        return 1;
      }
      if (vocabulary1.name < vocabulary2.name) {
        return -1;
      }
      return 0;
    });
  }

}
