import {ChangeDetectionStrategy, Component, computed, inject, signal, Signal} from '@angular/core';
import {Router, RouterLink, ROUTER_OUTLET_DATA} from '@angular/router';
import {URL} from '../../../../entities/eic-model';
import uikit from 'uikit';
import {ServiceLandingData} from '../service-landing-data';

@Component({
  selector: 'app-service-landing-page',
  templateUrl: 'overview.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink]
})
export class OverviewComponent {
  private router = inject(Router);
  private data = inject(ROUTER_OUTLET_DATA) as Signal<ServiceLandingData | null>;

  readonly payload = computed(() => this.data()?.service ?? null);
  readonly vocabularyMap = computed(() => this.data()?.vocabularies ?? null);
  readonly related = computed(() => this.data()?.relatedServices ?? null);

  /** The use case each slideshow shows, for its dot navigation. */
  readonly slide = signal(0);
  readonly slideMobile = signal(0);

  getVocabularyName(vocabularyType: string, id: string): string | undefined {
    return this.vocabularyMap()?.[vocabularyType].find(vocabulary => vocabulary.id === id)?.name;
  }

  /** On UIkit's beforeitemshow; reads the first slideshow on the page, as before. */
  dragSlide() {
    this.slide.set(currentSlide());
  }

  dragSlideMobile() {
    this.slideMobile.set(currentSlide());
  }

  showSlide(id: string, index: number) {
    uikit.slideshow('#' + id).show(index);
    this.slide.set(index);
  }

  showSlideMobile(id: string, index: number) {
    uikit.slideshow('#' + id).show(index);
    this.slideMobile.set(index);
  }

  reloadOnSamePage(url: string) {
    this.router.navigateByUrl('/', {skipLocationChange: true}).then(() => {
      this.router.navigate([url]);
    });
  }

  goto(url: string | URL) {
    window.open(url.toString(), '_blank');
  }
}

function currentSlide(): number {
  return uikit.getComponent(document.querySelector('[uk-slideshow]'), 'slideshow').index;
}
