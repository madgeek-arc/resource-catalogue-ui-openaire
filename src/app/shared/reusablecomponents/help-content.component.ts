import { Component, OnInit, ChangeDetectionStrategy, DestroyRef, inject, input, signal } from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {Router} from '@angular/router';
import {Content, PositionContents} from '../../entities/page-content';
import {HelpContentService} from '../../services/help-content.service';
import {environment} from '../../../environments/environment';

@Component({
    selector: 'app-help-content',
    template: `
    @for (content of contents(); track content) {
      <div [innerHTML]="content.content" class="uk-margin-medium-bottom"></div>
    }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HelpContentComponent implements OnInit {
  private readonly helpContentService = inject(HelpContentService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly position = input.required<keyof PositionContents>();

  readonly contents = signal<Content[]>([]);

  ngOnInit() {
    if (environment.showHelpContent) {
      this.helpContentService.getActivePageContent(this.router.url)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(pageContent => this.contents.set(pageContent.content[this.position()] ?? []));
    }
  }

  /** Read by the search pages through a template reference to choose their layout classes. */
  isPresent() {
    return this.contents().length > 0;
  }
}

@Component({
    selector: 'app-aside-help-content',
    template: `
    @for (content of contents(); track content) {
      <div [innerHTML]="content.content"
      class="uk-card uk-card-body uk-card-default sidemenu uk-margin-bottom"></div>
    }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AsideHelpContentComponent extends HelpContentComponent {
}
