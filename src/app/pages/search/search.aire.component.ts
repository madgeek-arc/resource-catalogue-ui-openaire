import {Component, OnInit} from '@angular/core';
import {SearchComponent} from 'src/lib/pages/search/search.component';
import {Provider} from 'src/lib/domain/eic-model';

declare var UIkit: any;

@Component({
  selector: 'app-search',
  templateUrl: './search.aire.component.html',
  styleUrls: ['../../../lib/pages/search/search.component.css']
})
export class SearchAireComponent extends SearchComponent implements OnInit {
  canAddOrEditService: boolean;
  myProviders:  Provider[] = [];

  ngOnInit() {
    super.ngOnInit();
    this.canAddOrEditService = false;
    this.resourceService.getMyServiceProviders().subscribe(
      res => this.myProviders = res,
      er => console.log(er),
      () => this.canAddOrEditService = this.myProviders.some(p => p.id === 'openaire')
    );
  }
}
