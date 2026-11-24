/** Vocabularies by type (or sub-vocabularies by parent id): a JSON object from the API, indexed by name, not a Map. */
export type VocabularyLookup = Record<string, object[]>;

export class Required {
  topLevel: number;
  total: number;


  constructor() {
    this.topLevel = 0;
    this.total = 0;
  }
}

export interface Dependent {
  id: number;
  name: string;
  value: string;
}

export class TypeInfo {
  type: string;
  values: string[];
  vocabulary: string | null;
  multiplicity: boolean;
  /** Newer form models give a vocabulary field a URL instead of a vocabulary name. */
  properties?: {url?: string; idField?: string; labelField?: string; urlParams?: any};


  constructor() {
    this.type = 'string';
    this.values = [];
    this.vocabulary = null;
    this.multiplicity = false;
  }
}

/**
 * The vocabulary name a field's options are keyed by in the vocabularies map (/vocabularies/mappings).
 * Older form models set `typeInfo.vocabulary`; newer ones only set `typeInfo.properties.url`, such as
 * `/api/vocabulary/types/Target%20user?parent_id=...`, whose last path segment is the name ('Target user').
 */
export function vocabularyName(typeInfo: TypeInfo): string | null {
  if (typeInfo?.vocabulary) {
    return typeInfo.vocabulary;
  }
  const url = typeInfo?.properties?.url;
  if (!url) {
    return null;
  }
  const lastSegment = url.split('?')[0].split('/').filter(Boolean).pop();
  return lastSegment ? decodeURIComponent(lastSegment) : null;
}

export class Form {
  dependsOn: Dependent | null;
  affects: Dependent[] | null;
  vocabulary: string | null;
  group: string;
  description: StyledText;
  suggestion: StyledText;
  placeholder: string;
  mandatory: boolean;
  immutable: boolean;
  display: Display;

  constructor() {
    this.dependsOn = null;
    this.affects = null;
    this.vocabulary = null;
    this.group = '';
    this.description = new StyledText();
    this.suggestion = new StyledText();
    this.placeholder = '';
    this.mandatory = false;
    this.immutable = false;
    this.display = new Display();
  }
}

export class Display {
  hasBorder: boolean;
  order: number;
  placement: string;
  visible: boolean;
  cssClasses: string;
  style: string;

  constructor() {
    this.hasBorder = false;
    this.order = 0;
    this.placement = '';
    this.cssClasses = '';
    this.style = '';
    this.visible = true;
  }
}

export class StyledText {
  cssClasses: string;
  style: string;
  text: string;
  showLess: boolean;

  constructor() {
    this.cssClasses = '';
    this.style = '';
    this.text = '';
    this.showLess = false;
  }
}

export class Field {
  id: string;
  name: string;
  parentId: string;
  parent: string;
  label: StyledText;
  accessPath: string;
  kind: string;
  typeInfo: TypeInfo;
  includedInSnippet: boolean;
  form: Form;
  display: Display;
  subFields: Field[] | null;

  constructor() {
    this.id = '';
    this.name = '';
    this.parentId = '';
    this.parent = '';
    this.label = new StyledText();
    this.accessPath = '';
    this.kind = '';
    this.typeInfo = new TypeInfo();
    this.includedInSnippet = false;
    this.form = new Form();
    this.display = new Display();
    this.subFields = [];
  }
}

export class Section {
  id: string | null;
  name: string;
  description: string | null;
  subType: string;
  order: number;
  subSections: Section[];
  fields: Field[];
  required: Required;

  constructor() {
    this.id = null;
    this.name = '';
    this.description = null;
    this.subType = '';
    this.order = 0;
    this.subSections = [];
    this.fields = [];
    this.required = new Required();
  }
}

export class GroupedFields {
  id: string;
  name: string;
  description: string;
  order: number;
  fields: Field[];
  required: Required;


  constructor() {
    this.id = '';
    this.name = '';
    this.description = '';
    this.order = 0;
    this.fields = [];
    this.required = new Required();
  }
}

export interface Model {
  id: string;
  name: string;
  description: string;
  notice: string;
  type: string;
  subType: string;
  resourceType: string;
  creationDate: string;
  createdBy: string;
  modifiedBy: string;
  sections: Section[];
  locked: boolean;
}

export interface UiVocabulary {
  id: string;
  name: string;
}

export interface HandleBitSet {
  field: Field;
  position: number;
}
