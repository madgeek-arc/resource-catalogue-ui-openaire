import {Component, forwardRef, input, Signal} from '@angular/core';
import {AbstractControl, ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, UntypedFormArray, UntypedFormGroup, Validators} from '@angular/forms';
import {NgSelectComponent} from '@ng-select/ng-select';
import {TestBed} from '@angular/core/testing';
import {provideRouter} from '@angular/router';
import {of} from 'rxjs';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {vocabularyName} from '../../../../catalogue-ui/domain/dynamic-form-model';
import {Vocabulary} from '../../../entities/eic-model';
import {HelpContentService} from '../../../services/help-content.service';
import {ProviderService} from '../../../services/provider.service';
import {ResourceService} from '../../../services/resource.service';
import {UserSessionService} from '../../../services/user-session.service';
import {PROVIDER_MODEL_SECTIONS, ProviderModelField} from './m-oa-provider.model';
import {ServiceProviderFormComponent} from './service-provider-form.component';

/*
 * Checks the hand-built provider form against the backend form model m-oa-provider (m-oa-provider.model.ts), field by
 * field, ahead of replacing the form with the dynamic one. Labels and descriptions are not compared: the dynamic form
 * will show the model's.
 */

// ng-select ships prebuilt and loads a second copy of Angular core under Vitest; this stands in for it.
@Component({
  selector: 'ng-select',
  template: '',
  providers: [{provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => NgSelectStubComponent), multi: true}]
})
class NgSelectStubComponent implements ControlValueAccessor {
  readonly items = input<unknown[]>();
  writeValue() { /* not needed */ }
  registerOnChange() { /* not needed */ }
  registerOnTouched() { /* not needed */ }
}

type Check = 'exists' | 'shape' | 'required' | 'url' | 'email' | 'phone' | 'vocabulary' | 'extra';

/** Where the form and the model differ on purpose, until the dynamic form replaces this one. */
const KNOWN_DIFFERENCES: {path: string; check: Check; reason: string}[] = [
  {path: 'catalogueId', check: 'exists', reason: 'hidden in the model; the backend fills it'},
  {path: 'legalEntity', check: 'required', reason: 'a checkbox that defaults to false, so it always has a value'},
  {path: 'hostingLegalEntity', check: 'vocabulary', reason: 'free text in the form; existing values are not vocabulary ids'},
  {path: 'scientificDomains.scientificDomain', check: 'required', reason: 'rows without a domain are dropped on submit'},
  {path: 'scientificDomains.scientificSubdomain', check: 'required', reason: 'the form lets a row go without a subdomain'},
  {path: 'merilScientificDomains.merilScientificDomain', check: 'required', reason: 'rows without a domain are dropped on submit'},
  {path: 'merilScientificDomains.merilScientificSubdomain', check: 'required', reason: 'the form lets a row go without a subdomain'},
  {path: 'mainContact.lastName', check: 'required', reason: 'the form requires it; the model and the API schema do not'},
  {path: 'publicContacts', check: 'required', reason: 'the form keeps one row, which it never removes, instead of a required array'},
  {path: 'users', check: 'required', reason: 'the form keeps one row, which deleteUser() never removes, instead of a required array'},
  {path: 'alternativeIdentifiers', check: 'exists', reason: 'bug: an edit drops it'},
  {path: 'lifeCycleStatus', check: 'vocabulary', reason: 'bug: the form offers the service life cycle statuses'},
  {path: 'structureTypes', check: 'required', reason: 'bug: rows added with the button are required, the first is not'},
  {path: 'publicContacts.email', check: 'required', reason: 'bug: added rows lose the validators of the first'},
  {path: 'publicContacts.email', check: 'email', reason: 'bug: added rows lose the validators of the first'},
  {path: 'publicContacts.phone', check: 'phone', reason: 'bug: added rows lose the validators of the first'}
];

/** The vocabulary each select of the form offers, by model field path. */
const VOCABULARY_SIGNALS: Record<string, keyof ServiceProviderFormComponent> = {
  'legalStatus': 'legalStatusVocabulary',
  'scientificDomains.scientificDomain': 'domainsVocabulary',
  'scientificDomains.scientificSubdomain': 'categoriesVocabulary',
  'structureTypes': 'providerTypeVocabulary',
  'location.country': 'placesVocabulary',
  'lifeCycleStatus': 'providerLCSVocabulary',
  'participatingCountries': 'placesVocabulary',
  'networks': 'networksVocabulary',
  'esfriDomains': 'esfriDomainVocabulary',
  'esfriType': 'esfriVocabulary',
  'merilScientificDomains.merilScientificDomain': 'merilDomainsVocabulary',
  'merilScientificDomains.merilScientificSubdomain': 'merilCategoriesVocabulary',
  'areasOfActivity': 'areasOfActivityVocabulary',
  'societalGrandChallenges': 'societalGrandChallengesVocabulary'
};

// Every vocabulary type the form asks for, holding one entry whose id is the type's name.
const namedVocabularies = () => new Proxy({}, {get: (_, type) => [{id: String(type), name: String(type), parentId: ''}]});

const modelFields = PROVIDER_MODEL_SECTIONS.flatMap(section => section.fields);

describe('provider form parity with the m-oa-provider model', () => {
  let component: ServiceProviderFormComponent;
  let root: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {provide: ResourceService, useValue: {getAllVocabulariesByType: () => of(namedVocabularies())}},
        {provide: ProviderService, useValue: {}},
        {provide: UserSessionService, useValue: {isSignedIn: () => true, login: vi.fn()}},
        {provide: HelpContentService, useValue: {getActivePageContent: () => of({content: {}})}}
      ]
    });
    TestBed.overrideComponent(ServiceProviderFormComponent, {remove: {imports: [NgSelectComponent]}, add: {imports: [NgSelectStubComponent]}});
    const fixture = TestBed.createComponent(ServiceProviderFormComponent);
    fixture.detectChanges();
    component = fixture.componentInstance;
    root = fixture.nativeElement;
    // A second row in every list, added the way a user adds one, so the rows the form adds are checked too.
    for (const field of modelFields.filter(f => f.typeInfo.multiplicity)) {
      const list = root.querySelector(`[formArrayName="${field.name}"]`);
      list?.closest('.uk-margin-large-bottom')?.querySelector<HTMLElement>('a.add-new-element')?.click();
    }
    fixture.detectChanges();
  });

  /** Each check that fails, as 'path:check', with what was found. */
  const differences = () => {
    const found = new Map<string, string>();
    const differ = (path: string, check: Check, detail: string) => found.set(`${path}:${check}`, detail);
    // The form composes most validators into one function, so a control's are told by what they reject.
    const rejects = (control: AbstractControl, value: unknown) => control.validator?.(new FormControl(value)) != null;
    // A list is required when it carries Validators.required itself, a group also when one of its fields is required.
    const required = (control: AbstractControl): boolean => {
      if (control instanceof FormControl) {
        return control.validator?.(new FormControl(null))?.['required'] === true;
      }
      return control.hasValidator(Validators.required)
        || (control instanceof UntypedFormGroup && Object.values(control.controls).some(required));
    };

    // A value each format rejects.
    const probes: Record<string, string> = {url: 'example.org', email: 'someone', phone: 'x'};

    const compare = (field: ProviderModelField, parent: UntypedFormGroup, path: string) => {
      const control = parent.get(field.name);
      if (!control) {
        differ(path, 'exists', 'no control');
        return;
      }
      const composite = field.typeInfo.type === 'composite';
      const expected = field.typeInfo.multiplicity ? UntypedFormArray : composite ? UntypedFormGroup : FormControl;
      if (!(control instanceof expected)) {
        differ(path, 'shape', `${control.constructor.name}, expected ${expected.name}`);
        return;
      }
      // A list is checked on each of its rows; a list of groups is required as a whole, like the dynamic form's.
      const rows = control instanceof UntypedFormArray ? control.controls : [control];
      if (field.typeInfo.multiplicity && rows.length < 2) {
        differ(path, 'shape', `${rows.length} rows after adding one`);
      }
      if (composite) {
        if (required(control) !== field.mandatory) {
          differ(path, 'required', `required: ${required(control)}`);
        }
        for (const row of rows) {
          for (const subField of field.subFields ?? []) {
            compare(subField, row as UntypedFormGroup, `${path}.${subField.name}`);
          }
        }
        return;
      }
      for (const row of rows) {
        if (required(row) !== field.mandatory) {
          differ(path, 'required', `required: ${required(row)}`);
        }
        const type = field.typeInfo.type;
        if (type in probes && !rejects(row, probes[type])) {
          differ(path, type as Check, `'${probes[type]}' passes`);
        }
      }
      if (field.typeInfo.type === 'vocabulary') {
        const signal = VOCABULARY_SIGNALS[path];
        const offered = signal && (component[signal] as Signal<Vocabulary[] | null>)()?.[0]?.id;
        if (offered !== vocabularyName(field.typeInfo)) {
          differ(path, 'vocabulary', signal ? `offers '${offered}'` : 'not a vocabulary select');
        }
      }
    };

    const form = component.newProviderForm;
    for (const field of modelFields) {
      compare(field, form, field.name);
    }

    // Every control of the form is a field of the model.
    const extra = (group: UntypedFormGroup, fields: ProviderModelField[], path: string) => {
      for (const [name, control] of Object.entries(group.controls)) {
        const field = fields.find(f => f.name === name);
        if (!field) {
          differ(path + name, 'extra', 'not in the model');
          continue;
        }
        const rows = control instanceof UntypedFormArray ? control.controls : [control];
        for (const row of rows.filter(r => r instanceof UntypedFormGroup)) {
          extra(row as UntypedFormGroup, field.subFields ?? [], `${path}${name}.`);
        }
      }
    };
    extra(form, modelFields, '');
    return found;
  };

  it('has the fields, lists, required flags, formats and vocabularies of the model, apart from the known differences', () => {
    const found = differences();
    const known = new Set(KNOWN_DIFFERENCES.map(({path, check}) => `${path}:${check}`));

    expect([...found].filter(([key]) => !known.has(key)).map(([key, detail]) => `${key} (${detail})`)).toEqual([]);
    // A known difference that is gone has to leave the list.
    expect([...known].filter(key => !found.has(key))).toEqual([]);
  });

  it('has a tab for each section of the model, in its order', () => {
    const tabs = [...root.querySelectorAll('ul.form-tabs > li span')]
      .map(span => span.textContent!.trim().replace(/^\d+\.\s*/, '').replace(/\s*\*$/, ''));

    expect(tabs).toEqual(PROVIDER_MODEL_SECTIONS.map(section => section.name));
  });
});
