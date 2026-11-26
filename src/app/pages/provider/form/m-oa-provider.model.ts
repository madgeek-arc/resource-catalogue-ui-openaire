import {TypeInfo} from '../../../../catalogue-ui/domain/dynamic-form-model';

/** A field of the provider form model, with only what the parity spec compares. */
export interface ProviderModelField {
  id: string;
  name: string;
  label: string;
  typeInfo: TypeInfo;
  mandatory: boolean;
  /** form.display.visible */
  visible: boolean;
  subFields?: ProviderModelField[];
}

export interface ProviderModelSection {
  id: string;
  name: string;
  fields: ProviderModelField[];
}

/**
 * The sections of the backend form model m-oa-provider, in order, trimmed to what provider-model-parity.spec.ts
 * compares. Taken on 2026-11-26 from madgeek-arc/openaire-catalogue@develop
 * (src/main/resources/openaire/models/m-oa-provider.json, commit f39fa706), which matched GET /api/forms/models/m-oa-provider
 * field for field. Refresh it when the model changes.
 */
export const PROVIDER_MODEL_SECTIONS: ProviderModelSection[] = [
  {
    id: 'section-oa-provider-basic',
    name: 'Basic',
    fields: [
      {
        id: '1',
        name: 'id',
        label: 'Id',
        typeInfo: {
          type: 'string',
          values: [],
          vocabulary: null,
          multiplicity: false
        },
        mandatory: false,
        visible: false
      },
      {
        id: '2',
        name: 'name',
        label: 'Name',
        typeInfo: {
          type: 'string',
          values: [],
          vocabulary: null,
          multiplicity: false
        },
        mandatory: true,
        visible: true
      },
      {
        id: '3',
        name: 'abbreviation',
        label: 'Abbreviation',
        typeInfo: {
          type: 'string',
          values: [],
          vocabulary: null,
          multiplicity: false
        },
        mandatory: true,
        visible: true
      },
      {
        id: '4',
        name: 'website',
        label: 'Website',
        typeInfo: {
          type: 'url',
          values: [],
          vocabulary: null,
          multiplicity: false
        },
        mandatory: true,
        visible: true
      },
      {
        id: '5',
        name: 'legalEntity',
        label: 'Legal Entity',
        typeInfo: {
          type: 'bool',
          values: [],
          vocabulary: null,
          multiplicity: false
        },
        mandatory: true,
        visible: true
      },
      {
        id: '6',
        name: 'legalStatus',
        label: 'Legal Status',
        typeInfo: {
          type: 'vocabulary',
          values: [],
          vocabulary: null,
          multiplicity: false,
          properties: {
            url: '/api/vocabulary/types/Provider%20legal%20status'
          }
        },
        mandatory: false,
        visible: true
      },
      {
        id: '7',
        name: 'hostingLegalEntity',
        label: 'Hosting Legal Entity',
        typeInfo: {
          type: 'vocabulary',
          values: [],
          vocabulary: null,
          multiplicity: false,
          properties: {
            url: '/api/vocabulary/types/Provider%20hosting%20legal%20entity'
          }
        },
        mandatory: false,
        visible: true
      },
      {
        id: '10',
        name: 'alternativeIdentifiers',
        label: 'Alternative Identifiers',
        typeInfo: {
          type: 'composite',
          values: [],
          vocabulary: null,
          multiplicity: true
        },
        mandatory: false,
        visible: true,
        subFields: [
          {
            id: '8',
            name: 'type',
            label: 'Type',
            typeInfo: {
              type: 'string',
              values: [],
              vocabulary: null,
              multiplicity: false
            },
            mandatory: false,
            visible: true
          },
          {
            id: '9',
            name: 'value',
            label: 'Value',
            typeInfo: {
              type: 'string',
              values: [],
              vocabulary: null,
              multiplicity: false
            },
            mandatory: false,
            visible: true
          }
        ]
      }
    ]
  },
  {
    id: 'section-oa-provider-marketing',
    name: 'Marketing',
    fields: [
      {
        id: '11',
        name: 'description',
        label: 'Description',
        typeInfo: {
          type: 'richText',
          values: [],
          vocabulary: null,
          multiplicity: false
        },
        mandatory: true,
        visible: true
      },
      {
        id: '12',
        name: 'logo',
        label: 'Logo',
        typeInfo: {
          type: 'url',
          values: [],
          vocabulary: null,
          multiplicity: false
        },
        mandatory: true,
        visible: true
      },
      {
        id: '15',
        name: 'multimedia',
        label: 'Multimedia',
        typeInfo: {
          type: 'composite',
          values: [],
          vocabulary: null,
          multiplicity: true
        },
        mandatory: false,
        visible: true,
        subFields: [
          {
            id: '13',
            name: 'multimediaURL',
            label: 'Url',
            typeInfo: {
              type: 'url',
              values: [],
              vocabulary: null,
              multiplicity: false
            },
            mandatory: true,
            visible: true
          },
          {
            id: '14',
            name: 'multimediaName',
            label: 'Name',
            typeInfo: {
              type: 'string',
              values: [],
              vocabulary: null,
              multiplicity: false
            },
            mandatory: false,
            visible: true
          }
        ]
      }
    ]
  },
  {
    id: 'section-oa-provider-classification',
    name: 'Classification',
    fields: [
      {
        id: '18',
        name: 'scientificDomains',
        label: 'Scientific Categorisation',
        typeInfo: {
          type: 'composite',
          values: [],
          vocabulary: null,
          multiplicity: true
        },
        mandatory: false,
        visible: true,
        subFields: [
          {
            id: '16',
            name: 'scientificDomain',
            label: 'Scientific Domain',
            typeInfo: {
              type: 'vocabulary',
              values: [],
              vocabulary: null,
              multiplicity: false,
              properties: {
                url: '/api/vocabulary/types/Scientific%20domain'
              }
            },
            mandatory: true,
            visible: true
          },
          {
            id: '17',
            name: 'scientificSubdomain',
            label: 'Scientific Subdomain',
            typeInfo: {
              type: 'vocabulary',
              values: [],
              vocabulary: null,
              multiplicity: false,
              properties: {
                url: '/api/vocabulary/types/Scientific%20subdomain'
              }
            },
            mandatory: true,
            visible: true
          }
        ]
      },
      {
        id: '19',
        name: 'tags',
        label: 'Tags',
        typeInfo: {
          type: 'string',
          values: [],
          vocabulary: null,
          multiplicity: true
        },
        mandatory: false,
        visible: true
      },
      {
        id: '20',
        name: 'structureTypes',
        label: 'Structure Types',
        typeInfo: {
          type: 'vocabulary',
          values: [],
          vocabulary: null,
          multiplicity: true,
          properties: {
            url: '/api/vocabulary/types/Provider%20structure%20type'
          }
        },
        mandatory: false,
        visible: true
      }
    ]
  },
  {
    id: 'section-oa-provider-location',
    name: 'Location',
    fields: [
      {
        id: '26',
        name: 'location',
        label: 'Location',
        typeInfo: {
          type: 'composite',
          values: [],
          vocabulary: null,
          multiplicity: false
        },
        mandatory: true,
        visible: true,
        subFields: [
          {
            id: '21',
            name: 'streetNameAndNumber',
            label: 'Street Name and Number',
            typeInfo: {
              type: 'string',
              values: [],
              vocabulary: null,
              multiplicity: false
            },
            mandatory: true,
            visible: true
          },
          {
            id: '22',
            name: 'postalCode',
            label: 'Postal Code',
            typeInfo: {
              type: 'string',
              values: [],
              vocabulary: null,
              multiplicity: false
            },
            mandatory: true,
            visible: true
          },
          {
            id: '23',
            name: 'city',
            label: 'City',
            typeInfo: {
              type: 'string',
              values: [],
              vocabulary: null,
              multiplicity: false
            },
            mandatory: true,
            visible: true
          },
          {
            id: '24',
            name: 'region',
            label: 'Region',
            typeInfo: {
              type: 'string',
              values: [],
              vocabulary: null,
              multiplicity: false
            },
            mandatory: false,
            visible: true
          },
          {
            id: '25',
            name: 'country',
            label: 'Country',
            typeInfo: {
              type: 'vocabulary',
              values: [],
              vocabulary: null,
              multiplicity: false,
              properties: {
                url: '/api/vocabulary/types/Country'
              }
            },
            mandatory: true,
            visible: true
          }
        ]
      }
    ]
  },
  {
    id: 'section-oa-provider-contact',
    name: 'Contact',
    fields: [
      {
        id: '32',
        name: 'mainContact',
        label: 'Main Contact',
        typeInfo: {
          type: 'composite',
          values: [],
          vocabulary: null,
          multiplicity: false
        },
        mandatory: true,
        visible: true,
        subFields: [
          {
            id: '27',
            name: 'firstName',
            label: 'First Name',
            typeInfo: {
              type: 'string',
              values: [],
              vocabulary: null,
              multiplicity: false
            },
            mandatory: true,
            visible: true
          },
          {
            id: '28',
            name: 'lastName',
            label: 'Last Name',
            typeInfo: {
              type: 'string',
              values: [],
              vocabulary: null,
              multiplicity: false
            },
            mandatory: false,
            visible: true
          },
          {
            id: '29',
            name: 'email',
            label: 'Email',
            typeInfo: {
              type: 'email',
              values: [],
              vocabulary: null,
              multiplicity: false
            },
            mandatory: true,
            visible: true
          },
          {
            id: '30',
            name: 'phone',
            label: 'Phone',
            typeInfo: {
              type: 'phone',
              values: [],
              vocabulary: null,
              multiplicity: false
            },
            mandatory: false,
            visible: true
          },
          {
            id: '31',
            name: 'position',
            label: 'Position',
            typeInfo: {
              type: 'string',
              values: [],
              vocabulary: null,
              multiplicity: false
            },
            mandatory: false,
            visible: true
          }
        ]
      },
      {
        id: '38',
        name: 'publicContacts',
        label: 'Public Contacts',
        typeInfo: {
          type: 'composite',
          values: [],
          vocabulary: null,
          multiplicity: true
        },
        mandatory: true,
        visible: true,
        subFields: [
          {
            id: '33',
            name: 'firstName',
            label: 'First Name',
            typeInfo: {
              type: 'string',
              values: [],
              vocabulary: null,
              multiplicity: false
            },
            mandatory: false,
            visible: true
          },
          {
            id: '34',
            name: 'lastName',
            label: 'Last Name',
            typeInfo: {
              type: 'string',
              values: [],
              vocabulary: null,
              multiplicity: false
            },
            mandatory: false,
            visible: true
          },
          {
            id: '35',
            name: 'email',
            label: 'Email',
            typeInfo: {
              type: 'email',
              values: [],
              vocabulary: null,
              multiplicity: false
            },
            mandatory: true,
            visible: true
          },
          {
            id: '36',
            name: 'phone',
            label: 'Phone',
            typeInfo: {
              type: 'phone',
              values: [],
              vocabulary: null,
              multiplicity: false
            },
            mandatory: false,
            visible: true
          },
          {
            id: '37',
            name: 'position',
            label: 'Position',
            typeInfo: {
              type: 'string',
              values: [],
              vocabulary: null,
              multiplicity: false
            },
            mandatory: false,
            visible: true
          }
        ]
      }
    ]
  },
  {
    id: 'section-oa-provider-maturity',
    name: 'Maturity',
    fields: [
      {
        id: '39',
        name: 'lifeCycleStatus',
        label: 'Life Cycle Status',
        typeInfo: {
          type: 'vocabulary',
          values: [],
          vocabulary: null,
          multiplicity: false,
          properties: {
            url: '/api/vocabulary/types/Provider%20life%20cycle%20status'
          }
        },
        mandatory: false,
        visible: true
      },
      {
        id: '40',
        name: 'certifications',
        label: 'Certifications',
        typeInfo: {
          type: 'string',
          values: [],
          vocabulary: null,
          multiplicity: true
        },
        mandatory: false,
        visible: true
      }
    ]
  },
  {
    id: 'section-oa-provider-dependencies',
    name: 'Dependencies',
    fields: [
      {
        id: '41',
        name: 'participatingCountries',
        label: 'Participating Countries',
        typeInfo: {
          type: 'vocabulary',
          values: [],
          vocabulary: null,
          multiplicity: true,
          properties: {
            url: '/api/vocabulary/types/Country'
          }
        },
        mandatory: false,
        visible: true
      },
      {
        id: '42',
        name: 'affiliations',
        label: 'Affiliations',
        typeInfo: {
          type: 'string',
          values: [],
          vocabulary: null,
          multiplicity: true
        },
        mandatory: false,
        visible: true
      },
      {
        id: '43',
        name: 'networks',
        label: 'Networks',
        typeInfo: {
          type: 'vocabulary',
          values: [],
          vocabulary: null,
          multiplicity: true,
          properties: {
            url: '/api/vocabulary/types/Provider%20network'
          }
        },
        mandatory: false,
        visible: true
      },
      {
        id: '44',
        name: 'catalogueId',
        label: 'Catalogue',
        typeInfo: {
          type: 'string',
          values: [],
          vocabulary: null,
          multiplicity: false
        },
        mandatory: false,
        visible: false
      }
    ]
  },
  {
    id: 'section-oa-provider-other',
    name: 'Other',
    fields: [
      {
        id: '45',
        name: 'esfriDomains',
        label: 'ESFRI Domains',
        typeInfo: {
          type: 'vocabulary',
          values: [],
          vocabulary: null,
          multiplicity: true,
          properties: {
            url: '/api/vocabulary/types/Provider%20esfri%20domain'
          }
        },
        mandatory: false,
        visible: true
      },
      {
        id: '46',
        name: 'esfriType',
        label: 'ESFRI Type',
        typeInfo: {
          type: 'vocabulary',
          values: [],
          vocabulary: null,
          multiplicity: false,
          properties: {
            url: '/api/vocabulary/types/Provider%20esfri%20type'
          }
        },
        mandatory: false,
        visible: true
      },
      {
        id: '49',
        name: 'merilScientificDomains',
        label: 'MERIL Scientific Categorisation',
        typeInfo: {
          type: 'composite',
          values: [],
          vocabulary: null,
          multiplicity: true
        },
        mandatory: false,
        visible: true,
        subFields: [
          {
            id: '47',
            name: 'merilScientificDomain',
            label: 'MERIL Scientific Domain',
            typeInfo: {
              type: 'vocabulary',
              values: [],
              vocabulary: null,
              multiplicity: false,
              properties: {
                url: '/api/vocabulary/types/Provider%20meril%20scientific%20domain'
              }
            },
            mandatory: true,
            visible: true
          },
          {
            id: '48',
            name: 'merilScientificSubdomain',
            label: 'MERIL Scientific Subdomain',
            typeInfo: {
              type: 'vocabulary',
              values: [],
              vocabulary: null,
              multiplicity: false,
              properties: {
                url: '/api/vocabulary/types/Provider%20meril%20scientific%20subdomain'
              }
            },
            mandatory: true,
            visible: true
          }
        ]
      },
      {
        id: '50',
        name: 'areasOfActivity',
        label: 'Areas of Activity',
        typeInfo: {
          type: 'vocabulary',
          values: [],
          vocabulary: null,
          multiplicity: true,
          properties: {
            url: '/api/vocabulary/types/Provider%20area%20of%20activity'
          }
        },
        mandatory: false,
        visible: true
      },
      {
        id: '51',
        name: 'societalGrandChallenges',
        label: 'Societal Grand Challenges',
        typeInfo: {
          type: 'vocabulary',
          values: [],
          vocabulary: null,
          multiplicity: true,
          properties: {
            url: '/api/vocabulary/types/Provider%20societal%20grand%20challenge'
          }
        },
        mandatory: false,
        visible: true
      },
      {
        id: '52',
        name: 'nationalRoadmaps',
        label: 'National Roadmaps',
        typeInfo: {
          type: 'string',
          values: [],
          vocabulary: null,
          multiplicity: true
        },
        mandatory: false,
        visible: true
      }
    ]
  },
  {
    id: 'section-oa-provider-admins',
    name: 'Admins',
    fields: [
      {
        id: '57',
        name: 'users',
        label: 'Users',
        typeInfo: {
          type: 'composite',
          values: [],
          vocabulary: null,
          multiplicity: true
        },
        mandatory: true,
        visible: true,
        subFields: [
          {
            id: '53',
            name: 'id',
            label: 'Id',
            typeInfo: {
              type: 'string',
              values: [],
              vocabulary: null,
              multiplicity: false
            },
            mandatory: false,
            visible: false
          },
          {
            id: '54',
            name: 'email',
            label: 'Email',
            typeInfo: {
              type: 'email',
              values: [],
              vocabulary: null,
              multiplicity: false
            },
            mandatory: true,
            visible: true
          },
          {
            id: '55',
            name: 'name',
            label: 'Name',
            typeInfo: {
              type: 'string',
              values: [],
              vocabulary: null,
              multiplicity: false
            },
            mandatory: true,
            visible: true
          },
          {
            id: '56',
            name: 'surname',
            label: 'Surname',
            typeInfo: {
              type: 'string',
              values: [],
              vocabulary: null,
              multiplicity: false
            },
            mandatory: true,
            visible: true
          }
        ]
      }
    ]
  }
];
