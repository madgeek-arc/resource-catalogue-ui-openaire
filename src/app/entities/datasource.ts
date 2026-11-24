
export interface DatasourceDetails {
  id: string;
  openaireId: string;
  officialname: string;
  englishname: string;
  websiteurl: string;
  logourl: string;
  contactemail: string;
  latitude: number;
  longitude: number;
  namespaceprefix: string;
  languages: string;
  dateofvalidation: Date;
  eoscDatasourceType: string;
  dateofcollection: Date;
  platform: string;
  activationId: string;
  description: string;
  issn: string;
  eissn: string;
  lissn: string;
  registeredby: string;
  subjects: string;
  aggregator: string;
  collectedfrom: string;
  managed: boolean;
  registrationdate: Date;
  consentTermsOfUseDate: Date;
  lastConsentTermsOfUseDate: Date;
  consentTermsOfUse: boolean;
  fullTextDownload: boolean;
  organizations: OrganizationDetails[];
  identities: IdentitiesDetails[];
  status: string;
  typology: string;
}

export interface OrganizationDetails {
  legalshortname: string;
  legalname: string;
  websiteurl: string;
  logourl: string;
  country: string;
}

export interface IdentitiesDetails {
  pid: string;
  issuertype: string;
}

export interface DatasourceTypes {
  id: string;
  name: string;
  description: string;
  code: string;
  terms: Term[];
}

export interface Term {
  englishName: string;
  nativeName: string;
  encoding: string;
  code: string;
  synonyms: string;
}
