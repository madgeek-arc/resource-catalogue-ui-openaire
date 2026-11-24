import {Service, Vocabulary} from '../../../entities/eic-model';

/** What ServiceLandingPageComponent passes to its tabs through [routerOutletData]; null until it has loaded. */
export interface ServiceLandingData {
  service: Service;
  vocabularies: Record<string, Vocabulary[]>;
  relatedServices: Service[];
}
