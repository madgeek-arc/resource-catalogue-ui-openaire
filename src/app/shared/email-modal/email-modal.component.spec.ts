import {ChangeDetectionStrategy, Component} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {provideRouter} from '@angular/router';
import {Subject} from 'rxjs';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {EmailMessage} from '../../entities/eic-model';
import {EmailService} from '../../services/email.service';
import {EmailModalComponent} from './email-modal.component';

// The host is Eager like the search page, so a host check refreshes the modal only when it marked
// itself for check (OnPush) or read a changed signal.
@Component({
  imports: [EmailModalComponent],
  template: '<app-email-modal [serviceIdsArray]="ids" />',
  changeDetection: ChangeDetectionStrategy.Eager
})
class HostComponent {
  ids = ['openaire.argos', 'cern.zenodo'];
}

describe('EmailModalComponent', () => {
  let response: Subject<EmailMessage>;
  let sendMail: ReturnType<typeof vi.fn<(serviceIds: string[], message: unknown) => Subject<EmailMessage>>>;
  let hide: ReturnType<typeof vi.fn>;
  let modal: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    response = new Subject<EmailMessage>();
    sendMail = vi.fn((_serviceIds: string[], _message: unknown) => response);
    hide = vi.fn();
    modal = vi.fn(() => ({hide}));
    vi.stubGlobal('UIkit', {modal});
    TestBed.configureTestingModule({providers: [provideRouter([])]});
    // EmailService is provided by the component itself, so the mock replaces it there. The overridden
    // provider outlives a test, so it forwards to the current test's spy instead of holding one.
    TestBed.overrideComponent(EmailModalComponent, {set: {providers: [
      {provide: EmailService, useValue: {sendMail: (serviceIds: string[], message: unknown) => sendMail(serviceIds, message)}}
    ]}});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const setUp = () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement;
    const type = (id: string, value: string) => {
      const field = root.querySelector<HTMLInputElement | HTMLTextAreaElement>(`#${id}`)!;
      field.value = value;
      field.dispatchEvent(new Event('input'));
    };
    const button = (text: string) => [...root.querySelectorAll('button')].find(b => b.textContent!.trim() === text)!;
    const header = () => root.querySelector('.uk-modal-header')?.textContent!.trim() ?? null;
    const fillIn = () => {
      type('email', 'someone@example.org');
      type('name', 'Someone');
      type('subject', 'A question');
      type('textarea', 'Some text');
    };
    return {fixture, root, type, button, header, fillIn};
  };

  it('marks the empty fields and does not send an incomplete form', () => {
    const {fixture, root, button, header} = setUp();
    expect(header()).toBeNull();
    expect(root.querySelectorAll('.uk-form-danger').length).toBe(0);

    button('Send').click();
    fixture.detectChanges();

    expect(header()).toBe('Please fill the red outlined fields');
    expect([...root.querySelectorAll('.uk-form-danger')].map(e => e.id)).toEqual(['email', 'name', 'subject', 'textarea']);
    expect(sendMail).not.toHaveBeenCalled();
  });

  it('marks only an invalid email once the other fields are filled in', () => {
    const {fixture, root, type, button, fillIn} = setUp();
    fillIn();
    type('email', 'not an email');
    button('Send').click();
    fixture.detectChanges();

    expect([...root.querySelectorAll('.uk-form-danger')].map(e => e.id)).toEqual(['email']);
  });

  it('shows the server message when sending fails', () => {
    const {fixture, button, header, fillIn} = setUp();
    fillIn();
    button('Send').click();
    fixture.detectChanges();
    expect(header()).toBeNull();

    response.error({error: 'mail server down'});
    fixture.detectChanges();

    expect(header()).toBe('Something went bad, server responded: mail server down');
    expect(hide).not.toHaveBeenCalled();
  });

  it('sends the message for the services and closes the modal', () => {
    const {fixture, button, fillIn} = setUp();
    fillIn();
    button('Send').click();
    fixture.detectChanges();

    expect(sendMail).toHaveBeenCalledWith(['openaire.argos', 'cern.zenodo'], {
      recipientEmail: '', senderEmail: 'someone@example.org', senderName: 'Someone',
      subject: 'A question', message: 'Some text'
    });
    response.next({} as EmailMessage);
    expect(modal).toHaveBeenCalledWith('#email-modal');
    expect(hide).toHaveBeenCalled();
  });

  it('clears the subject, the message and the error on Cancel', () => {
    const {fixture, root, button, header, fillIn} = setUp();
    fillIn();
    response.error({error: 'mail server down'});
    button('Send').click();
    fixture.detectChanges();
    expect(header()).not.toBeNull();

    button('Cancel').click();
    fixture.detectChanges();

    expect(header()).toBeNull();
    expect(root.querySelector<HTMLInputElement>('#subject')!.value).toBe('');
    expect(root.querySelector<HTMLTextAreaElement>('#textarea')!.value).toBe('');
    expect(root.querySelector<HTMLInputElement>('#email')!.value).toBe('someone@example.org');
  });
});
