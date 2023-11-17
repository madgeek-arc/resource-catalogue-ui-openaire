import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Provider, ProviderBundle, Vocabulary} from '../../../../entities/eic-model';
import {ProviderService} from '../../../../services/provider.service';
import {ResourceService} from '../../../../services/resource.service';

@Component({
  selector: 'app-provider-info',
  templateUrl: 'provider-info.component.html'
})

export class ProviderInfoComponent implements OnInit, OnChanges {

  @Input() providerBundle: ProviderBundle = null;
  provider: Provider = null
  vocabularies: Map<string, Object[]> = null;

  constructor(private resourceService: ResourceService) {
  }

  ngOnInit() {
    this.resourceService.getUiVocabularies().subscribe(
      res => {this.vocabularies = res}
    );
    if (this.providerBundle) {
      this.provider = this.providerBundle.provider;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.providerBundle) {
      this.provider = this.providerBundle.provider;
    }
  }

  getVocabularyName(vocabularyType: string, id: string): string {
    // console.log(this.vocabularies);
    for (const vocabulary of this.vocabularies[vocabularyType]) {
      if (vocabulary.id === id)
        return vocabulary.name;
    }
  }

}
