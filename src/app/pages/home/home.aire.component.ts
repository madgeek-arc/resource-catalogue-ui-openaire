import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {Observable, of} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {RouterLink} from '@angular/router';
import {SlicePipe} from '@angular/common';
import {ResourceService} from '../../services/resource.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.aire.component.html',
  styleUrls: ['./home.aire.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, SlicePipe]
})
export class HomeAireComponent {
  private resourceService = inject(ResourceService);

  readonly categories: Category[] = [
    {
      value: 'Authentication and authorization infrastructure',
      icon: 'fingerprint_scanning_authorization.svg',
      hover: 'fingerprint_scanning_authorization_hover.svg'
    },
    {value: 'Compute', icon: 'cloud_server.svg', hover: 'cloud_server_hover.svg'},
    {value: 'Connectivity', icon: 'connectivity.svg', hover: 'connectivity_hover.svg'},
    {value: 'Consulting', icon: 'consulting.svg', hover: 'consulting_hover.svg'},
    {value: 'Operations', icon: 'keyword.svg', hover: 'keyword_hover.svg'},
    {value: 'Content delivery', icon: 'data-connectivity.svg', hover: 'data-connectivity_hover.svg'},
    {value: 'Data discovery', icon: 'keyword.svg', hover: 'keyword_hover.svg'},
    {value: 'Data movement', icon: 'database.svg', hover: 'database_hover.svg'},
    {value: 'Data registration', icon: 'cloud_server.svg', hover: 'cloud_server_hover.svg'},
    {value: 'Data storage', icon: 'database_security.svg', hover: 'database_security_hover.svg'}
  ];

  readonly portfolioList = toSignal(orNull(this.resourceService.getNewVocabulariesByType('Portfolios')), {initialValue: null});
  readonly userList = toSignal(orNull(this.resourceService.getNewVocabulariesByType('Users')), {initialValue: null});
  readonly resourceMap = toSignal(orNull(this.resourceService.getResourcesGroupedByField('portfolios')), {initialValue: null});

  /** The user type each slideshow shows, for its dot navigation. */
  readonly slide = signal(0);
  readonly slideMobile = signal(0);

  /** On UIkit's beforeitemshow; reads the first slideshow on the page, as before. */
  dragSlide() {
    this.slide.set(currentSlide());
  }

  showSlide(index: number) {
    UIkit.slideshow('#slideShow').show(index);
    this.slide.set(index);
  }

  dragSlideMobile() {
    this.slideMobile.set(currentSlide());
  }

  showSlideMobile(index: number) {
    UIkit.slideshow('#slideShowMobile').show(index);
    this.slideMobile.set(index);
  }
}

/** A failed load leaves its section hidden, as before. */
function orNull<T>(source: Observable<T>): Observable<T | null> {
  return source.pipe(catchError(error => {
    console.error(error);
    return of(null);
  }));
}

function currentSlide(): number {
  return UIkit.getComponent(document.querySelector('[uk-slideshow]'), 'slideshow').index;
}

interface Category {
  value: string;
  icon: string;
  hover: string;
}

