import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {ActivatedRoute} from '@angular/router';
import {JsonPipe} from '@angular/common';
import {EMPTY} from 'rxjs';
import {catchError, filter, map, switchMap} from 'rxjs/operators';
import {DatasourceService} from '../../../services/datasource.service';
import {DatasourceDetails} from '../../../entities/datasource';

@Component({
  selector: 'app-datasource-landing',
  templateUrl: 'datasource.html',
  providers: [DatasourceService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [JsonPipe]
})
export class Datasource {
  private route = inject(ActivatedRoute);
  private datasourceService = inject(DatasourceService);

  /** The datasource of the URL; a search that finds none, or several, keeps the previous one, as before. */
  readonly datasource = toSignal(this.route.params.pipe(
    switchMap(params => this.datasourceService.getDatasourceById(params['datasourceId']).pipe(
      catchError(error => {
        console.log(error);
        return EMPTY;
      })
    )),
    filter(page => page.results.length === 1),
    map(page => page.results[0])
  ), {initialValue: null as DatasourceDetails | null});
}
