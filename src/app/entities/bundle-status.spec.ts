import {describe, expect, it} from 'vitest';
import {Vocabulary} from './eic-model';
import {plainStatuses} from './bundle-status';

describe('plainStatuses', () => {
  it('gives the state vocabulary the plain statuses as ids and keeps its names', () => {
    const entry = (id: string, name: string) => ({id, name, description: name, parentId: null, type: 'Provider state', extras: {}}) as unknown as Vocabulary;
    const statuses = plainStatuses([
      entry('approved provider', 'Approved Provider'),
      entry('pending provider', 'Pending Provider'),
      entry('rejected provider', 'Rejected Provider')
    ]);
    expect(statuses.map(({id, name}) => ({id, name}))).toEqual([
      {id: 'approved', name: 'Approved Provider'},
      {id: 'pending', name: 'Pending Provider'},
      {id: 'rejected', name: 'Rejected Provider'}
    ]);
  });
});
