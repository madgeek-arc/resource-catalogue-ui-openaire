/* tslint:disable */
/* eslint-disable */
// Generated using typescript-generator version 2.16.538 on 2020-06-10 11:50:49.

export interface Bundle<T> extends Identifiable {
  id: string;
  metadata: Metadata;
  active: boolean;
  suspended: boolean;
  // Sent by the API, not read by the UI.
  identifiers: unknown;
  migrationStatus: unknown;
  loggingInfo: LoggingInfo[];
  latestAuditInfo: LoggingInfo;
  latestOnboardingInfo: LoggingInfo;
  latestUpdateInfo: LoggingInfo;
  status: string;
  service: Service;
  datasource: Datasource;
}

export interface LoggingInfo {
  date: string;
  userEmail: string;
  userFullName: string;
  userRole: string;
  type: string;
  comment: string;
  actionType: string;
}

export interface EmailMessage {
  recipientEmail: string;
  senderEmail: string;
  senderName: string;
  subject: string;
  message: string;
}

export interface Event extends Identifiable {
  id: string;
  instant: number;
  type: string;
  user: string;
  service: string;
  value: string;
}

export interface ExtrasMapType {
  entry: ExtrasType[];
}

export interface XmlAdapter<ValueType, BoundType> {
}

export interface ExtrasMapTypeAdapter extends XmlAdapter<ExtrasMapType, { [index: string]: string }> {
}

export interface ExtrasType {
  key: string;
  value: string;
}

export interface Identifiable {
  id: string;
}

export interface Indicator extends Identifiable {
  id: string;
  name: string;
  description: string;
  dimensions: string[];
  unit: string;
  unitName: string;
}

export interface ServiceBundle extends Bundle<any> {
  service: Service;
  datasource: Datasource;
}

export interface Measurement extends Identifiable {
  id: string;
  indicatorId: string;
  serviceId: string;
  time: XMLGregorianCalendar;
  locations: string[];
  valueIsRange: boolean;
  value: string;
  rangeValue: RangeValue;
}

export interface Metadata {
  registeredBy: string;
  registeredAt: string;
  modifiedBy: string;
  modifiedAt: string;
  source: string;
  originalId: string;
}
export interface ProviderBundle extends Bundle<Provider> {
  templateStatus: string;
  provider: Provider;
}

export interface Provider extends Identifiable {
  id: string;
  abbreviation: string;
  name: string;
  website: URL;
  legalEntity: boolean;
  legalStatus: string;
  hostingLegalEntity: string;
  description: string;
  logo: URL;
  multimedia: MultimediaPair[];
  scientificDomains: ServiceProviderDomain[];
  tags: string[];
  structureTypes: string[];
  location: ProviderLocation;
  mainContact: ProviderMainContact;
  publicContacts: ProviderPublicContact[];
  lifeCycleStatus: string;
  certifications: string[];
  participatingCountries: string[];
  affiliations: string[];
  networks: string[];
  catalogueId: string;
  esfriDomains: string[];
  esfriType: string;
  merilScientificDomains: ProviderMerilDomain[];
  areasOfActivity: string[];
  societalGrandChallenges: string[];
  nationalRoadmaps: string[];
  users: User[];
}

export interface ProviderLocation {
  streetNameAndNumber: string;
  postalCode: string;
  city: string;
  region: string;
  country: string;
}

export interface ProviderMainContact {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
}

export interface ProviderPublicContact {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
}

export interface ProviderRequest extends Identifiable {
  id: string;
  message: EmailMessage;
  date: string;
  providerId: string;
  read: boolean;
}

export interface RangeValue {
  fromValue: string;
  toValue: string;
}

export interface ServiceProviderDomain {
  scientificDomain: string;
  scientificSubdomain: string;
}

export interface ProviderMerilDomain {
  merilScientificDomain: string;
  merilScientificSubdomain: string;
}

export interface ServiceCategory {
  category: string;
  subcategory: string;
}

/** One entry of a service's change log, as the service pages show it. */
export interface ChangeLogEntry {
  changeLogVersion: string;
  changeDate: string;
  logs: {type: string; value: string}[];
}

/** A highlighted feature of a service, shown on its overview page. */
export interface ServiceFeature {
  featuresTitle: string;
  featuresText: string;
  featuresImage: string;
}

/**
 * The free-form presentation data of a service. The fields the pages read with dot access are typed; the many others
 * (pitch, portfolios, users, paymentCategories, ...) are read by key and keep the open index signature.
 */
export interface ServiceExtras {
  image?: string;
  paymentInformation?: string;
  features?: ServiceFeature[];
  openAireChangeLog?: ChangeLogEntry[];
  [key: string]: any;
}

export interface Service extends Identifiable {
  id: string;
  abbreviation: string;
  name: string;
  resourceOrganisation: string;
  resourceProviders: string[];
  webpage: URL;
  description: string;
  tagline: string;
  logo: URL;
  /** Null when the form leaves them empty, which the API stores as none. */
  multimedia: MultimediaPair[] | null;
  useCases: UseCasesPair[] | null;
  scientificDomains: ServiceProviderDomain[];
  categories: ServiceCategory[];
  targetUsers: string[];
  accessTypes: string[];
  accessModes: string[];
  tags: string[];
  // serviceCategories: string[];
  // marketplaceLocations: string[];
  // horizontalService: boolean;
  geographicalAvailabilities: string[];
  languageAvailabilities: string[];
  resourceGeographicLocations: string[];
  mainContact: ServiceMainContact;
  publicContacts: ServicePublicContact[];
  helpdeskEmail: string;
  securityContactEmail: string;
  trl: string;
  lifeCycleStatus: string;
  certifications: string[];
  standards: string[];
  openSourceTechnologies: string[];
  version: string;
  lastUpdate: string;
  changeLog: string[];
  requiredResources: string[];
  relatedResources: string[];
  relatedPlatforms: string[];
  catalogueId: string;
  fundingBody: string[];
  fundingPrograms: string[];
  grantProjectNames: string[];
  helpdeskPage: URL;
  userManual: URL;
  termsOfUse: URL;
  privacyPolicy: URL;
  accessPolicy: URL;
  resourceLevel: URL;
  trainingInformation: URL;
  statusMonitoring: URL;
  maintenance: URL;
  orderType: string;
  order: URL;
  paymentModel: URL;
  pricing: URL;
  extras: ServiceExtras;
}

export interface Datasource extends Service, Identifiable {
  id: string;
  serviceId: string;
  catalogueId: string;
  submissionPolicyURL: URL;
  preservationPolicyURL: URL;
  versionControl: boolean;
  persistentIdentitySystems: PersistentIdentitySystem[];
  jurisdiction: string;
  datasourceClassification: string;
  researchEntityTypes: string[];
  thematic: boolean;
  harvestable: boolean;
  researchProductLicensings: ResearchProductLicensing[];
  researchProductAccessPolicies: string[];
  researchProductMetadataLicensing: ResearchProductMetadataLicensing;
  researchProductMetadataAccessPolicies: string[];
}

export interface MultimediaPair {
  multimediaURL: URL;
  multimediaName: string;
}

export interface UseCasesPair {
  useCaseURL: URL;
  useCaseName: string;
}

export interface PersistentIdentitySystem {
  persistentIdentityEntityType: string;
  persistentIdentityEntityTypeSchemes: string[];
}

export interface ResearchProductLicensing {
  researchProductLicenseName: string;
  researchProductLicenseURL: URL;
}

export interface ResearchProductMetadataLicensing {
  researchProductMetadataLicenseName: string;
  researchProductMetadataLicenseURL: URL;
}

export interface ServiceHistory extends Metadata {
  version: string;
  versionChange: boolean;
  coreVersionId: string;
}

export interface ServiceMainContact {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  organisation: string;
}

export interface ServicePublicContact {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  organisation: string;
}

export interface User extends Identifiable {
  id: string;
  email: string;
  name: string;
  surname: string;
}

export interface Vocabulary extends Identifiable {
  id: string;
  name: string;
  description: string;
  parentId: string;
  type: string;
  extras: { [index: string]: string };
}

export interface VocabularyEntryRequest {
  // id: string;
  userId: string;
  resourceId: string;
  providerId: string;
  dateOfRequest: string;
  resourceType: string;
}

export interface VocabularyCuration extends Identifiable {
  vocabularyEntryRequests: VocabularyEntryRequest[];
  id: string;
  entryValueName: string;
  vocabulary: string;
  parent: string;
  status: string;
  rejectionReason: string;
  resolutionDate: string;
  resolutionUser: string;
}

export interface Category {
  superCategory: Vocabulary;
  category: Vocabulary;
  subCategory: Vocabulary;
}

export interface MapValues {
  key: string;
  values: Value[];
}

export interface PlaceCount {
  place: string;
  count: number;
}

export interface ProviderInfo {
  providerId: string;
  providerName: string;
  providerAbbreviation: string;
  resourceOrganisation: boolean;
}

export interface ScientificDomain {
  domain: Vocabulary;
  subdomain: Vocabulary;
}

export interface Value {
  id: string;
  name: string;
}

export interface VocabularyTree {
  vocabulary: Vocabulary;
  children: VocabularyTree[];
}

export interface XMLGregorianCalendar extends Cloneable {
}

export interface URL extends Serializable {
}

export interface Cloneable {
}

export interface Serializable {
}

export const enum UserActionType {
  FAVOURITE = "FAVOURITE",
  RATING = "RATING",
}

export const enum DimensionType {
  TIME = "TIME",
  LOCATIONS = "LOCATIONS",
}

export const enum UnitType {
  PCT = "PCT",
  NUM = "NUM",
  BOOL = "BOOL",
}

export const enum States {
  PENDING_1 = "PENDING_1",
  ST_SUBMISSION = "ST_SUBMISSION",
  PENDING_2 = "PENDING_2",
  REJECTED_ST = "REJECTED_ST",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export const enum Type {
  SUPERCATEGORY = "SUPERCATEGORY",
  CATEGORY = "CATEGORY",
  SUBCATEGORY = "SUBCATEGORY",
  LANGUAGE = "LANGUAGE",
  COUNTRY = "COUNTRY",
  TRL = "TRL",
  SCIENTIFIC_DOMAIN = "SCIENTIFIC_DOMAIN",
  SCIENTIFIC_SUBDOMAIN = "SCIENTIFIC_SUBDOMAIN",
  TARGET_USER = "TARGET_USER",
  ACCESS_TYPE = "ACCESS_TYPE",
  ACCESS_MODE = "ACCESS_MODE",
  ORDER_TYPE = "ORDER_TYPE",
  FUNDING_BODY = "FUNDING_BODY",
  FUNDING_PROGRAM = "FUNDING_PROGRAM",
  LIFE_CYCLE_STATUS = "LIFE_CYCLE_STATUS",
  PROVIDER_AREA_OF_ACTIVITY = "PROVIDER_AREA_OF_ACTIVITY",
  PROVIDER_ESFRI_TYPE = "PROVIDER_ESFRI_TYPE",
  PROVIDER_ESFRI_DOMAIN = "PROVIDER_ESFRI_DOMAIN",
  PROVIDER_LEGAL_STATUS = "PROVIDER_LEGAL_STATUS",
  PROVIDER_LIFE_CYCLE_STATUS = "PROVIDER_LIFE_CYCLE_STATUS",
  PROVIDER_NETWORK = "PROVIDER_NETWORK",
  PROVIDER_SOCIETAL_GRAND_CHALLENGE = "PROVIDER_SOCIETAL_GRAND_CHALLENGE",
  PROVIDER_STRUCTURE_TYPE = "PROVIDER_STRUCTURE_TYPE",
  PROVIDER_MERIL_SCIENTIFIC_DOMAIN = "PROVIDER_MERIL_SCIENTIFIC_DOMAIN",
  PROVIDER_MERIL_SCIENTIFIC_SUBDOMAIN = "PROVIDER_MERIL_SCIENTIFIC_SUBDOMAIN",
}
