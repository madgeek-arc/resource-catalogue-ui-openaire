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
  /** ProviderDashboardComponent passes the provider through its router outlet, which it only shows once the provider has loaded. */
  private bundle = inject(ROUTER_OUTLET_DATA) as Signal<ProviderBundle>;
  readonly currentProvider = computed(() => this.bundle().provider);

  readonly vocabularyMap = toSignal(inject(ResourceService).getUiVocabularies().pipe(
    catchError(() => EMPTY)
  ), {initialValue: null});

  getVocabularyName(vocabularyType: string, id: string): string | undefined {
    return this.vocabularyMap()?.[vocabularyType].find(vocabulary => vocabulary.id === id)?.name;
  }
}
