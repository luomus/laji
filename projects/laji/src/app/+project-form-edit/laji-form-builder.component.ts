//import LajiFormBuilder from '../../../../laji-form-builder.js/lib/app';
import LajiFormBuilder from 'laji-form-builder';
import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, Input, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
@Component({
  selector: 'laji-form-builder',
  template: `<div #lajiFormBuilder></div>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LajiFormBuilderComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() id: string;

  @ViewChild('lajiFormBuilder', { static: true }) lajiFormBuilderRoot: ElementRef;

  constructor(
    private ngZone: NgZone,
  ) {
  }
  ngOnInit(): void {
    console.log('INIT');
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
      new LajiFormBuilder({
        id: this.id,
        rootElem: this.lajiFormBuilderRoot.nativeElement
      });
    });
  }
  private unmount() {
    //TODO NOOP
  }
}
