import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {FormGroup} from '@angular/forms';

import {FormControlService} from './form-control.service';
import {FormModel} from '../../../domain/dynamic-form-model';
import {ResourceService} from '../../../services/resource.service';
import {zip} from 'rxjs/internal/observable/zip';
import {Paging} from '../../../domain/paging';
import {Provider, Service, Vocabulary} from '../../../domain/eic-model';
import {environment} from '../../../../environments/environment';

declare var UIkit: any;

@Component({
  selector: 'app-dynamic-form',
  templateUrl: './dynamic-form.component.html',
  providers: [FormControlService]
})
export class DynamicFormComponent implements OnChanges, OnInit{

  @Input() fields: FormModel[] = null;

  vocabularies: Map<string, Vocabulary[]>;
  providersPage: Paging<Provider>;
  resources: any;
  editMode = false;

  serviceORresource = environment.serviceORresource;
  projectName = environment.projectName;

  service: Service;
  form: FormGroup;
  tabs: boolean[] = [false, false, false, false, false, false, false, false, false, false, false, false];
  errorMessage = '';
  successMessage = '';
  ready: boolean;
  hasChanges = false;
  pendingService = false;
  serviceName = '';

  loaderPercentage = 0;
  requiredOnTab: number[] = [];
  remainingOnTab: number[] = [];
  requiredTabs = 0;
  completedTabs = 0;
  requiredTotal = 0;

  constructor(private qcs: FormControlService, private resourceService: ResourceService) {}

  ngOnInit() {
    this.ready = false;
    zip(
      this.resourceService.getProvidersNames(),
      this.resourceService.getAllVocabulariesByType(),
      this.resourceService.getServices()
    ).subscribe(suc => {
        this.providersPage = <Paging<Provider>>suc[0];
        this.vocabularies = <Map<string, Vocabulary[]>>suc[1];
        this.resources = this.transformInput(suc[2]);
      },
      error => {
        this.errorMessage = 'Something went bad while getting the data for page initialization. ' + JSON.stringify(error.error.error);
      },
      () => {
        this.ready = true;

      }
    );
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.fields.currentValue !== null) {
      this.form = this.qcs.toFormGroup(changes.fields.currentValue);
      changes.fields.currentValue.forEach(group => {
        this.requiredOnTab.push(group.required.topLevel);
        if (group.required.topLevel > 0) {
          this.requiredTabs++;
        }
        this.remainingOnTab.push(group.required.topLevel);
        this.requiredTotal += group.required.total;
      });
    }
  }

  onSubmit(service: Service, tempSave: boolean, pendingService?: boolean) {
  }

  /** Transform Services to an array with name and id value **/
  transformInput(input) {
    const arr = [];
    for (const i in input) {
      arr.push({
        'name': input[i][0].resourceOrganisation + ' - ' + input[i][0].name,
        'id': input[i][0].id
      });
    }
    return arr;
  }

  openPreviewModal() {
    // console.log('Resource ==>', this.serviceForm.value);
    UIkit.modal('#modal-preview').show();
  }
}
