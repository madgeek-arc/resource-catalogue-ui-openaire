import {HttpErrorResponse} from '@angular/common/http';
import {describe, expect, it} from 'vitest';
import {apiErrorMessage, saveErrorMessage} from './api-error-message';

const failure = (status: number, error: unknown) => new HttpErrorResponse({status, statusText: 'Bad Request', error});

describe('saveErrorMessage', () => {
  it('shows the detail of the API\'s problem details', () => {
    const problem = {title: 'Bad Request', status: 400, detail: 'Field \'name\' is mandatory', instance: '/api/oa/providers/x', method: 'PUT'};
    expect(saveErrorMessage(failure(400, problem))).toBe('Field \'name\' is mandatory');
  });

  it('shows the older message with its error code', () => {
    expect(saveErrorMessage(failure(400, {message: 'Name taken', transactionId: 't1'})))
      .toBe('Name taken\nFor more information please provide the error code to the system administrators.\nError Code: t1');
  });

  it('shows a text body as it is', () => {
    expect(saveErrorMessage(failure(502, ' Bad gateway '))).toBe('Bad gateway');
  });

  it('names the status when the body gives no reason', () => {
    expect(saveErrorMessage(failure(400, {title: 'Bad Request', status: 400, detail: ''}))).toBe('Saving failed: the server answered with error 400.');
    expect(saveErrorMessage(failure(500, null))).toBe('Saving failed: the server answered with error 500.');
  });

  it('leaves out the status text, which is \'OK\' when the response has no reason phrase', () => {
    expect(saveErrorMessage(new HttpErrorResponse({status: 400, statusText: 'OK', error: null}))).toBe('Saving failed: the server answered with error 400.');
  });

  it('names what failed when the server gives no reason', () => {
    expect(apiErrorMessage(failure(403, ''), 'Activating failed')).toBe('Activating failed: the server answered with error 403.');
    expect(apiErrorMessage(failure(403, {detail: 'Only approved providers can be activated'}), 'Activating failed'))
      .toBe('Only approved providers can be activated');
  });

  it('says when the server could not be reached', () => {
    expect(saveErrorMessage(failure(0, null))).toBe('The server could not be reached. Please check your connection and try again.');
  });
});
