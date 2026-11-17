import {Component, OnChanges, OnInit, SimpleChanges, ChangeDetectionStrategy, inject} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {Bundle, Datasource, LoggingInfo, Provider, ProviderBundle, Service, ServiceBundle, Vocabulary} from '../../../../entities/eic-model';
import {ProviderService} from '../../../../services/provider.service';
import {ResourceService} from '../../../../services/resource.service';
import { DatePipe, TitleCasePipe } from '@angular/common';

@Component({
    selector: 'app-provider-home',
    templateUrl: 'provider-home.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RouterLink, TitleCasePipe, DatePipe]
})

export class ProviderHomeComponent implements OnInit, OnChanges {
  private router = inject(Router);
  private providerService = inject(ProviderService);
  private resourceService = inject(ResourceService);
  private datePipe = inject(DatePipe);


  // Set by ProviderDashboardComponent when the router outlet activates this page, not bound in a template,
  // so it stays a plain field (a signal input would be overwritten by that assignment).
  providerBundle: ProviderBundle = null;
  provider: Provider = null;
  loggingInfo: LoggingInfo[] = null;
  vocabularies: Map<string, object[]> = null;
  resourceBundles: ServiceBundle[] = null;
  approvedResourceBundles: ServiceBundle[] = null;
  pendingResourceBundles: ServiceBundle[] = null;
  rejectedResourceBundles: ServiceBundle[] = null;

  ngOnInit() {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;

    this.resourceService.getUiVocabularies().subscribe(
      res => {this.vocabularies = res;}
    );

    if (this.providerBundle) {
      this.provider = this.providerBundle.provider;
      this.loggingInfo = this.providerBundle.loggingInfo;
      this.getResourcesOfProvider();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.providerBundle) {
      this.provider = this.providerBundle.provider;
      this.loggingInfo = this.providerBundle.loggingInfo;
    }
  }

  getPayload(bundle: ServiceBundle): Service | Datasource {
    return bundle.service != null ? bundle.service : bundle.datasource;
  }

  getResourcesOfProvider() {
    this.providerService.getServicesOfProvider(this.providerBundle.provider.id, [{key: 'orderField', values: ['modifiedAt']}, {key: 'order', values:['desc']}]).subscribe(
      res => {this.resourceBundles = res.results;},
      error => {console.error(error);},
      () => {
        this.approvedResourceBundles = this.resourceBundles.filter(bundle => bundle.status === 'approved');
        this.pendingResourceBundles = this.resourceBundles.filter(bundle => bundle.status === 'pending');
        this.rejectedResourceBundles = this.resourceBundles.filter(bundle => bundle.status === 'rejected');
      }
    );
  }

  getVocabularyName(vocabularyType: string, id: string): string {
    return this.vocabularies[vocabularyType].find(vocabulary => vocabulary.id === id)?.name;
  }

  // formatLogDate(logDate: string): string {
  //   const dateObject = moment(logDate, 'ddd MMM DD HH:mm:ss Z YYYY');
  //   return dateObject.format('DD MMM YYYY');
  // }

}
