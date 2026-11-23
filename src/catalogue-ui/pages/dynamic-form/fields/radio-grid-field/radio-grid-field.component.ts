import { Component, OnInit, ChangeDetectionStrategy, inject, input, signal } from '@angular/core';
import {Field} from '../../../../domain/dynamic-form-model';
import { UntypedFormGroup, FormGroupDirective, ReactiveFormsModule } from '@angular/forms';

@Component({
    selector: 'app-radio-grid',
    templateUrl: './radio-grid-field.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ReactiveFormsModule]
})

export class RadioGridFieldComponent implements OnInit {
  private rootFormGroup = inject(FormGroupDirective);

  readonly fieldData = input.required<Field>();

  form!: UntypedFormGroup;
  readonly hideField = signal<boolean | null>(null);

  ngOnInit() {
    this.form = this.rootFormGroup.control;
    // console.log(this.form)
  }
}
