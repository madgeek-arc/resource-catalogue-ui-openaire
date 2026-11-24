import { Facet } from './facet';

export interface Paging<T> {

    from: number;
    to: number;
    total: number;

    results: T[];
    facets: Facet[];
}

export interface SpringPaging<T> { // Spring paging with facets
  page: Page<T>;
  facets: Facet[];
}

export interface Page<T> {
  content: T[];
  pageable: Pageable;
  last: boolean;
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  sort: Sort;
  first: number;
  numberOfElements: number;
  empty: boolean;
}

export interface Sort {
  empty: boolean;
  sorted: boolean;
  unsorted: boolean;
}

export interface Pageable {
  sort: Sort;
  offset: number;
  pageNumber: number;
  pageSize: number;
  paged: number;
  unpaged: boolean;
}
