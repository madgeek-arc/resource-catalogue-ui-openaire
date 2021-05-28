import {Vocabulary} from './eic-model';

export class Group {
  id: string;
  name: string;
  required: boolean;
  order: number;
}

export class Required {
  topLevel: number;
  total: number;
}

export class Dependent {
  id: number;
  name: string;
}

export class Form {
  dependsOn: Dependent;
  affects: Dependent[];
  vocabulary: string;
  group: string;
  description: string;
  suggestion: string;
  placeholder: string;
  mandatory: boolean;
  immutable: string;
  order: number;
  visible: boolean;
}

export class Display {
  placement: string;
  order: number;
}

export class Field {
  id: string;
  name: string;
  parentId: string;
  parent: string;
  label: string;
  accessPath: string;
  multiplicity: boolean;
  type: string;
  form: Form;
  display: Display;
}

export class Fields {
  field: Field;
  subFieldGroups: Fields[];
}

export class FormModel {
  group: Group;
  fields: Fields[];
  required: Required;
}
