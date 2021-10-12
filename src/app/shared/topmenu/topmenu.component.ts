import {Component, OnInit} from '@angular/core';
import {TopMenuComponent} from '../../../lib/shared/topmenu/topmenu.component';
import {Router} from '@angular/router';

@Component({
  selector: 'app-top-menu-aire',
  templateUrl: './topmenu.component.html',
  styleUrls: ['./topmenu.component.css'],
})

export class AireTopMenuComponent extends TopMenuComponent implements OnInit{

  services: Map<string, Object[]>;

  ngOnInit() {
    this.resourceService.getServicesByVocabularyTypeAndId('Portfolios').subscribe(
      res => {

        this.services = res;
        // console.log(this.services);
        // for (const [key, value] of Object.entries(this.services)) {
        //   console.log(`${key}: `);
        //   for ( const [count, service] of Object.entries(value)) {
        //     console.log(`${count}: ` + service['id'] + ' ' + service['name'] );
        //   }
        // }
      },
      error => {console.log(error)},
      () => {}
    );
  }

  redirectTo(url: string){
    this.router.navigateByUrl('/', {skipLocationChange: true}).then(()=>
      this.router.navigate([url]));
  }
}
