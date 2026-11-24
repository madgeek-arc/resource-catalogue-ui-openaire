import { Component, OnChanges, OnInit, ChangeDetectionStrategy, inject, input, output, linkedSignal, signal } from '@angular/core';
import {AbstractControl, UntypedFormArray, UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import {HttpErrorResponse} from '@angular/common/http';
import {Router} from '@angular/router';
import {FormControlService} from '../../services/form-control.service';
import {Section, Field, Model, VocabularyLookup} from '../../domain/dynamic-form-model';
import {Columns, Content, DocDefinition, PdfImage, PdfMetadata, PdfTable, TableDefinition} from '../../domain/PDFclasses';
import pdfMake from 'pdfmake/build/pdfmake';
import type {Content as PdfContent, ContentText, TableCell} from 'pdfmake/interfaces';
import pdfFonts from 'pdfmake/build/vfs_fonts';

import seedRandom from 'seedrandom';

import UIkit from 'uikit';
import { ChapterEditComponent } from './chapter-edit.component';
pdfMake.addVirtualFileSystem(pdfFonts);

@Component({
    selector: 'app-survey',
    templateUrl: 'survey.component.html',
    providers: [FormControlService],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ChapterEditComponent]
})

export class SurveyComponent implements OnInit, OnChanges {
  private formControlService = inject(FormControlService);
  private fb = inject(UntypedFormBuilder);
  private router = inject(Router);


  readonly payload = input<any>(null); // can't import specific project class in lib file
  readonly model = input<Model | null>(null);
  readonly subType = input<string | null>(null);
  readonly activeUsers = input<{fullname: string}[] | null>(null);
  readonly vocabulariesMap = input<VocabularyLookup | null>(null);
  readonly subVocabularies = input<VocabularyLookup | null>(null);
  readonly tabsHeader = input<string | null>(null);
  readonly mandatoryFieldsText = input<string | null>(null);

  /** The model, for the methods that only run once the form is shown, which needs a model. */
  private loadedModel(): Model {
    return this.model()!;
  }
  readonly downloadPDF = input(false);
  readonly valid = output<boolean>();
  readonly submit = output<[
    UntypedFormGroup,
    boolean
]>();

  /** The answers shown: the payload, then what the server returns after the unsaved-changes prompt submits. */
  private readonly answers = linkedSignal(() => this.payload());

  sectionIndex = 0;
  /** Chapters with unsaved changes; the chapter tabs mark them. */
  readonly chapterChangeMap = signal(new Map<string, boolean>());
  currentChapter: Section | null = null;
  chapterForSubmission: Section | null = null;
  sortedSurveyAnswers: Record<string, unknown> = {};
  editMode = false;

  ready = false;
  readonly = false;
  freeView = false;
  validate = false;
  readonly errorMessage = signal('');
  readonly successMessage = signal('');

  form: UntypedFormGroup;

  constructor() {
    this.form = this.fb.group({});
  }

  ngOnInit() {
    if (this.router.url.includes('/view')) {
      this.readonly = true;
    } else if (this.router.url.includes('/freeView')) {
      this.freeView = true;
    } else if (this.router.url.includes('/validate')) {
      this.validate = true;
    }
  }

  ngOnChanges() {
    this.ready = false;
    if (this.answers())
      this.editMode = true;
    const model = this.model();
    if (model) {
      this.currentChapter = model.sections[0];
      model.sections = model.sections.sort((a, b) => a.order - b.order);
      for (const section of model.sections) {
        for (const surveyAnswer in this.answers()?.answer) {
          if (section.id === this.answers().answer[surveyAnswer]?.chapterId) {
            // It matched an answer's chapter id, so it is set.
            this.markChapter(section.id!, false);
            this.sortedSurveyAnswers[section.id!] = this.answers().answer[surveyAnswer].answer;
            break;
          }
        }
      }
      for (let i = 0; i < model.sections.length; i++) {
        if (model.sections[i].subSections === null) {
          this.form.addControl(model.name, this.formControlService.toFormGroup(model.sections, true));
          break;
        }
        if (!model.sections[i].subType || model.sections[i].subType === this.subType()) {
          this.form.addControl(model.sections[i].name, this.formControlService.toFormGroup(model.sections[i].subSections, true));
        }
      }
      if (this.answers()?.answer) {
        for (let i = 0; i < model.sections.length; i++) {
          if (this.answers().answer[model.sections[i].name])
            this.prepareForm(this.answers().answer[model.sections[i].name], model.sections[i].subSections);
        }
        this.form.patchValue(this.answers().answer);
        this.form.markAllAsTouched();
      }
      if (this.answers()?.validated) {
        this.readonly = true;
        this.validate = false;
      } else if (this.validate) {
        UIkit.modal('#validation-modal').show();
      }
      if (this.readonly) {
        this.form.disable();
        this.form.markAsUntouched();
      }
      this.ready = true;

      const activeUsers = this.activeUsers();
      if (activeUsers && activeUsers.length > 0) {
        setTimeout(()=> {
          const users: string[] = [];
          activeUsers.forEach(user => {
            users.push(' '+user.fullname);
          });
          UIkit.tooltip('#concurrentEdit', {title: users.toString(), pos: 'bottom'});
        }, 0);
      }

    }
  }

  validateForm() {
    for (const chapterChangeMapElement of this.chapterChangeMap()) {
      if (chapterChangeMapElement[1]) {
        UIkit.modal('#validation-modal').hide();
        this.errorMessage.set('There are unsaved changes, please submit all changes first and then validate.');
        return;
      }
    }
    if (this.form.valid) {
      this.valid.emit(this.form.valid);
    } else {
      UIkit.modal('#validation-modal').hide();
      console.log('Invalid form');
      this.form.markAllAsTouched();
      let str = '';
      for (const key in this.form.value) {
        // console.log(this.form.get('extras.'+key));
        console.log(key + ': '+ this.form.get(key)!.valid);
        if (!this.form.get(key)!.valid) {
          str =  str + '\n\t-> ' + key;
        }
        for (const keyElement in this.form.get(key)!.value) {
          console.log(keyElement + ': '+ this.form.get(key+'.'+keyElement)!.valid);
        }
      }
      this.errorMessage.set('There are missing fields at chapters ' + str);
    }
  }

  parentSubmit() {
    // The group is named after the model's section: 'service' in the current form models, 'Service' in older ones.
    const service = this.form.value?.service ?? this.form.value?.Service;
    if (service) {
      for (let i = 0; i < service.persistentIdentitySystems?.length; i++) {
        if (!service.persistentIdentitySystems[i]?.persistentIdentityEntityType && !service.persistentIdentitySystems[i]?.persistentIdentityEntityTypeSchemes[i]) {
          service.persistentIdentitySystems[i] = null;
        }
      }
      for (let i = 0; i < service.researchProductLicensings?.length; i++) {
        if (!service.researchProductLicensings[i]?.researchProductLicenseName && !service.researchProductLicensings[i]?.researchProductLicenseURL) {
          service.researchProductLicensings[i] = null;
        }
      }
      if (!service.researchProductMetadataLicensing?.researchProductMetadataLicenseName && !service.researchProductMetadataLicensing?.researchProductMetadataLicenseURL) {
        service.researchProductMetadataLicensing = null;
      }
    }
    // console.log(this.form);
    this.submit.emit([this.form, this.editMode]);
  }

  onSubmit() { // FIXME
    // console.log('onSubmit');
    window.scrollTo(0, 0);
    // this.showLoader = true;
    // this.formControlService.postItem(this.surveyAnswers.id, this.form.get(this.chapterForSubmission.name).value, this.editMode).subscribe(
    const request = this.answers()?.id
      ? this.formControlService.postItem(this.answers().id, this.form.value, this.editMode)
      : this.formControlService.postGenericItem(this.loadedModel().resourceType, this.form.value, this.editMode);
    request.subscribe(
      res => {
        this.successMessage.set('Updated successfully!');
        this.chapterChangeMap.update(changes => new Map([...changes.keys()].map(key => [key, false])));
        UIkit.modal('#unsaved-changes-modal').hide();
        this.answers.set(res);
      },
      (error: HttpErrorResponse) => {
        this.errorMessage.set('Something went bad, server responded: ' + JSON.stringify(error?.error?.message));
        UIkit.modal('#unsaved-changes-modal').hide();
        // this.showLoader = false;
        // console.log(error);
      },
      () => {
        this.closeSuccessAlert();
        // this.showLoader = false;
      }
    );
  }

  showUnsavedChangesPrompt(chapter: Section) {
    if (this.readonly || this.freeView)
      return;
    // The chapter tabs only show once ngOnChanges has set the current chapter from the model.
    if (this.chapterChangeMap().get(this.currentChapter!.id!)) {
      this.chapterForSubmission = this.currentChapter;
      UIkit.modal('#unsaved-changes-modal').show();
    }
    this.currentChapter = chapter;
  }

  getFormGroup(sectionIndex: number): UntypedFormGroup {
    if (this.loadedModel().sections[sectionIndex].subSections === null) {
      return this.form.get(this.loadedModel().name) as UntypedFormGroup;
    } else
      // console.log(this.form.get(this.survey.sections[sectionIndex].name));
      return this.form.get(this.loadedModel().sections[sectionIndex].name) as UntypedFormGroup;
  }

  /** The chapter id, and the chapter whose changes were discarded, if any. */
  setChapterChangesMap(chapterId: (string | null)[]) {
    this.markChapter(chapterId[0]!, chapterId[1] === null);
  }

  private markChapter(id: string, changed: boolean) {
    this.chapterChangeMap.update(changes => new Map(changes).set(id, changed));
  }

  /** create additional fields for arrays if needed --> **/
  prepareForm(answer: object, fields: Section[], arrayIndex?: number) { // I don't think it will work with greater depth than 2 of array nesting
    for (const [key, value] of Object.entries(answer)) {
      if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
        this.prepareForm(value, fields);
      } else if (Array.isArray(value)) {
        if (value?.length > 1) {
          this.pushToFormArray(key, value.length, arrayIndex);
        }
        for (let i = 0 ;i < value?.length; i++) {
          if (typeof value[i] === 'object' && !Array.isArray(value[i]) && value[i] !== null) {
            this.prepareForm(value[i], fields, i);
          }
          // Maybe a check for array in array should be here
        }
      } else if (value === null) {
        // console.log(key+ ' is null');
      }
    }
  }

  pushToFormArray(name: string, length: number, arrayIndex?: number) {
    // Called for the names of answered fields, which the model defines.
    const field = this.getModelData(this.loadedModel().sections, name)!;
    // The form has a control for every field the model defines.
    while (this.getFormControl(this.form, name, arrayIndex)!.length < length) {
      this.getFormControl(this.form, name, arrayIndex)!.push(this.formControlService.createField(field));
    }
  }

  getModelData(model: Section[], name: string): Field | null {
    let field: Field | null = null;
    for (let i = 0; i < model.length; i++) {
      if (model[i].fields === null) {
        field = this.getModelData(model[i].subSections, name);
        if (field) {
          return field;
        }
      } else {
        field = this.searchSubFields(model[i].fields, name);
        if (field) {
          return field;
        }
      }
    }
    return field;
  }

  searchSubFields(fields: Field[], name: string): Field | null {
    let field: Field | null = null;
    for (let j = 0; j < fields.length; j++) {
      if(fields[j].name === name) {
        return fields[j];
      } else if ((fields[j].subFields?.length ?? 0) > 0) {
        field = this.searchSubFields(fields[j].subFields!, name);
        if (field?.name === name)
          return field;
      }
    }
    return null;
  }

  getFormControl(group: UntypedFormGroup | UntypedFormArray, name: string, position?: number): UntypedFormArray | null {
    // Callers ask for array fields; the control found under that name is returned as an array, as before.
    let abstractControl: AbstractControl | null = null;
    for (const key in group.controls) {
      // A form array's controls are indexed by position; for...in gives those positions as strings.
      abstractControl = (group.controls as Record<string, AbstractControl>)[key];
      if (abstractControl instanceof UntypedFormGroup || abstractControl instanceof UntypedFormArray) {
        if (key === name) {
          return abstractControl as UntypedFormArray;
        } else if (key !== name) {
          if (abstractControl instanceof UntypedFormArray) {
            if (position !== undefined && abstractControl.controls.length > position) {
              abstractControl = this.getFormControl(abstractControl.controls[position] as UntypedFormGroup | UntypedFormArray, name, position);
              if (abstractControl !== null)
                return abstractControl as UntypedFormArray;
            } else {
              abstractControl = null;
            }
          } else {
            abstractControl = this.getFormControl(abstractControl, name, position);
            if (abstractControl !== null)
              return abstractControl as UntypedFormArray;
          }
        }
      } else {
        if (key === name) {
          return abstractControl as UntypedFormArray;
        }
        abstractControl = null;
      }
    }
    return abstractControl as UntypedFormArray | null;
  }
  /** <-- create additional fields for arrays if needed **/

  /** Generate PDF --> **/
  generatePDF() {
    const docDefinition: DocDefinition = new DocDefinition();
    docDefinition.content.push(new Content(this.loadedModel().name, ['title']));
    if (this.loadedModel().notice)
      docDefinition.content.push({text: this.strip(this.loadedModel().notice), italics: true, alignment: 'justify'});
    docDefinition.info = new PdfMetadata(this.loadedModel().name);

    let description = 'none';
    if (this.loadedModel().name === 'Survey on National Contributions to EOSC 2022') {
      description = 'end';
    }
    this.createDocumentDefinition(this.form, docDefinition, description);

    pdfMake.createPdf(docDefinition).download(this.loadedModel().name);
  }

  documentDefinitionRecursion(fields: Field[], docDefinition: DocDefinition, description: string, descriptionAtEnd?: DocDefinition) {
    for (const field of fields) {
      if (field.label.text)
        docDefinition.content.push(new Content(field.label.text, ['mx_3']));
      if (field.form.description.text
        && !field.form.description.text.includes('Please add only new use cases as any use cases submitted in the previous survey will be imported here')
        && !field.form.description.text.includes('For example on curricula for data stewardship')
      ) {
        if (description === 'end') {
          // pdfmake renders an empty string as it rendered null or undefined here: nothing.
          let questionNumber = '';
          if (field.label.text) {
            questionNumber = field.label.text.split('. ')[0];
          }
          // let term = field.form.description.text.split('-')[0]
          const components = this.strip(field.form.description.text).split(' - ');
          const content: ContentText = {
            style: ['mt_3'],
            text: [
              questionNumber,
              ' ',
              {text: components.shift() ?? '', bold: true},
              ' - ',
              components.join('-')
            ]
          };
          // descriptionAtEnd.content.push(new Content(questionNumber + ' ' + components.shift() + '-' + components.join('-'), ['mt_3']));
          // Called with description 'end' only together with a descriptionAtEnd document.
          descriptionAtEnd!.content.push(content);
        }
        if (description === 'show')
          docDefinition.content.push(new Content(field.form.description.text, ['mt_3']));
      }
      const answerValues = this.findVal(this.answers()?.answer, field.name);
      if (field.typeInfo.type === 'radio') {
        const values = field.typeInfo.values;
        // if (field.kind === 'conceal-reveal')
        //   values = this.getModelData(this.loadedModel().sections, field.parent).typeInfo.values;
        for (const value of values) {
          const content = new Columns();
          if (value === answerValues?.[0]){
            content.columns.push(new PdfImage('radioChecked', 10, 10, ['marginTopCheckBox']));
          }
          else {
            content.columns.push(new PdfImage('radioUnchecked', 10, 10, ['marginTopCheckBox']));
          }
          content.columns.push(new Content(value,['ms_1', 'mt_1']));
          docDefinition.content.push(content);
        }
      } else if (field.typeInfo.type === 'checkbox') {
        docDefinition.content.pop();
        const content = new Columns(['mx_1']);
        if (answerValues?.[0]) {
          content.columns.push(new PdfImage('checked', 10, 10, ['mt_1']));
        } else {
          content.columns.push(new PdfImage('unchecked', 10, 10, ['mt_1']));
        }
        content.columns.push(new Content(field.label.text,['ms_1']));
        docDefinition.content.push(content);
      } else if (field.typeInfo.type === 'largeText' || field.typeInfo.type === 'richText') {
        if (answerValues?.[0]) {
          docDefinition.content.push(new PdfTable(new TableDefinition([[this.strip(answerValues[0] as string)]], ['*']), ['mt_1']));
        } else {
          docDefinition.content.push(new PdfTable(new TableDefinition([['']],['*'], [48]), ['mt_1']));
        }
      } else if (field.typeInfo.type !== 'composite') {
        if (answerValues?.[0]) {
          // The answer as the form holds it, passed to pdfmake unchanged; text and numbers render as they are.
          docDefinition.content.push(new PdfTable(new TableDefinition([[answerValues[0] as TableCell]], ['*']), ['mt_1']));
        } else if (field.form.placeholder) {
          docDefinition.content.push(new PdfTable(new TableDefinition([[{text: field.form.placeholder, color: 'gray'}]],['*']), ['mt_1']));
        } else {
          docDefinition.content.push(new PdfTable(new TableDefinition([['']],['*'], [16]), ['mt_1']));
        }
      }
      if (field.subFields)
        this.documentDefinitionRecursion(field.subFields, docDefinition, description, descriptionAtEnd);
    }
  }

  createDocumentDefinition(group: UntypedFormGroup | UntypedFormArray, docDefinition: DocDefinition, description: string) {
    const descriptionsAtEnd = new DocDefinition();

    if (this.loadedModel().name === 'Survey on National Contributions to EOSC 2022') {
      docDefinition.content.push(new Content('Definitions of key terms can be found in Appendix A', ['mt_3']));
    }

    this.loadedModel().sections.sort((a, b) => a.order - b.order);
    for (const section of this.loadedModel().sections) {
      section.subSections.sort((a, b) => a.order - b.order);
      if (this.loadedModel().sections.length > 1) {
        docDefinition.content.push(new Content(section.name, ['chapterHeader']));
      }

      for (const subSection of section.subSections) {
        if (section.subSections.length > 1) {
          docDefinition.content.push(new Content(subSection.name, ['tabHeader']));
        }
        if (subSection.fields)
          this.documentDefinitionRecursion(subSection.fields, docDefinition, description, descriptionsAtEnd);
      }

    }

    if (this.loadedModel().name === 'Survey on National Contributions to EOSC 2022') {

      docDefinition.content.push(new Content('Appendix A', ['title']));
      docDefinition.content.push(...descriptionsAtEnd.content);

      docDefinition.content.push(new Content('Appendix B', ['title']));
      const content: PdfContent[] = [
        {
          style: ['mt_3'],
          text: ['Visit the ',
            {text: 'EOSC Observatory', link: 'https://eoscobservatory.eosc-portal.eu', color: 'cornflowerblue', decoration: 'underline'},
            ' to explore the data from the first EOSC Steering Board survey on National Contributions to EOSC 2021 and visit the ',
            {text: 'EOSC Observatory Zenodo Community', link: 'https://zenodo.org/communities/eoscobservatory', color: 'cornflowerblue', decoration: 'underline'},
            ' to access all relevant documents for the surveys and EOSC Observatory.']
        }
      ];
      docDefinition.content.push(content);
    }

    return;

  }

  /** Every value of key at the shallowest depth where it appears in obj, breadth first; null if none. */
  findVal(obj: unknown, key: string): unknown[] | null {
    if (!obj)
      return null;
    const seen = new Set(); let active: object[] = [obj as object];
    while (active.length) {
      const new_active: object[] = []; const found: unknown[] = [];
      for (let i=0; i<active.length; i++) {
        Object.keys(active[i]).forEach(function(k){
          const x = (active[i] as Record<string, unknown>)[k];
          if (k === key) {
            found.push(x);
          } else if (x && typeof x === 'object' &&
            !seen.has(x)) {
            seen.add(x);
            new_active.push(x);
          }
        });
      }
      if (found.length) return found;
      active = new_active;
    }
    return null;
  }

  strip(html: string): string {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  }

  /** <-- Generate PDF **/

  /** other stuff --> **/
  closeError() {
    UIkit.alert('#errorAlert').close();
    setTimeout(() => {
      this.errorMessage.set('');
    }, 550);
  }

  closeSuccessAlert() {
    setTimeout(() => {
      UIkit.alert('#successAlert').close();
    }, 4000);
    setTimeout(() => {
      this.successMessage.set('');
    }, 4550);
  }

  getInitials(fullName: string) {
    return fullName.split(' ').map((n)=>n[0]).join('');
  }

  actionIcon(action: string) {
    switch (action) {
      case 'view':
        return 'visibility';
      case 'validate':
        return 'task_alt';
      case 'edit':
        return 'edit';
      default:
        return '';
    }
  }

  actionTooltip(action: string) {
    switch (action) {
      case 'view':
        return 'viewing';
      case 'validate':
        return 'validating';
      case 'edit':
        return 'editing';
      default:
        return '';
    }
  }

  getRandomDarkColor(sessionId: string) { // (use for background with white/light font color)
    const rng = seedRandom(sessionId);
    const h = Math.floor(rng() * 360);
      const s = Math.floor(rng() * 100) + '%';
      // max value of l is 100, but set it to 55 in order to generate dark colors
      const l = Math.floor(rng() * 55) + '%';

    return `hsl(${h},${s},${l})`;
  }

}
