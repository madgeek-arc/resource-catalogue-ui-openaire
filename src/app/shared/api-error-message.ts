import {HttpErrorResponse} from '@angular/common/http';

/**
 * The fields of an error body the message is read from. The API answers with problem details
 * ({title, status, detail, instance, method, timestamp}), whose detail gives the reason; {message, transactionId}
 * is the older shape, still read in case an endpoint sends it.
 */
interface ErrorBody {
  detail?: unknown;
  message?: unknown;
  transactionId?: unknown;
}

/**
 * What a failed request tells the user: the server's reason, and its error code when it sent one. `failure` names
 * what failed, such as 'Saving failed', for when the server gives no reason.
 */
export function apiErrorMessage(error: HttpErrorResponse, failure: string): string {
  if (error.status === 0) {
    return 'The server could not be reached. Please check your connection and try again.';
  }
  // A proxy or gateway may answer with text, or nothing. statusText is left out: without a reason phrase (HTTP/2)
  // Angular sets it to 'OK', even on an error.
  const body: unknown = error.error;
  const fields: ErrorBody = body && typeof body === 'object' ? body : {};
  const message = text(fields.detail) ?? text(fields.message) ?? text(body)
    ?? `${failure}: the server answered with error ${error.status}.`;
  const code = text(fields.transactionId);
  return code
    ? `${message}\nFor more information please provide the error code to the system administrators.\nError Code: ${code}`
    : message;
}

/** What a failed save tells the user. */
export function saveErrorMessage(error: HttpErrorResponse): string {
  return apiErrorMessage(error, 'Saving failed');
}

function text(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}
