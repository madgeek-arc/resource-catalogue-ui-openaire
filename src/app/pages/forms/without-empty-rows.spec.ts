import {describe, expect, it} from 'vitest';
import {withoutEmptyRows} from './without-empty-rows';

describe('withoutEmptyRows', () => {
  it('drops the rows left empty, and the lists left with none', () => {
    expect(withoutEmptyRows({
      name: 'OpenAIRE',
      tags: [null, 'graph', '  '],
      multimedia: [{multimediaURL: null, multimediaName: null}],
      scientificDomains: [{scientificDomain: 'sd-1', scientificSubdomain: 'sd-1-1'}, {scientificDomain: '', scientificSubdomain: null}]
    })).toEqual({
      name: 'OpenAIRE',
      tags: ['graph'],
      scientificDomains: [{scientificDomain: 'sd-1', scientificSubdomain: 'sd-1-1'}]
    });
  });

  it('keeps a half-filled row, for the server to reject, and empty fields outside lists', () => {
    expect(withoutEmptyRows({region: null, location: {city: 'Athens', region: null}, multimedia: [{multimediaURL: null, multimediaName: 'Video'}]}))
      .toEqual({region: null, location: {city: 'Athens', region: null}, multimedia: [{multimediaURL: null, multimediaName: 'Video'}]});
  });

  it('counts false and 0 as answers', () => {
    expect(withoutEmptyRows({rows: [{primary: false}, {count: 0}]})).toEqual({rows: [{primary: false}, {count: 0}]});
  });

  it('cleans the lists inside the rows it keeps', () => {
    expect(withoutEmptyRows({users: [{email: 'a@example.org', roles: [null]}]})).toEqual({users: [{email: 'a@example.org'}]});
  });
});
