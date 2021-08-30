import {Component, Input, OnInit} from '@angular/core';
import {FormGroup} from '@angular/forms';

@Component({
  selector: 'app-service-landing-page',
  templateUrl: 'pricing.component.html',
  styleUrls: ['../../landing-page.component.css']
})
export class PricingComponent implements OnInit {

  @Input() form: FormGroup;

  ngOnInit() {
  }

}
