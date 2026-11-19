import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {EMPTY, forkJoin, Observable, of, zip} from 'rxjs';
import {catchError, map, startWith, switchMap} from 'rxjs/operators';
import {ResourceService} from '../../../services/resource.service';
import {Service} from '../../../entities/eic-model';

@Component({
  selector: 'app-user-item',
  templateUrl: './user-item.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink]
})
export class UserItemComponent {
  private resourceService = inject(ResourceService);
  private userVocId = inject(ActivatedRoute).snapshot.paramMap.get('id');

  /**
   * The user type and the portfolios; null while loading, and after a failed load, as before.
   * portfoliosMap holds the services for 'all' and for each portfolio. It is null until every list has answered,
   * and a list that failed is missing from it, which hides the "Which service is right for you?" section, as before.
   */
  readonly data = toSignal(zip(
    this.resourceService.getVocabularyById(this.userVocId),
    this.resourceService.getNewVocabulariesByType('Portfolios')
  ).pipe(
    switchMap(([userVoc, portfolios]) => forkJoin([
      this.services('all'),
      ...portfolios.map(portfolio => this.services(portfolio.id))
    ]).pipe(
      map(lists => new Map(lists.filter(list => list !== null))),
      startWith(null),
      map(portfoliosMap => ({userVoc, portfolios, portfoliosMap}))
    )),
    catchError(error => {
      console.log(error);
      return EMPTY;
    })
  ), {initialValue: null});

  /** The services for this user type, in one portfolio or in all of them. */
  private services(portfolio: string): Observable<[string, Service[]] | null> {
    const userType = this.userVocId.replace('&', '%26');
    return this.resourceService.getServicesSnippetByUserContentAndPortfolioType(userType, portfolio === 'all' ? undefined : portfolio).pipe(
      map(paging => [portfolio, paging.results] as [string, Service[]]),
      catchError(error => {
        console.log(error);
        return of(null);
      })
    );
  }
}
