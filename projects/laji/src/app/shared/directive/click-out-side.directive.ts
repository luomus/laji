import { fromEvent as observableFromEvent, Observable, Subscription } from 'rxjs';
import { Directive, ElementRef, EventEmitter, Input, NgZone, OnDestroy, OnInit, Output } from '@angular/core';
import { PlatformService } from '../../root/platform.service';

@Directive({
  selector: '[lajiClickOutSide]'
})
export class ClickOutSideDirective implements OnInit, OnDestroy {

  private sub?: Subscription;

  @Input() clickOutSideActive = true;
  @Output() lajiClickOutSide = new EventEmitter<MouseEvent>();

  constructor(
    private platformService: PlatformService,
    private _elementRef: ElementRef,
    private ngZone: NgZone
  ) { }

  ngOnInit() {
    if (!this.platformService.isBrowser) {
      return;
    }
    this.ngZone.runOutsideAngular(() => {
      const initTime = new Date().getTime();
      this.sub = (observableFromEvent(this.platformService.window.document, 'click') as Observable<MouseEvent>).subscribe((e: MouseEvent) => {
        const clickTime = new Date().getTime();
        if (!this.clickOutSideActive || !e.target || (clickTime - initTime) < 300) {
          return;
        }
        if (!this._elementRef.nativeElement.contains(e.target)) {
          e.stopPropagation();
          e.preventDefault();
          this.ngZone.run(() => this.lajiClickOutSide.emit(e));
        }
      });
    });
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

}
