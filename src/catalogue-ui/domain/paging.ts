import { Facet } from './facet';

export interface Paging<T> {

    from: number;
    to: number;
    total: number;

    results: T[];
    facets: Facet[];
}
