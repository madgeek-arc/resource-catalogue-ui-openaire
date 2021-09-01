import {Component, Input, OnInit} from '@angular/core';
import {FormGroup} from '@angular/forms';

@Component({
  selector: 'app-service-landing-page-resources-and-support',
  templateUrl: 'resourcesAndSupport.component.html',
  styleUrls: ['../../landing-page.component.css']
})
export class ResourcesAndSupportComponent implements OnInit {

  @Input() form: FormGroup;

  ngOnInit() {
  }

}
