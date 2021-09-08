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
  userVocId: string;
  ready = false;

  constructor(protected resourceService: ResourceService, protected route: ActivatedRoute) {
  }

  ngOnInit() {
    this.userVocId = this.route.snapshot.paramMap.get('id');
    zip(
      this.resourceService.getVocabularyById(this.userVocId),
      this.resourceService.getServicesByVocabularyTypeAndId('Portfolios', this.userVocId)
    ).subscribe(
      res => {
        this.userVoc = res[0];
        this.response = res[1];
        for (const [key, value] of Object.entries(res[1])) {
          console.log(`${key}: ${value}`);
          this.services = value;
        }
      },
      error => {console.log(error)},
      () => {
        console.log(this.services);
        this.ready = true
      }
    );
  }

}
