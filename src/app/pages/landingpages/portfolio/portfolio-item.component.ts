import {Component, OnInit} from '@angular/core';
import {ResourceService} from '../../../../lib/services/resource.service';
import {ActivatedRoute} from '@angular/router';
import {Vocabulary} from '../../../../lib/domain/eic-model';


@Component({
  selector: 'app-portfolio-item',
  templateUrl: './portfolio-item.component.html',
})
export class PortfolioItemComponent implements OnInit{

  response: Map<string, Object[]>;
  services: Map<string, Object[]>;
  portfolioVoc: Vocabulary;
  portfolioId: string;

  constructor(protected resourceService: ResourceService, protected route: ActivatedRoute) {
  }

  ngOnInit() {
    this.portfolioId = this.route.snapshot.paramMap.get('id');
    this.resourceService.getVocabularyById(this.portfolioId).subscribe(
      res => {
        this.portfolioVoc = res;
      },
      error => {console.log(error)},
      () => {
        console.log(this.portfolioVoc);
      }
    );
    this.resourceService.getServicesByVocabularyTypeAndId('Portfolios', this.portfolioId)
      .subscribe( res => {
          this.response = res;
          console.log(res);
          for (const [key, value] of Object.entries(res)) {
            console.log(`${key}: ${value}`);
            this.services = value;
          }
          // this.services = res;
        },
        error => console.log(error),
        () => {
        console.log(this.response);
        console.log(this.services);
      }
      );
  }
}
