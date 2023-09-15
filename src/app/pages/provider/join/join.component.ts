import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-join',
  templateUrl: 'join.component.html'
})

export class JoinComponent implements OnInit {

  token: string;

  constructor(private route: ActivatedRoute) {}

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
