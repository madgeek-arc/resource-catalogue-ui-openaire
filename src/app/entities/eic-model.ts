/* tslint:disable */
/* eslint-disable */
// Generated using typescript-generator version 2.16.538 on 2020-06-10 11:50:49.

export class Bundle<T> implements Identifiable {
  id: string;
  metadata: Metadata;
  active: boolean;
  suspended: boolean;
  identifiers
  migrationStatus
  loggingInfo: LoggingInfo[];
  latestAuditInfo: LoggingInfo;
  latestOnboardingInfo: LoggingInfo;
  latestUpdateInfo: LoggingInfo;
  status: string;
  service: Service;
  datasource: Datasource;
}

export class LoggingInfo {
  date: string;
  userEmail: string;
  userFullName: string;
  userRole: string;
  type: string;
  comment: string;
  actionType: string;
}

export class EmailMessage {
  recipientEmail: string;
  senderEmail: string;
  senderName: string;
  subject: string;
  message: string;
}

export class Event implements Identifiable {
  id: string;
  instant: number;
  type: string;
  user: string;
  service: string;
  value: string;
}

export class ExtrasMapType {
  entry: ExtrasType[];
}

export class XmlAdapter<ValueType, BoundType> {
}

export class ExtrasMapTypeAdapter extends XmlAdapter<ExtrasMapType, { [index: string]: string }> {
}

export class ExtrasType {
  key: string;
  value: string;
}

export interface Identifiable {
  id: string;
}

export class Indicator implements Identifiable {
  id: string;
  name: string;
  description: string;
  dimensions: string[];
  unit: string;
  unitName: string;
}

export class ServiceBundle extends Bundle<any> {
  service: Service;
  datasource: Datasource;
}

export class Measurement implements Identifiable {
  id: string;
  indicatorId: string;
  serviceId: string;
  time: XMLGregorianCalendar;
  locations: string[];
  valueIsRange: boolean;
  value: string;
  rangeValue: RangeValue;
}

export class Metadata {
  registeredBy: string;
  registeredAt: string;
  modifiedBy: string;
  modifiedAt: string;
  source: string;
  originalId: string;
}
export class ProviderBundle extends Bundle<Provider> {
  templateStatus: string;
  provider: Provider;
}

export class Provider implements Identifiable {
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

export class ProviderLocation {
  streetNameAndNumber: string;
  postalCode: string;
  city: string;
  region: string;
  country: string;
}

export class ProviderMainContact {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
}

export class ProviderPublicContact {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
}

export class ProviderRequest implements Identifiable {
  id: string;
  message: EmailMessage;
  date: string;
  providerId: string;
  read: boolean;
}

export class RangeValue {
  fromValue: string;
  toValue: string;
}

export class ServiceProviderDomain {
  scientificDomain: string;
  scientificSubdomain: string;
}

export class ProviderMerilDomain {
  merilScientificDomain: string;
  merilScientificSubdomain: string;
}

export class ServiceCategory {
  category: string;
  subcategory: string;
}

export class Service implements Identifiable {
  id: string;
  abbreviation: string;
  name: string;
  resourceOrganisation: string;
  resourceProviders: string[];
  webpage: URL;
  description: string;
  tagline: string;
  logo: URL;
  multimedia: MultimediaPair[];
  useCases: UseCasesPair[];
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
  extras: object;
}

export class Datasource extends Service implements Identifiable {
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

export class MultimediaPair {
  multimediaURL: URL;
  multimediaName: string;
}

export class UseCasesPair {
  useCaseURL: URL;
  useCaseName: string;
}

export class PersistentIdentitySystem {
  persistentIdentityEntityType: string;
  persistentIdentityEntityTypeSchemes: string[];
}

export class ResearchProductLicensing {
  researchProductLicenseName: string;
  researchProductLicenseURL: URL;
}

export class ResearchProductMetadataLicensing {
  researchProductMetadataLicenseName: string;
  researchProductMetadataLicenseURL: URL;
}

export class ServiceHistory extends Metadata {
  version: string;
  versionChange: boolean;
  coreVersionId: string;
}

export class ServiceMainContact {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  organisation: string;
}

export class ServicePublicContact {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  organisation: string;
}

export class User implements Identifiable {
  id: string;
  email: string;
  name: string;
  surname: string;
}

export class Vocabulary implements Identifiable {
  id: string;
  name: string;
  description: string;
  parentId: string;
  type: string;
  extras: { [index: string]: string };
}

export class VocabularyEntryRequest {
  // id: string;
  userId: string;
  resourceId: string;
  providerId: string;
  dateOfRequest: string;
  resourceType: string;
}

export class VocabularyCuration implements Identifiable {
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

export class Category {
  superCategory: Vocabulary;
  category: Vocabulary;
  subCategory: Vocabulary;
}

export class MapValues {
  key: string;
  values: Value[];
}

export class PlaceCount {
  place: string;
  count: number;
}

export class ProviderInfo {
  providerId: string;
  providerName: string;
  providerAbbreviation: string;
  resourceOrganisation: boolean;
}

export class ScientificDomain {
  domain: Vocabulary;
  subdomain: Vocabulary;
}

export class Value {
  id: string;
  name: string;
}

export class VocabularyTree {
  vocabulary: Vocabulary;
  children: VocabularyTree[];
}

export class XMLGregorianCalendar implements Cloneable {
}

export class URL implements Serializable {
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
