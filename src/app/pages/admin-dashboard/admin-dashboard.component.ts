import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { EMPTY } from 'rxjs';
import { catchError, filter, map } from 'rxjs/operators';
import { UserService } from '../../services/user.service';

const sections = [
  {path: 'services', icon: 'grid_view', title: 'Services'},
  {path: 'datasources', icon: 'grid_view', title: 'Datasource Subprofiles'},
  {path: 'providers', icon: 'real_estate_agent', title: 'Providers'}
];

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: 'admin-dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterOutlet, ReactiveFormsModule]
})
export class AdminDashboardComponent {
  private router = inject(Router);
  private userService = inject(UserService);

  /** Set on each navigation; any URL that names neither services nor datasources shows the providers. */
  readonly section = toSignal(this.router.events.pipe(
    filter(event => event instanceof NavigationEnd),
    map(event => sections.find(section => section.path === 'providers' || event.url.includes(section.path)))
  ), {initialValue: null});

  private readonly userInfo = toSignal(this.userService.getUserInfo().pipe(
    catchError(error => {
      console.error(error);
      return EMPTY;
    })
  ), {initialValue: null});

  readonly canInvite = computed(() => {
    const roles: string[] = this.userInfo()?.roles ?? [];
    return roles.includes('ADMIN') || roles.includes('ONBOARDING_TEAM');
  });

  readonly inviteeEmail = new FormControl<string | null>(null, [Validators.email, Validators.required]);
  readonly invitationUrl = signal<string | null>(null);
  /** The last copy's result while it shows. */
  readonly copyStatus = signal<{copied: boolean; message: string} | null>(null);
  private copyStatusTimer?: ReturnType<typeof setTimeout>;
  private lastCopyMessage = '';

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.copyStatusTimer));
  }

  toggleSidebar() {
    // Both are in this component's template, which is shown whenever the toggle can be clicked.
    const toggle = document.getElementById('sidebar_toggle')!;
    const content = document.getElementById('sidebar_main_content')!;
    const closing = !toggle.classList.contains('closed');
    toggle.classList.toggle('closed', closing);
    content.classList.toggle('sidebar_main_active', !closing);
    content.classList.toggle('sidebar_main_inactive', closing);
  }

  getInvitationToken() {
    const email = this.inviteeEmail.value;
    // The button is disabled while the email is invalid, and a required email is never null.
    if (!email) {
      return;
    }
    this.userService.getInvitationToken(email).subscribe({
      next: token => this.invitationUrl.set(location.origin + '/join/' + token),
      error: error => console.error(error)
    });
  }

  clearData() {
    this.inviteeEmail.reset(null);
    this.invitationUrl.set(null);
    clearTimeout(this.copyStatusTimer);
    this.copyStatus.set(null);
  }

  async copyToClipboard() {
    const url = this.invitationUrl();
    // The copy button only shows once there is a link.
    if (!url) {
      return;
    }
    let copied: boolean;
    try {
      // Without a secure context (https or localhost) navigator.clipboard is missing and this throws at once,
      // still inside the click, as legacyCopy needs; the write also rejects when the browser denies it.
      await navigator.clipboard.writeText(url);
      copied = true;
    } catch {
      copied = legacyCopy(url);
    }
    this.reportCopy(copied);
  }

  /** Shows the result beside the button, in the status region screen readers announce, and clears it after a while. */
  private reportCopy(copied: boolean) {
    clearTimeout(this.copyStatusTimer);
    let message = copied ? 'Copied' : 'Copy failed';
    // VoiceOver skips a message equal to its last one, even when the region was cleared in between.
    if (message === this.lastCopyMessage) {
      message += '\u00A0';
    }
    this.lastCopyMessage = message;
    this.copyStatus.set({copied, message});
    this.copyStatusTimer = setTimeout(() => this.copyStatus.set(null), 2000);
  }
}

/** The deprecated execCommand('copy'), for when the clipboard API is missing or refuses; false when it did not copy. */
function legacyCopy(text: string): boolean {
  const previousFocus = document.activeElement as HTMLElement | null;
  const field = Object.assign(document.createElement('textarea'), {value: text});
  field.setAttribute('readonly', '');
  // UIkit override attempted: uk-hidden and uk-invisible take the field out of selection, so execCommand would copy
  // nothing; opacity hides it and keeps it selectable, and fixed at the top it does not scroll the page.
  field.style.cssText = 'position:fixed;inset-block-start:0;opacity:0';
  document.body.append(field);
  field.select();
  try {
    return document.execCommand('copy');
  } catch {
    return false;
  } finally {
    field.remove();
    // Selecting the field can move the focus; give it back to the button.
    previousFocus?.focus({preventScroll: true});
  }
}
