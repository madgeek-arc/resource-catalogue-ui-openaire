import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
    selector: 'app-join',
    templateUrl: 'provider-join.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RouterLink]
})

export class ProviderJoinComponent implements OnInit {
  private route = inject(ActivatedRoute);


  token: string;

  ngOnInit() {
    this.route.params.subscribe(
      params=> {
        this.token = params['token'];
        sessionStorage.setItem('token', this.token);
        console.log(sessionStorage.getItem('token'));
      }
    );
  }
}
