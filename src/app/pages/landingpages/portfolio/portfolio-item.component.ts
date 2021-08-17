import {Component, OnInit} from '@angular/core';
import {ResourceService} from '../../../../lib/services/resource.service';


@Component({
  selector: 'app-portfolio-item',
  templateUrl: './portfolio-item.component.html',
})
export class PortfolioItemComponent implements OnInit{

  response: Map<string, Object[]>;
  services: Map<string, Object[]>;

  constructor(protected resourceService: ResourceService) {
  }

  ngOnInit() {
    this.resourceService.getServicesByVocabularyTypeAndId('Portfolios', 'Publish')
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
