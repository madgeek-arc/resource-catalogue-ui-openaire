import {ChangeDetectionStrategy, Component, DestroyRef, effect, ElementRef, inject, OnInit, signal, untracked, viewChild} from '@angular/core';
import {DatePipe} from '@angular/common';
import {CookieConsentService} from './cookie-consent.service';
import {COOKIE_CATALOG, COOKIES_POLICY_URL} from './cookie-consent.model';

/** The cookie banner, shown until the visitor chooses, and the cookie settings panel, opened from it or the footer. */
@Component({
  selector: 'app-cookie-consent',
  imports: [DatePipe],
  templateUrl: './cookie-consent.component.html',
  styleUrl: './cookie-consent.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CookieConsentComponent implements OnInit {
  readonly service = inject(CookieConsentService);
  readonly policyUrl = COOKIES_POLICY_URL;

  readonly categories = [
    {
      title: 'Strictly necessary cookies',
      text: 'These cookies are required for the website to work, for example to keep you signed in. They cannot be '
        + 'switched off. Some details of your signed-in session are also kept in your browser\'s session storage, '
        + 'which is cleared when you close the tab.',
      cookies: COOKIE_CATALOG.necessary,
      analytics: false
    },
    {
      title: 'Analytical cookies',
      text: 'These cookies help us understand how the website is used, such as which pages are visited and which '
        + 'links are clicked, so that we can improve it. They are set only if you allow them.',
      cookies: COOKIE_CATALOG.analytics,
      analytics: true
    }
  ];

  /** The analytics checkbox while the panel is open; applied only on save. */
  readonly analyticsDraft = signal(false);

  private readonly panel = viewChild.required<ElementRef<HTMLElement>>('panel');
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    effect(() => {
      const open = this.service.settingsOpen();
      const element = this.panel().nativeElement;
      if (typeof UIkit === 'undefined') {
        return;
      }
      if (open) {
        this.analyticsDraft.set(untracked(() => this.service.consent()?.analytics) ?? false);
        UIkit.offcanvas(element).show();
      } else if (element.classList.contains('uk-open')) {
        UIkit.offcanvas(element).hide();
      }
    });
  }

  ngOnInit(): void {
    // Keeps the service in step when UIkit closes the panel itself (Esc, the close button, a click on the overlay).
    const element = this.panel().nativeElement;
    const onHidden = (event: Event) => {
      // hidden also bubbles up from UIkit components inside the panel.
      if (event.target === element) {
        this.service.settingsOpen.set(false);
      }
    };
    element.addEventListener('hidden', onHidden);
    this.destroyRef.onDestroy(() => element.removeEventListener('hidden', onHidden));
  }
}
