import {Component, Input, OnInit} from '@angular/core';
import {Datasource, ProviderBundle, Service, Vocabulary} from '../../../../entities/eic-model';
import {ServiceProviderService} from '../../../../services/service-provider.service';
import {Paging} from '../../../../entities/paging';
import {URLParameter} from '../../../../entities/url-parameter';
import {zip} from 'rxjs/internal/observable/zip';
import {ResourceService} from '../../../../services/resource.service';

@Component({
  selector: 'app-provider-services',
  templateUrl: 'provider-services.component.html'
})

export class ProviderServicesComponent implements OnInit {

  @Input() providerBundle: ProviderBundle = null

  services: Paging<Service | Datasource> = null;
  vocabularies: Vocabulary[] = null;
  queryParams: URLParameter[] = []

  constructor(private providerService: ServiceProviderService, private resourceService: ResourceService,) {
  }

  ngOnInit() {
    this.providerService.getServicesOfProvider(this.providerBundle.provider.id, this.queryParams).subscribe(
      res => {
        this.services = res;
      }
    );
    zip(
      this.resourceService.getNewVocabulariesByType('Users'),
      this.resourceService.getNewVocabulariesByType('Portfolios')).subscribe(
      value => {
        this.vocabularies = value[0].concat(value[1]);
        // this.loading = false;
      },
      error => {console.log(error);}
    );
  }

  getVocabularyName(id: string) {
    for (const vocabulary of this.vocabularies) {
      if (vocabulary.id === id) {
        return vocabulary.name;
      }
    }
  }
}
