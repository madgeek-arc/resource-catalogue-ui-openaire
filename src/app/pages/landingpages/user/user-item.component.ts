import {Component, OnInit} from '@angular/core';
import {ResourceService} from '../../../../lib/services/resource.service';
import {Vocabulary} from '../../../../lib/domain/eic-model';
import {ActivatedRoute} from '@angular/router';
import {zip} from 'rxjs/internal/observable/zip';


@Component({
  selector: 'app-user-item',
  templateUrl: './user-item.component.html',
})
export class UserItemComponent implements OnInit {

  response: Map<string, Object[]>;
  services: Map<string, Object[]>;
  userVoc: Vocabulary;
  portfolios: Vocabulary[];
  portfoliosMap: Map<string, Object[]>;
  userVocId: string;
  ready = false;

  constructor(protected resourceService: ResourceService, protected route: ActivatedRoute) {
  }

  ngOnInit() {
    this.userVocId = this.route.snapshot.paramMap.get('id');
    zip(
      this.resourceService.getVocabularyById(this.userVocId),
      this.resourceService.getServicesByVocabularyTypeAndId('Users', this.userVocId),
      this.resourceService.getNewVocabulariesByType('PORTFOLIOS')
    ).subscribe(
      res => {
        this.userVoc = res[0];
        this.response = res[1];
        for (const [key, value] of Object.entries(res[1])) {
          this.services = value;
        }
        this.portfolios = res[2];
        for (const portfolio of this.portfolios) {
          this.portfoliosMap = new Map<string, Object[]>();
          this.portfoliosMap.set('all', []);
          this.resourceService.getServicesSnippetByUserContentAndPortfolioType('users-content_%26_service_providers', portfolio['id']).subscribe(
            next => {
              this.portfoliosMap.set('all', this.portfoliosMap.get('all').concat(next.results));
              this.portfoliosMap.set(portfolio.id, next.results);
            },
            error => { console.log(error); }
          );

        }
      },
      error => { console.log(error); },
      () => {
        this.ready = true;
      }
    );
  }

}
