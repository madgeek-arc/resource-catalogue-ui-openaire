import { Component, Input, ChangeDetectionStrategy, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {UiVocabulary} from '../../../../entities/dynamic-form-model';
import {Service, URL} from '../../../../entities/eic-model';
import * as uikit from 'uikit';
import { NgClass } from '@angular/common';


@Component({
    selector: 'app-service-landing-page',
    templateUrl: 'overview.component.html',
    // styleUrls: ['../../landing-page.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [NgClass, RouterLink]
})
export class OverviewComponent {
  private router = inject(Router);


  // Set by ServiceLandingPageComponent when the router outlet activates this page, not bound in a template,
  // so it stays a plain field (a signal input would be overwritten by that assignment).
  vocabularies: Map<string, UiVocabulary[]>;
  @Input() relatedServices: Service[] = null;
  @Input() resourcePayload: Service = null;


  slide = 0;
  benefitSlide = 0;

  slideMobile = 0;
  benefitSlideMobile = 0;

  getVocabularyName(vocabularyType: string, id: string): string {
    // console.log(this.vocabularies);
    for (const vocabulary of this.vocabularies[vocabularyType]) {
      if (vocabulary.id === id)
        return vocabulary.name;
    }
  }

  dragSlide(id: string) {
    if (id === 'slideShow') {
      this.slide = uikit.getComponent(document.querySelector('[uk-slideshow]'), 'slideshow').index;
    } else {
      this.benefitSlide = uikit.getComponent(document.querySelector('[uk-slideshow]'), 'slideshow').index;
    }
  }

  showSlide(id: string, index: number) {
    uikit.slideshow('#' + id).show(index);
    // console.log(UIkit.getComponent(document.querySelector('[uk-slideshow]'), 'slideshow').index);
    if (id === 'slideShow') {
      this.slide = index;
    } else {
      this.benefitSlide = index;
    }
  }

  dragSlideMobile(id: string) {
    if (id === 'slideShowMobile') {
      this.slideMobile = uikit.getComponent(document.querySelector('[uk-slideshow]'), 'slideshow').index;
    } else {
      this.benefitSlideMobile = uikit.getComponent(document.querySelector('[uk-slideshow]'), 'slideshow').index;
    }
  }

  showSlideMobile(id: string, index: number) {
    uikit.slideshow('#' + id).show(index);
    // console.log(UIkit.getComponent(document.querySelector('[uk-slideshow]'), 'slideshow').index);
    if (id === 'slideShowMobile') {
      this.slideMobile = index;
    } else {
      this.benefitSlideMobile = index;
    }

  }

  reloadOnSamePage(url: string) {
    this.router.navigateByUrl('/', {skipLocationChange: true}).then( () => {
      this.router.navigate([url]);
    });
  }

  goto(url: string | URL) {
    window.open(url.toString(), '_blank');
  }

}
