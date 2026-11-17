import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {ReadMoreComponent, ReadMoreTextComponent} from './read-more.component';

@NgModule({
    imports: [CommonModule, ReadMoreComponent,
        ReadMoreTextComponent],
    exports: [
        ReadMoreComponent,
        ReadMoreTextComponent,
    ],
    providers: []
})
export class ReusableComponentsModule {
}
