/**
 * Created by stefania on 4/6/17.
 */
import { AfterContentInit, AfterViewInit, Component, ElementRef, OnChanges, SimpleChanges, ChangeDetectionStrategy, inject, input, signal, viewChild } from '@angular/core';

@Component({
    selector: 'read-more',
    template: `
    <div [class.collapsed]="isCollapsed()" [style.height]="isCollapsed() ? maxHeight()+'px' : 'auto'" #readMoreDiv>
      <ng-content />
    </div>
    @if (isCollapsable()) {
      <a (click)="isCollapsed.set(!isCollapsed())">View {{isCollapsed() ? 'more' : 'less'}}...</a>
    }
    `,
    styles: [`
    div.collapsed {
      overflow: hidden;
    }
  `],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReadMoreComponent implements AfterContentInit {
  elementRef = inject(ElementRef);

  //the text that need to be put in the container
  //@Input() text: string;
  //maximum height of the container
  readonly maxHeight = input(100);
  readonly readMoreDiv = viewChild.required<ElementRef<HTMLElement>>('readMoreDiv');
  //set these to false to get the height of the expended container
  readonly isCollapsed = signal(false);
  readonly isCollapsable = signal(false);

  ngAfterContentInit() {
    setTimeout(_ => {
      const currentHeight = this.readMoreDiv().nativeElement.offsetHeight;
      //collapsable only if the contents make container exceed the max height
      if (currentHeight > this.maxHeight() || currentHeight === 0) {
        this.isCollapsed.set(true);
        this.isCollapsable.set(true);
      } else {
      }
    }, 200);
  }
}

@Component({
    selector: 'read-more-text',
    template: `
    <div [innerHTML]="text()" [class.collapsed]="isCollapsed()" [style.height]="isCollapsed() ? maxHeight()+'px' : 'auto'"
      #readMoreDiv>
      <!--{{text}}-->
    </div>
    @if (isCollapsable()) {
      <a (click)="isCollapsed.set(!isCollapsed())">View {{isCollapsed() ? 'more' : 'less'}}...</a>
    }
    `,
    // The application builder never exits after a build when two components in one file have identical inline
    // styles (its stylesheet bundler creates two esbuild contexts and disposes one), so this copy carries a CSS
    // comment to keep the two texts different.
    styles: [`
    /* read-more-text */
    div.collapsed {
      overflow: hidden;
    }
  `],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReadMoreTextComponent extends ReadMoreComponent implements OnChanges, AfterViewInit {

  readonly text = input('');

  ngAfterViewInit(): void {
    this.ngAfterContentInit();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.ngAfterContentInit();
  }
}

