import {Component, Input, OnChanges, OnInit, SimpleChanges, ChangeDetectionStrategy, input} from '@angular/core';
import { UntypedFormGroup, ReactiveFormsModule } from '@angular/forms';
import {Section, Tab} from '../../../../domain/dynamic-form-model';
import BitSet from 'bitset';
import { NgStyle, NgClass, DatePipe } from '@angular/common';
import { DynamicFormFieldsComponent } from '../../fields/dynamic-form-fields.component';

@Component({
    selector: 'app-chapter-compare',
    templateUrl: 'compare-chapter.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [NgStyle, NgClass, ReactiveFormsModule, DynamicFormFieldsComponent, DatePipe]
})

export class CompareChapterComponent implements OnChanges {

  @Input() formA: UntypedFormGroup = null;
  @Input() formB: UntypedFormGroup = null;
  readonly entryA = input<any>(null);
  @Input() entryB: any = null;
  @Input() tabsHeader: string;
  @Input() chapter: Section = null;
  @Input() fields: Section[] = null;
  readonly vocabularies = input<Map<string, object[]>>(null);
  readonly subVocabularies = input<Map<string, object[]>>(null);

  ready = false;

  tabIndex= 0;

  ngOnChanges(changes: SimpleChanges) {
    if (this.fields) {
      this.ready = true;
    }
  }


  /** tab prev next buttons **/
  setTabIndex(i: number) {
    this.tabIndex = i;
  }

  goToTab(i: number) {
    if (i === -1 || i === this.fields?.length) {
      return;
    }
    this.tabIndex = i;
    const element: HTMLElement = document.getElementById(this.chapter.id + '-tab' + i) as HTMLElement;
    element.click();
    // console.log(element)
  }
}
