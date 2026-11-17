import {Component, OnInit, ChangeDetectionStrategy} from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-about',
    templateUrl: './about.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RouterLink]
})
export class AboutComponent implements OnInit {

  constructor() {}

  ngOnInit() {}

}
