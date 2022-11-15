import {Component, OnInit} from '@angular/core';
import {ResourceService} from '../../../services/resource.service';
import {ActivatedRoute} from '@angular/router';
import {Vocabulary} from '../../../entities/eic-model';
import {zip} from 'rxjs/internal/observable/zip';


@Component({
  selector: 'app-portfolio-item',
  templateUrl: './portfolio-item.component.html',
})
export class PortfolioItemComponent implements OnInit{

  response: Map<string, Object[]>;
  services: Map<string, Object[]>;
  portfolioVoc: Vocabulary;
  portfolioId: string;
  ready = false;

  constructor(protected resourceService: ResourceService, protected route: ActivatedRoute) {
  }

  ngOnInit() {
    this.portfolioId = this.route.snapshot.paramMap.get('id');
    zip(
      this.resourceService.getVocabularyById(this.portfolioId),
      this.resourceService.getServicesByVocabularyTypeAndId('portfolios', this.portfolioId)
    ).subscribe(
      res => {
        this.portfolioVoc = res[0];
        this.response = res[1];
        for (const [key, value] of Object.entries(res[1])) {
          // console.log(`${key}: ${value}`);
          this.services = value;
        }
      },
      error => {console.log(error)},
      () => {
        // console.log(this.services);
        this.ready = true
      }
    );
  }

}
