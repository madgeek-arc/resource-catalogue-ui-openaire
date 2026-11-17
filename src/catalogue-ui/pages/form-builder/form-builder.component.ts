import {Component, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {Section} from '../../domain/dynamic-form-model';
import { SideMenuComponent } from './side-menu/side-menu.component';
import { ChapterBuilderComponent } from './chapter-builder/chapter-builder.component';
import { NgClass, JsonPipe } from '@angular/common';
import { SectionBuilderComponent } from './section-builder/section-builder.component';
import { FieldBuilderComponent } from './field-builder/field-builder.component';

@Component({
    selector: 'app-form-builder',
    templateUrl: 'form-builder.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [SideMenuComponent, ChapterBuilderComponent, NgClass, SectionBuilderComponent, FieldBuilderComponent, JsonPipe]
})

export class FormBuilderComponent implements OnInit {

  formBuilder: Section[] = [];
  show = 'chapter';

  ngOnInit() {
    // this.formBuilder.push();
  }

  updateView(show: string) {
    this.show = show;
  }

}
