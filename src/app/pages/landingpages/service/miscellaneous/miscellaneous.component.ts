import {Component, Input, OnInit} from '@angular/core';
import {FormGroup} from '@angular/forms';

@Component({
  selector: 'app-service-landing-page-misc',
  templateUrl: 'miscellaneous.component.html',
  styleUrls: ['../../landing-page.component.css']
})
export class MiscellaneousComponent implements OnInit {

  @Input() form: FormGroup;

  ngOnInit() {
  }

}
