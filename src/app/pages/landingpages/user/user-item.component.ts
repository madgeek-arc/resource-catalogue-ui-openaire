import {Component, OnInit} from '@angular/core';
import {ResourceService} from '../../../../lib/services/resource.service';
import {Vocabulary} from '../../../../lib/domain/eic-model';
import {ActivatedRoute} from '@angular/router';


@Component({
  selector: 'app-user-item',
  templateUrl: './user-item.component.html',
})
export class UserItemComponent implements OnInit {

  response: Map<string, Object[]>;
  services: Map<string, Object[]>;
  userVoc: Vocabulary;
  userVocId: string;

  constructor(protected resourceService: ResourceService, protected route: ActivatedRoute) {
  }

  ngOnInit() {
    this.userVocId = this.route.snapshot.paramMap.get('id');
    this.resourceService.getVocabularyById(this.userVocId).subscribe(
      res => {
        this.userVoc = res;
      },
      error => {
        console.log(error);
      },
      () => {
        console.log(this.userVoc);
      }
    );
    this.resourceService.getServicesByVocabularyTypeAndId('Users', this.userVocId)
      .subscribe(res => {
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
