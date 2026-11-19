import { Component, OnInit, ChangeDetectionStrategy, inject, input } from '@angular/core';
import {Field} from '../../../../domain/dynamic-form-model';
import { UntypedFormGroup, FormGroupDirective, ReactiveFormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';

@Component({
    selector: 'app-radio-grid',
    templateUrl: './radio-grid-field.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [ReactiveFormsModule, NgClass]
})

export class RadioGridFieldComponent implements OnInit {
  private rootFormGroup = inject(FormGroupDirective);

  readonly fieldData = input<Field>(undefined);

  form!: UntypedFormGroup;
  hideField: boolean = null;

  ngOnInit() {
    this.form = this.rootFormGroup.control;
    // console.log(this.form)
  }
}
