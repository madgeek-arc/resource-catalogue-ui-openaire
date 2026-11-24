import { Component, OnChanges, ChangeDetectionStrategy, computed, inject, input, output, signal } from '@angular/core';
import {FormControlService} from '../../services/form-control.service';
import {ActivatedRoute, Router} from '@angular/router';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, ReactiveFormsModule } from '@angular/forms';
import {Section, Field, HandleBitSet, VocabularyLookup} from '../../domain/dynamic-form-model';
import {Tab, Tabs} from '../../domain/tabs';
import BitSet from 'bitset';

import { DynamicFormFieldsComponent } from './fields/dynamic-form-fields.component';

@Component({
    selector: 'app-chapter-edit',
    templateUrl: './chapter.component.html',
    providers: [FormControlService],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ReactiveFormsModule, DynamicFormFieldsComponent]
})
export class ChapterEditComponent implements OnChanges{
  route = inject(ActivatedRoute);
  protected fb = inject(UntypedFormBuilder);
  protected router = inject(Router);


  readonly form = input.required<UntypedFormGroup>();
  readonly tabsHeader = input<string | null>(null);
  readonly mandatoryFieldsText = input<string | null>(null);
  readonly readonly = input<boolean | null>(null);
  readonly validate = input<boolean | null>(null);
  readonly vocabularies = input<VocabularyLookup | null>(null);
  readonly subVocabularies = input<VocabularyLookup | null>(null);
  readonly chapter = input.required<Section>();
  readonly fields = input.required<Section[]>();

  /** The chapter id, and the chapter whose changes were discarded, if any. */
  readonly chapterHasChanges = output<(string | null)[]>();
  readonly submit = output();

  /** The Submit button sits in the title bar, outside the form, and joins it by this id. */
  readonly formId = computed(() => 'chapter-form-' + this.chapter().id);

  editMode = true;

  bitset: Tabs = new Tabs();
  errorMessage = '';
  successMessage = '';
  ready = false;
  showLoader = false;
  hasChanges = false;
  pendingService = false;

  showBitsets = false;
  loaderBitSet = new BitSet();
  loaderPercentage = 0;
  readonly tabIndex = signal(0);

  isEdit = false;
  isService = false;
  isDatasource = false;
  datasourceId = '';

  ngOnInit() {
    // A routed component always has its route config, and these routes all have a path.
    const path = this.route.snapshot.routeConfig!.path!;
    if (path.includes('/edit/')) {
      this.isEdit = true;
    }
    if (path.includes('service/')) {
      this.isService = true;
    }
    if (path.includes('subprofile/')) {
      this.isDatasource = true;
    }
    if (path.includes(':datasourceId')) {
      this.datasourceId = this.route.snapshot.paramMap.get('datasourceId')!;
    }
  }

  ngOnChanges() {
    if (this.fields()) {
      this.initializations();
      this.ready = true;
    }
  }

  onSubmit(event: Event) {
    // This component's and the survey's outputs are named submit too, so Angular also binds `(submit)` on their hosts
    // to the DOM event: left to bubble, it would run those handlers a second time, with the event as their value.
    event.stopPropagation();
    // if (this.form().valid) {
    window.scrollTo(0, 0);
    this.submit.emit();
  }

  initializations() {
    /** Initialize tab bitsets **/
    let requiredTabs = 0; let requiredTotal = 0;
    const obj = new Map();
    this.fields().forEach(group => {
      const tab = new Tab();
      tab.requiredOnTab = tab.remainingOnTab = group.required.topLevel;
      tab.valid = false;
      tab.order = group.order;
      // obj[group.group.id] = tab;
      obj.set(group.id, tab);
      if (group.required.topLevel > 0) {
        requiredTabs++;
      }
      requiredTotal += group.required.total;
    });
    this.bitset.tabs = obj;
    this.bitset.completedTabs = 0;
    this.bitset.completedTabsBitSet = new BitSet();
    this.bitset.requiredTabs = requiredTabs;
    this.bitset.requiredTotal = requiredTotal;
  }

  /** Bitsets-->**/
  timeOut(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  handleBitSetOfComposite(data: HandleBitSet) {
    const field = data.field;
    const pos = data.position;
    // Only composite fields report here, and they have sub-fields.
    const subFields = field.subFields!;
    // console.log(field.name);

    if (field.typeInfo.multiplicity) {
      const formArray = this.form().get(field.accessPath) as UntypedFormArray;
      let flag = false;
      for (let i = 0; i < formArray.length; i++) {
        if (formArray.controls[i].valid) {
          flag = true;
          subFields.forEach(f => {
            if (f.form.mandatory)
              this.loaderBitSet.set(parseInt(f.id), 1);
          });
          this.decreaseRemainingFieldsPerTab(field.form.group, field.form.display.order);
          break;
        }
      }
      if (!flag) {
        // console.log('didn't find valid array field')
        const found = new Array(subFields.length);
        for (let j = 0; j < subFields.length; j++) {
          for (let i = 0; i < formArray.length; i++) {
            if (subFields[j].form.mandatory && formArray.controls[i].get(subFields[j].name)!.valid) {
              found[j] = true;
              break;
            }
          }
        }
        for (let i = 0; i < found.length; i++) {
          if (!found[i]) {
            this.loaderBitSet.set(parseInt(subFields[i].id), 0);
          } else {
            this.loaderBitSet.set(parseInt(subFields[i].id), 1);
          }
        }
        this.increaseRemainingFieldsPerTab(field.form.group, field.form.display.order);
      }
    } else if (subFields[pos].form.mandatory) {
      if (this.form().get(subFields[pos].accessPath)!.valid) {
        this.loaderBitSet.set(parseInt(subFields[pos].id), 1);
        if (this.form().get(field.accessPath)!.valid) {
          this.decreaseRemainingFieldsPerTab(field.form.group, field.form.display.order);
        } else {
          this.increaseRemainingFieldsPerTab(field.form.group, field.form.display.order);
        }
      } else {
        this.loaderBitSet.set(parseInt(subFields[pos].id), 0);
        if (this.form().get(field.accessPath)!.valid) {
          this.decreaseRemainingFieldsPerTab(field.form.group, field.form.display.order);
        } else {
          this.increaseRemainingFieldsPerTab(field.form.group, field.form.display.order);
        }
      }
    }
    this.updateLoaderPercentage();
  }

  // Every field's accessPath names a control: toFormGroup built the form from these same fields.
  handleBitSet(data: Field) {
    // console.log(data.name);
    if (data.typeInfo.multiplicity) {
      this.handleBitSetOfGroup(data);
      return;
    }
    // console.log(this.form().get(data.accessPath)!.valid);
    if (this.form().get(data.accessPath)!.valid) {
      this.decreaseRemainingFieldsPerTab(data.form.group, data.form.display.order);
      this.loaderBitSet.set(parseInt(data.id), 1);
    } else if (this.form().get(data.accessPath)!.invalid) {
      this.increaseRemainingFieldsPerTab(data.form.group, data.form.display.order);
      this.loaderBitSet.set(parseInt(data.id), 0);
    } else if (this.form().get(data.accessPath)!.pending) {
      this.timeOut(300).then(() => this.handleBitSet(data));
      return;
    }
    this.updateLoaderPercentage();
  }

  handleBitSetOfGroup(data: Field) {
    const formArray = this.form().get(data.accessPath) as UntypedFormArray;
    let flag = false;
    for (let i = 0; i < formArray.length; i++) {
      if (formArray.controls[i].valid) {
        flag = true;
        this.decreaseRemainingFieldsPerTab(data.form.group, data.form.display.order);
        this.loaderBitSet.set(parseInt(data.id), 1);
        break;
      } else if (formArray.controls[i].pending) {
        this.timeOut(300).then(() => this.handleBitSetOfGroup(data));
        return;
      }
    }
    if (!flag) {
      this.increaseRemainingFieldsPerTab(data.form.group, data.form.display.order);
      this.loaderBitSet.set(parseInt(data.id), 0);
    }
    this.updateLoaderPercentage();
  }

  updateLoaderPercentage() {
    // console.log(this.loaderBitSet.toString(2));
    // console.log('cardinality: ', this.loaderBitSet.cardinality());
    this.loaderPercentage = Math.round((this.loaderBitSet.cardinality() / this.bitset.requiredTotal) * 100);
    // console.log(this.loaderPercentage, '%');
  }

  decreaseRemainingFieldsPerTab(tabId: string, bitIndex: number) {
    this.bitset.tabs.get(tabId)!.bitSet.set(bitIndex, 1);
    this.bitset.tabs.get(tabId)!.remainingOnTab = this.bitset.tabs.get(tabId)!.requiredOnTab - this.bitset.tabs.get(tabId)!.bitSet.cardinality();
    if (this.bitset.tabs.get(tabId)!.remainingOnTab === 0 && this.bitset.completedTabsBitSet.get(this.bitset.tabs.get(tabId)!.order) !== 1) {
      this.calcCompletedTabs(tabId, 1);
    }
  }

  increaseRemainingFieldsPerTab(tabId: string, bitIndex: number) {
    this.bitset.tabs.get(tabId)!.bitSet.set(bitIndex, 0);
    this.bitset.tabs.get(tabId)!.remainingOnTab = this.bitset.tabs.get(tabId)!.requiredOnTab - this.bitset.tabs.get(tabId)!.bitSet.cardinality();
    if (this.bitset.completedTabsBitSet.get(this.bitset.tabs.get(tabId)!.order) !== 0) {
      this.calcCompletedTabs(tabId, 0);
    }
  }

  calcCompletedTabs(tabId: string, setValue: number) {
    if (tabId && this.bitset.tabs.get(tabId)!.order) {
      this.bitset.completedTabsBitSet.set(this.bitset.tabs.get(tabId)!.order, setValue);
      this.bitset.completedTabs = this.bitset.completedTabsBitSet.cardinality();
    }
  }

  /** <--Bitsets**/

  /** tab prev next buttons **/
  setTabIndex(i: number) {
    this.tabIndex.set(i);
  }

  goToTab(i: number) {
    if (i === -1 || i === this.bitset.tabs.size) {
      return;
    }
    this.tabIndex.set(i);
    const element: HTMLElement = document.getElementById(this.chapter().id + '-tab' + i) as HTMLElement;
    element.click();
    // console.log(element)
  }

  /** emit changes-->**/
  unsavedChangesPrompt(e: boolean, removeChanges: string | null = null){
    if (e) {
      this.chapterHasChanges.emit([this.chapter().id, removeChanges]);
    }
  }
  /** <--emit changes**/

}
