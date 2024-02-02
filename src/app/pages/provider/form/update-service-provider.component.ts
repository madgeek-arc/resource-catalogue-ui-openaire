import {Component, OnInit} from '@angular/core';
import {Provider, Type} from '../../../entities/eic-model';
import {ServiceProviderFormComponent} from './service-provider-form.component';
import {ResourceService} from '../../../services/resource.service';
import {FormBuilder} from '@angular/forms';
import {AuthenticationService} from '../../../services/authentication.service';
import {ProviderService} from '../../../services/provider.service';
import {ActivatedRoute, Router} from '@angular/router';

declare var UIkit: any;

@Component({
  selector: 'app-update-service-provider',
  templateUrl: './service-provider-form.component.html',
  styleUrls: ['./service-provider-form.component.css']
})
export class UpdateServiceProviderComponent extends ServiceProviderFormComponent implements OnInit {
  errorMessage: string;
  provider: Provider;

  constructor(public fb: FormBuilder,
              public authService: AuthenticationService,
              public providerService: ProviderService,
              public resourceService: ResourceService,
              public router: Router,
              public route: ActivatedRoute) {
    super(fb, authService, providerService, resourceService, router, route);
  }

  ngOnInit() {
    this.edit = true;
    this.providerId = this.route.snapshot.paramMap.get('providerId');
    const path = this.route.snapshot.routeConfig.path;
    if (path === 'info/:providerId') {
      this.disable = true;
    }
    super.ngOnInit();
    if (sessionStorage.getItem('service')) {
      sessionStorage.removeItem('service');
    } else {
      if (this.vocabularies === null) {
        // this.resourceService.getAllVocabulariesByType().subscribe(
        //   res => {
        //     this.vocabularies = res;
        //     this.placesVocabulary = this.vocabularies[Type.COUNTRY];
        //     this.providerTypeVocabulary = this.vocabularies[Type.PROVIDER_STRUCTURE_TYPE];
        //     this.providerLCSVocabulary = this.vocabularies[Type.PROVIDER_LIFE_CYCLE_STATUS];
        //     this.domainsVocabulary =  this.vocabularies[Type.SCIENTIFIC_DOMAIN];
        //     this.categoriesVocabulary =  this.vocabularies[Type.SCIENTIFIC_SUBDOMAIN];
        //     this.esfriDomainVocabulary =  this.vocabularies[Type.PROVIDER_ESFRI_DOMAIN];
        //     this.legalStatusVocabulary =  this.vocabularies[Type.PROVIDER_LEGAL_STATUS];
        //     this.esfriVocabulary =  this.vocabularies[Type.PROVIDER_ESFRI_TYPE];
        //     this.areasOfActivityVocabulary =  this.vocabularies[Type.PROVIDER_AREA_OF_ACTIVITY];
        //     this.networksVocabulary =  this.vocabularies[Type.PROVIDER_NETWORK];
        //     this.societalGrandChallengesVocabulary =  this.vocabularies[Type.PROVIDER_SOCIETAL_GRAND_CHALLENGE];
        //   },
        //   error => console.log(error),
        //   () => {
        //     this.getProvider();
        //   }
        // );
        this.setVocabularies();
        this.getProvider();
      } else {
        this.getProvider();
      }
    }
  }

  registerProvider(tempSave: boolean) {
    super.registerProvider(tempSave);
  }

  getProvider() {
    this.errorMessage = '';
    const path = this.route.snapshot.routeConfig.path;
    this.providerService[(path === 'add/:providerId' ? 'getPendingProviderById' : 'getProviderById')](this.providerId)
      .subscribe(
      provider => this.provider = provider,
      err => {
        console.log(err);
        this.errorMessage = 'Something went wrong.';
      },
      () => {
        // console.log(Object.keys(this.provider));
        ResourceService.removeNulls(this.provider);
        // TODO: get it done this way
        // const keys = Object.keys(this.provider);
        // for (const key of keys) {
        //   if (key === 'id' || key === 'active' || key === 'status') { continue; }
        //   if (this.newProviderForm.controls[key].value.constructor === Array) {
        //     for (let i = 0; i < this.provider[key].length - 1; i++) {
        //       console.log(key);
        //       if (key === 'users') {
        //         this.addUser();
        //       } else {
        //         if (this.provider[key] && this.provider[key].length > 1) {
        //           for (let j = 0; j < this.provider[key].length - 1; j++) {
        //             this.push(key, false);
        //           }
        //         }
        //       }
        //     }
        //   }
        // }
        if (this.provider.users && this.provider.users.length > 1) {
          for (let i = 0; i < this.provider.users.length - 1; i++) {
            this.addUser();
          }
        } else if (path === 'add/:providerId') {
          this.addDefaultUser();
        }
        if (this.provider.multimedia && this.provider.multimedia.length > 1) {
          for (let i = 0; i < this.provider.multimedia.length - 1; i++) {
            this.multimediaArray.push(this.newMultimedia());
          }
        }
        if (this.provider.structureTypes && this.provider.structureTypes.length > 1) {
          for (let i = 0; i < this.provider.structureTypes.length - 1; i++) {
            this.push('structureTypes', this.structureTypesDesc.mandatory);
          }
        }

        if (this.provider.scientificDomains) {
          // this.removeDomain(0);
          for (let i = 0; i < this.provider.scientificDomains.length; i++) {
            this.domainArray.push(this.newScientificDomain());

            // for (let j = 0; j < this.categoriesVocabulary.length; j++) {
            //   if (this.categoriesVocabulary[j].id === this.provider.scientificDomains[i]) {
            //     this.domainArray.controls[this.domainArray.length - 1].get('domain').setValue(this.categoriesVocabulary[j].parentId);
            //     this.domainArray.controls[this.domainArray.length - 1].get('scientificSubdomain').setValue(this.categoriesVocabulary[j].id);
            //   }
            // }
          }
        } else {
          this.domainArray.push(this.newScientificDomain());
        }
        if (this.provider.merilScientificDomains) {
          // this.removeDomain(0);
          for (let i = 0; i < this.provider.merilScientificDomains.length; i++) {
            this.merilDomainArray.push(this.newMerilScientificDomain());

            // for (let j = 0; j < this.merilCategoriesVocabulary.length; j++) {
            //   if (this.merilCategoriesVocabulary[j].id === this.provider.merilScientificDomains[i]) {
            //     this.merilDomainArray.controls[this.merilDomainArray.length - 1].get('merilDomain').setValue(this.merilCategoriesVocabulary[j].parentId);
            //     this.merilDomainArray.controls[this.merilDomainArray.length - 1].get('merilScientificSubdomain').setValue(this.merilCategoriesVocabulary[j].id);
            //   }
            // }
          }
        } else {
          this.merilDomainArray.push(this.newMerilScientificDomain());
        }

        if (this.provider.esfriDomains && this.provider.esfriDomains.length > 1) {
          for (let i = 0; i < this.provider.esfriDomains.length - 1; i++) {
            this.push('esfriDomains', this.ESFRIDomainDesc.mandatory);
          }
        }
        if (this.provider.publicContacts && this.provider.publicContacts.length > 1) {
          for (let i = 0; i < this.provider.publicContacts.length - 1; i++) {
            this.pushPublicContact();
          }
        }
        if (this.provider.tags && this.provider.tags.length > 1) {
          for (let i = 0; i < this.provider.tags.length - 1; i++) {
            this.push('tags', this.providerTagsDesc.mandatory);
          }
        }
        if (this.provider.certifications && this.provider.certifications.length > 1) {
          for (let i = 0; i < this.provider.certifications.length - 1; i++) {
            this.push('certifications', this.providerCertificationsDesc.mandatory);
          }
        }
        if (this.provider.participatingCountries && this.provider.participatingCountries.length > 1) {
          for (let i = 0; i < this.provider.participatingCountries.length - 1; i++) {
            this.push('participatingCountries', this.participatingCountriesDesc.mandatory);
          }
        }
        if (this.provider.affiliations && this.provider.affiliations.length > 1) {
          for (let i = 0; i < this.provider.affiliations.length - 1; i++) {
            this.push('affiliations', this.affiliationDesc.mandatory);
          }
        }
        if (this.provider.networks && this.provider.networks.length > 1) {
          for (let i = 0; i < this.provider.networks.length - 1; i++) {
            this.push('networks', this.networksDesc.mandatory);
          }
        }
        if (this.provider.nationalRoadmaps && this.provider.nationalRoadmaps.length > 1) {
          for (let i = 0; i < this.provider.nationalRoadmaps.length - 1; i++) {
            this.push('nationalRoadmaps', this.nationalRoadmapsDesc.mandatory);
          }
        }
        if (this.provider.areasOfActivity && this.provider.areasOfActivity.length > 1) {
          for (let i = 0; i < this.provider.areasOfActivity.length - 1; i++) {
            this.push('areasOfActivity', this.areasOfActivityDesc.mandatory);
          }
        }
        if (this.provider.societalGrandChallenges && this.provider.societalGrandChallenges.length > 1) {
          for (let i = 0; i < this.provider.societalGrandChallenges.length - 1; i++) {
            this.push('societalGrandChallenges', this.societalGrandChallengesDesc.mandatory);
          }
        }
        this.newProviderForm.patchValue(this.provider);
        this.newProviderForm.updateValueAndValidity();
        if (this.disable) {
          this.newProviderForm.disable();
        }
        this.providerName = this.newProviderForm.get('name').value;
      }
    );
  }

  toggleDisable() {
    this.disable = !this.disable;
    this.newProviderForm.enable();
  }

}
