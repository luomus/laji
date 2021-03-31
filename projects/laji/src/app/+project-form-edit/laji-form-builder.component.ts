import LajiFormBuilder from 'laji-form-builder';
import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, Input, NgZone, OnDestroy, ViewChild } from '@angular/core';

@Component({
  selector: 'laji-form-builder',
  template: `<div #lajiFormBuilder></div>`,
  styleUrls: ['./laji-form-builder.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LajiFormBuilderComponent implements AfterViewInit, OnDestroy {
  @Input() id: string;

  @ViewChild('lajiFormBuilder', { static: true }) lajiFormBuilderRoot: ElementRef;

  private lajiFormBuilder: LajiFormBuilder;

  constructor(
    private ngZone: NgZone,
  ) {
  }

  ngAfterViewInit() {
    this.mount();
  }

  ngOnDestroy() {
    this.unmount();
  }

  private mount() {
    console.log('mount builder', this.id);
    this.ngZone.runOutsideAngular(() => {
      this.lajiFormBuilder = new LajiFormBuilder({
        id: this.id,
        rootElem: this.lajiFormBuilderRoot.nativeElement
      });
    });
  }

  private unmount() {
    this.lajiFormBuilder.destroy();
  }
}
