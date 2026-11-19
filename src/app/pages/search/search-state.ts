import {Params} from '@angular/router';
import {Facet} from '../../entities/facet';
import {URLParameter} from '../../entities/url-parameter';

/**
 * The search filters, read from and written back to the URL query string. Shared by the service and datasource
 * search pages; the page edits a copy and navigates, and the next query string becomes the next copy.
 */
export class SearchParameters {
  private constructor(private readonly list: URLParameter[]) {}

  static fromQueryParams(params: Params): SearchParameters {
    return new SearchParameters(Object.keys(params).map(key => ({key, values: String(params[key]).split(',')})));
  }

  get all(): readonly URLParameter[] {
    return this.list;
  }

  /** The first value of a parameter, or undefined. */
  value(key: string): string | undefined {
    return this.list.find(parameter => parameter.key === key)?.values[0];
  }

  /** Replaces the values of a parameter, adding it at the end if missing. */
  set(key: string, value: string | number) {
    const parameter = this.list.find(p => p.key === key);
    if (parameter) {
      parameter.values = [String(value)];
    } else {
      this.list.push({key, values: [String(value)]});
    }
  }

  remove(key: string) {
    const index = this.list.findIndex(parameter => parameter.key === key);
    if (index > -1) {
      this.list.splice(index, 1);
    }
  }

  /** Adds a facet value; a new value goes back to the first page. */
  addValue(key: string, value: string) {
    const parameter = this.list.find(p => p.key === key);
    if (!parameter) {
      this.set('from', 0);
      this.list.push({key, values: [value]});
    } else if (!parameter.values.includes(value)) {
      parameter.values.push(value);
      this.set('from', 0);
    }
  }

  /** Removes a facet value, and the parameter once it has none. */
  removeValue(key: string, value: string) {
    const parameter = this.list.find(p => p.key === key);
    const index = parameter?.values.indexOf(value) ?? -1;
    if (index > -1) {
      parameter.values.splice(index, 1);
      if (parameter.values.length === 0) {
        this.remove(key);
      }
    }
  }

  toQueryParams(): Record<string, string> {
    return Object.fromEntries(this.list.map(parameter => [parameter.key, parameter.values.join(',')]));
  }
}

/** Ticks the facet values that the query string selects; facets are mutated, as the API objects are fresh. */
export function checkSelectedFacets(facets: Facet[], parameters: SearchParameters) {
  for (const parameter of parameters.all) {
    const facet = facets.find(f => f.field === parameter.key);
    for (const facetValue of facet?.values ?? []) {
      if (parameter.values.includes(facetValue.value)) {
        facetValue.isChecked = true;
      }
    }
  }
}

export interface Paging {
  /** The page numbers to offer, up to `2 * offset + 1` around the current one. */
  pages: number[];
  totalPages: number;
  /** 1-based; 0 before the first results. */
  currentPage: number;
}

export function paging(total: number, from: number, pageSize: number, offset = 2): Paging {
  const totalPages = Math.ceil(total / pageSize);
  const currentPage = Math.ceil(from / pageSize) + 1;
  const pages: number[] = [];
  let addToEnd = 0;
  let addToStart = 0;
  for (let i = currentPage - offset; i < currentPage + 1 + offset; ++i) {
    if (i < 1) {
      addToEnd++;
    }
    if (i > totalPages) {
      addToStart++;
    }
    if (i >= 1 && i <= totalPages) {
      pages.push(i);
    }
  }
  for (let i = 0; i < addToEnd; ++i) {
    if (pages.length < totalPages) {
      pages.push(pages.length + 1);
    }
  }
  for (let i = 0; i < addToStart; ++i) {
    if (pages[0] > 1) {
      pages.unshift(pages[0] - 1);
    }
  }
  return {pages, totalPages, currentPage};
}
