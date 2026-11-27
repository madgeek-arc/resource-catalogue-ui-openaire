import {Component, ChangeDetectionStrategy} from '@angular/core';
import {NgOptimizedImage} from '@angular/common';

@Component({
    selector: 'app-footer-aire',
    imports: [NgOptimizedImage],
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AireFooterComponent {
}
