import {Component, Injector, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {DatePipe} from '@angular/common';
import {ServiceFormComponent} from '../eInfraServices/service-form.component';
import {AuthenticationService} from '../../services/authentication.service';
import {ResourceService} from '../../services/resource.service';
import {Service} from '../../domain/eic-model';

@Component({
  selector: 'app-add-first-service',
  templateUrl: '../eInfraServices/service-form.component.html'
})
export class AddFirstServiceComponent extends ServiceFormComponent implements OnInit {

  pendingServices: Service[] = [];
  serviceId: string;

  constructor(protected injector: Injector,
              protected authenticationService: AuthenticationService,
              private route: ActivatedRoute,
              private datePipe: DatePipe) {
    super(injector, authenticationService);
    this.editMode = false;
  }

  ngOnInit() {
    super.ngOnInit();
    this.firstServiceForm = true;
    this.providerId = this.route.snapshot.paramMap.get('id');
    this.serviceId = this.route.snapshot.paramMap.get('serviceId');
    // console.log(this.serviceId);
    this.getFieldAsFormArray('providers').get([0]).setValue(this.providerId);
    if (this.serviceId) {
      this.editMode = true;
      this.resourceService.getRichService(this.serviceId).subscribe(
        richService => {
          ResourceService.removeNulls(richService.service);
          this.formPrepare(richService);
          this.serviceForm.patchValue(richService.service);
          for (const i in this.serviceForm.controls) {
            if (this.serviceForm.controls[i].value === null) {
              this.serviceForm.controls[i].setValue('');
            }
          }
          if (this.serviceForm.get('lastUpdate').value) {
            const lastUpdate = new Date(this.serviceForm.get('lastUpdate').value);
            this.serviceForm.get('lastUpdate').setValue(this.datePipe.transform(lastUpdate, 'yyyy-MM-dd'));
          }
        },
        err => this.errorMessage = 'Something went bad, server responded: ' + err.error);
    }
  }

  onSuccess(service) {
    this.successMessage = 'Service uploaded successfully!';
  }

  onSubmit(service: Service, tempSave: boolean) {
    if (this.serviceId) {
      service.id = this.serviceId;
    }
    super.onSubmit(service, tempSave);
  }
}
