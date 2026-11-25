/**
 * angular2-cookie-law
 *
 * Copyright 2016-2017, @andreasonny83, All rights reserved.
 *
 * @author: @andreasonny83 <andreasonny83@gmail.com>
 */

import {CookieLawService} from './cookie-law.service';
import {ChangeDetectionStrategy, Component, computed, inject, input, output, signal} from '@angular/core';
import {animate, AnimationEvent, state, style, transition, trigger} from '@angular/animations';


export type CookieLawPosition = 'top' | 'bottom';
export type CookieLawAnimation = 'topIn' | 'bottomIn' | 'topOut' | 'bottomOut';
export type CookieLawTarget = '_blank' | '_self';

@Component({
    selector: 'cookie-law',
    animations: [
        trigger('state', [
            state('bottomOut', style({ transform: 'translateY(100%)' })),
            state('topOut', style({ transform: 'translateY(-100%)' })),
            state('*', style({ transform: 'translateY(0)' })),
            transition('void => topIn', [
                style({ transform: 'translateY(-100%)' }),
                animate('1000ms ease-in-out'),
            ]),
            transition('void => bottomIn', [
                style({ transform: 'translateY(100%)' }),
                animate('1000ms ease-in-out'),
            ]),
            transition('* => *', animate('1000ms ease-out')),
        ])
    ],
    styleUrls: ['./cookie-law.less'],
    templateUrl: './cookie-law.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {'[attr.seen]': 'seen() || null'}
})
export class CookieLawComponent {
  private _service = inject(CookieLawService);

  /** Read once: a dismissed banner slides out and stays in the DOM until the next page load. */
  readonly cookieLawSeen = this._service.seen();

  readonly learnMore = input(null, {
    transform: (value: string | null) => (value !== null && `${value}` !== 'false') ? value : null
  });

  readonly target = input('_blank', {
    transform: (value: CookieLawTarget | null): CookieLawTarget =>
      (value === '_blank' || value === '_self') ? value : '_blank'
  });

  readonly position = input('bottom', {
    transform: (value: CookieLawPosition | null): CookieLawPosition =>
      (value === 'top' || value === 'bottom') ? value : 'bottom'
  });

  readonly isSeen = output<boolean>();

  /** Bound to the host's `seen` attribute. */
  readonly seen = signal(this.cookieLawSeen);

  private readonly dismissed = signal(false);

  readonly animation = computed<CookieLawAnimation>(() => {
    const top = this.position() === 'top';
    if (this.dismissed()) {
      return top ? 'topOut' : 'bottomOut';
    }
    return top ? 'topIn' : 'bottomIn';
  });

  readonly top = computed(() => this.position() === 'top' ? '0' : null);
  readonly bottom = computed(() => this.position() === 'top' ? 'initial' : null);

  afterDismissAnimation(evt: AnimationEvent) {
    if (evt.toState === 'topOut' || evt.toState === 'bottomOut') {
      this.seen.set(true);
      this.isSeen.emit(true);
    }
  }

  dismiss(evt?: MouseEvent): void {
    evt?.preventDefault();
    this._service.storeCookie();
    this.dismissed.set(true);
  }
}
