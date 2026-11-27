import {ChangeDetectionStrategy, Component} from '@angular/core';

@Component({
  selector: 'join-about',
  templateUrl: './join.component.html',
  styleUrl: './join.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class JoinComponent {}
