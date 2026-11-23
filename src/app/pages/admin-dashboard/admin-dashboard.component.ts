import {ChangeDetectionStrategy, Component, computed, inject, signal} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {NavigationEnd, Router, RouterLink, RouterOutlet} from '@angular/router';
import {FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {EMPTY} from 'rxjs';
import {catchError, filter, map} from 'rxjs/operators';
import {UserService} from '../../services/user.service';

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
  }

  copyToClipboard() {
    const url = this.invitationUrl();
    // The copy button only shows once there is a link.
    if (!url) {
      return;
    }
    // The clipboard API needs a secure context (https).
    if (!navigator.clipboard) {
      this.fallbackCopyTextToClipboard(url);
      return;
    }
    navigator.clipboard.writeText(url).catch(error => console.error('Async: Could not copy text: ', error));
  }

  /** execCommand('copy') is deprecated, so this may not work everywhere. */
  private fallbackCopyTextToClipboard(text: string) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    // Avoid scrolling to the bottom.
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.position = 'fixed';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      if (document.execCommand('copy')) {
        console.log('copied');
      }
    } catch (error) {
      console.error('Fallback: Oops, unable to copy', error);
    }
    document.body.removeChild(textArea);
  }
}
