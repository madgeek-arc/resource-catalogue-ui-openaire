import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {ActivatedRoute, RouterLink} from '@angular/router';

@Component({
  selector: 'app-join',
  templateUrl: 'provider-join.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink]
})
export class ProviderJoinComponent {
  private route = inject(ActivatedRoute);

  constructor() {
    // Keeps the invitation token for the provider form; nothing on this page shows it.
    this.route.params.pipe(takeUntilDestroyed()).subscribe(params => {
      sessionStorage.setItem('token', params['token']);
    });
  }
}
