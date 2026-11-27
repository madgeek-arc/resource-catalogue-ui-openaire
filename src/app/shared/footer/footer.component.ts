import {Component, ChangeDetectionStrategy, inject} from '@angular/core';
import {NgOptimizedImage} from '@angular/common';
import {CookieConsentService} from '../cookies/cookie-consent.service';
import {COOKIES_POLICY_URL} from '../cookies/cookie-consent.model';

@Component({
    selector: 'app-footer-aire',
    imports: [NgOptimizedImage],
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AireFooterComponent {
  private readonly cookieConsent = inject(CookieConsentService);
  readonly cookiesPolicyUrl = COOKIES_POLICY_URL;

  openCookieSettings(event: Event): void {
    event.preventDefault();
    this.cookieConsent.open();
  }
}
