import {ChangeDetectionStrategy, Component, computed, inject, Signal} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {ROUTER_OUTLET_DATA} from '@angular/router';
import {EMPTY} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {ProviderBundle} from '../../../../entities/eic-model';
import {ResourceService} from '../../../../services/resource.service';

@Component({
  selector: 'app-provider-info',
  templateUrl: 'provider-info.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProviderInfoComponent {
  /** ProviderDashboardComponent passes the provider through its router outlet; null until it has loaded. */
  private bundle = inject(ROUTER_OUTLET_DATA) as Signal<ProviderBundle | null>;
  readonly currentProvider = computed(() => this.bundle()?.provider ?? null);

  readonly vocabularyMap = toSignal(inject(ResourceService).getUiVocabularies().pipe(
    catchError(() => EMPTY)
  ), {initialValue: null});

  getVocabularyName(vocabularyType: string, id: string): string {
    return this.vocabularyMap()[vocabularyType].find(vocabulary => vocabulary.id === id)?.name;
  }
}
