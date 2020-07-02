import {Component, OnInit} from '@angular/core';
import {InfraService, Service} from '../../../../domain/eic-model';
import {ServiceProviderService} from '../../../../services/service-provider.service';
import {ActivatedRoute, Router} from '@angular/router';
import {ResourceService} from '../../../../services/resource.service';
import {Paging} from '../../../../domain/paging';

declare var UIkit: any;

@Component({
  selector: 'app-services',
  templateUrl: './services.component.html',
  styleUrls: ['./service.component.css']
})

export class ServicesComponent implements OnInit {
  errorMessage = '';
  providerId;
  providerServices: Paging<InfraService>;
  providerCoverage: string[];
  providerServicesGroupedByPlace: any;
  selectedService: InfraService = null;
  path: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private providerService: ServiceProviderService,
    private service: ResourceService
  ) {}

  ngOnInit(): void {
    this.path = this.route.snapshot.routeConfig.path;
    console.log('this.path: ', this.path);
    this.providerId = this.route.parent.snapshot.paramMap.get('provider');
    console.log('this.providerId: ', this.providerId);
    this.getServices();
  }

  groupServicesOfProviderPerPlace(services: InfraService[]) {
    const ret = {};
    if (this.providerServices && this.providerServices.results.length > 0) {
      for (const service of services) {
        if (service.service.geographicalAvailabilities && service.service.geographicalAvailabilities.length > 0) {
          for (const place of service.service.geographicalAvailabilities) {
            if (ret[place]) {
              ret[place].push(this.providerServices);
            } else {
              ret[place] = [];
            }
          }
        }
      }
    }
    return ret;
  }

  navigate(id: string) {
    if (this.path === 'activeServices') {
      this.router.navigate([`/dashboard/${this.providerId}`, id]);
    } else {
      this.router.navigate([`/editPendingService/`, id]);
    }
  }

  toggleService(id: string, version: string, event) {
    UIkit.modal('#spinnerModal').show();
    this.providerService.publishService(id, version, event.target.checked).subscribe(
      res => {},
      error => {
        this.errorMessage = 'Something went bad. ' + error.error ;
        this.getServices();
        UIkit.modal('#spinnerModal').hide();
        // console.log(error);
      },
      () => {
        this.getServices();
        UIkit.modal('#spinnerModal').hide();
      }
    );
  }

  getServices() {
    this.providerService[this.path === 'activeServices' ? 'getServicesOfProvider' : 'getPendingServicesByProvider'](this.providerId, 50)
      // this.providerService.getPendingServicesBundleByProvider(this.providerId)
      .subscribe(res => {
          this.providerServices = res;
          this.providerServicesGroupedByPlace = this.groupServicesOfProviderPerPlace(this.providerServices.results);
          if (this.providerServicesGroupedByPlace) {
            this.providerCoverage = Object.keys(this.providerServicesGroupedByPlace);

            // this.setCountriesForProvider(this.providerCoverage);
          }
        },
        err => {
          this.errorMessage = 'An error occurred while retrieving the services of this provider. ' + err.error;
        }
      );
  }

  setSelectedService(service: InfraService) {
    this.selectedService = service;
    UIkit.modal('#actionModal').show();
  }

  deleteService(id: string) {
    // UIkit.modal('#spinnerModal').show();
    this.service[this.path === 'activeServices' ? 'deleteService' : 'deletePendingService'](id).subscribe(
      res => {},
      error => {
        // console.log(error);
        // UIkit.modal('#spinnerModal').hide();
        this.errorMessage = 'Something went bad. ' + error.error ;
        this.getServices();
      },
      () => {
        this.getServices();
        // UIkit.modal('#spinnerModal').hide();
      }
    );
  }

}
