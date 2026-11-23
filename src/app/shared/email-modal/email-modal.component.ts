import { Component, ChangeDetectionStrategy, DestroyRef, inject, input, signal } from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import { UntypedFormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import {EmailService} from '../../services/email.service';

declare let UIkit: any;

@Component({
    selector: 'app-email-modal',
    templateUrl: './email-modal.component.html',
    providers: [EmailService],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ReactiveFormsModule]
})
export class EmailModalComponent {
  private readonly fb = inject(UntypedFormBuilder);
  private readonly emailService = inject(EmailService);
  private readonly destroyRef = inject(DestroyRef);

  readonly serviceIdsArray = input.required<string[]>();
  // A signal, because a failed send sets it when the response arrives, after the click's check.
  readonly emailErrorMessage = signal('');

  emailForm = this.fb.group({
    recipientEmail: '',
    senderEmail: ['', Validators.compose([Validators.required, Validators.email])],
    senderName: ['', Validators.required],
    subject: ['', Validators.required],
    message: ['', Validators.required],
  });

  resetForm() {
    this.emailForm.controls.subject.reset('');
    this.emailForm.controls.message.reset('');
    this.emailErrorMessage.set('');
  }

  sendMail() {
    this.emailErrorMessage.set('');
    if (this.emailForm.valid) {
      this.emailService.sendMail(this.serviceIdsArray(), this.emailForm.value)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => UIkit.modal('#email-modal').hide(),
          error: err => this.emailErrorMessage.set('Something went bad, server responded: ' + err.error)
        });
    } else {
      this.emailErrorMessage.set('Please fill the red outlined fields');
      for (const i in this.emailForm.controls) {
        this.emailForm.controls[i].markAsDirty();
      }
      this.emailForm.updateValueAndValidity();
    }
  }
}
