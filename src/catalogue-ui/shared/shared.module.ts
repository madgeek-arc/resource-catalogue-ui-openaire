import {NgModule} from '@angular/core';
import {PremiumSortFacetsPipe, PremiumSortFacetValuesPipe, PremiumSortPipe} from './pipes/premium-sort.pipe';
import {SafeUrlPipe} from './pipes/safeUrlPipe';

@NgModule({
    imports: [PremiumSortPipe,
        PremiumSortFacetsPipe,
        PremiumSortFacetValuesPipe,
        SafeUrlPipe],
    exports: [
        PremiumSortPipe,
        PremiumSortFacetsPipe,
        PremiumSortFacetValuesPipe,
        SafeUrlPipe
    ]
})

export class SharedModule { }
