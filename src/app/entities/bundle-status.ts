import {Vocabulary} from './eic-model';

/** The status of a provider, service or datasource bundle, as the API sends and filters it. */
export type BundleStatus = 'pending' | 'approved' | 'rejected';

/**
 * The entries of a state vocabulary (Provider, Resource or Datasource state) with the plain status as their id. The
 * vocabularies still give ids such as 'pending provider', which the API no longer matches; their names stay the labels.
 */
export function plainStatuses(vocabulary: Vocabulary[]): Vocabulary[] {
  return vocabulary.map(entry => ({...entry, id: entry.id.split(' ')[0]}));
}
