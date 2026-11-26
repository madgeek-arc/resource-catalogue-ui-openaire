/** Whether a form value holds nothing: null, undefined, blank text, or a list or group with nothing in it. */
function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) {
    return true;
  }
  if (typeof value === 'string') {
    return value.trim() === '';
  }
  if (Array.isArray(value)) {
    return value.every(isEmpty);
  }
  if (typeof value === 'object') {
    return Object.values(value).every(isEmpty);
  }
  // false and 0 are answers.
  return false;
}

/**
 * The value of a dynamic form without the rows the user left empty. The form starts every list with one row, and a
 * list's rows may have required fields, so an untouched row would be saved, or rejected, as an incomplete one.
 * Empty rows are dropped from every list, at any depth, and a list left with no rows is dropped too, as a record that
 * never had one does not store it.
 */
export function withoutEmptyRows<T extends Record<string, unknown>>(value: T): T {
  const result: Record<string, unknown> = {};
  for (const [key, field] of Object.entries(value)) {
    if (Array.isArray(field)) {
      const rows = field.filter(row => !isEmpty(row)).map(row => isPlainObject(row) ? withoutEmptyRows(row) : row);
      if (rows.length > 0) {
        result[key] = rows;
      }
    } else if (isPlainObject(field)) {
      result[key] = withoutEmptyRows(field);
    } else {
      result[key] = field;
    }
  }
  return result as T;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
