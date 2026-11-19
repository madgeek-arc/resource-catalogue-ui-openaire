import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {EMPTY, zip} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {ResourceService} from '../../../services/resource.service';

@Component({
  selector: 'app-portfolio-item',
  templateUrl: './portfolio-item.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink]
})
export class PortfolioItemComponent {
  private resourceService = inject(ResourceService);
  private portfolioId = inject(ActivatedRoute).snapshot.paramMap.get('id');

  /** The portfolio and its services; null while loading, and after a failed load, as before. */
  readonly data = toSignal(zip(
    this.resourceService.getVocabularyById(this.portfolioId),
    this.resourceService.getServicesByVocabularyTypeAndId('portfolios', this.portfolioId)
  ).pipe(
    map(([portfolioVoc, response]) => ({portfolioVoc, response})),
    catchError(error => {
      console.log(error);
      return EMPTY;
    })
  ), {initialValue: null});
}
