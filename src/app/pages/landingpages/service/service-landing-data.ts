import {UiVocabulary} from '../../../entities/dynamic-form-model';
import {Service} from '../../../entities/eic-model';

/** What ServiceLandingPageComponent passes to its tabs through [routerOutletData]; null until it has loaded. */
export interface ServiceLandingData {
  service: Service;
  vocabularies: Map<string, UiVocabulary[]>;
  relatedServices: Service[];
}
