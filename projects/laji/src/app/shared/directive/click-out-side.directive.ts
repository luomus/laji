import { fromEvent as observableFromEvent, Subscription } from 'rxjs';
import { Directive, ElementRef, EventEmitter, Inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { WINDOW } from '@ng-toolkit/universal';
import { PlatformService } from '../service/platform.service';

@Directive({
  selector: '[lajiClickOutSide]'
})
export class ClickOutSideDirective implements OnInit, OnDestroy {

  private sub: Subscription;
  private init = true;

  @Input() clickOutSideActive = true;
  @Output() lajiClickOutSide = new EventEmitter<MouseEvent>();

  constructor(
    @Inject(WINDOW) private window: Window,
    private platformService: PlatformService,
    private _elementRef: ElementRef
  ) { }

  ngOnInit() {
    if (!this.platformService.isBrowser) {
      return;
    }
    this.init = false;
    this.sub = observableFromEvent(this.window.document, 'click').subscribe((e: MouseEvent) => {
      if (!this.init || !this.clickOutSideActive) {
        this.init = true;
        return;
      }
      if (!e.target) {
        return;
      }
      if (!this._elementRef.nativeElement.contains(e.target)) {
        e.stopPropagation();
        e.preventDefault();
        this.lajiClickOutSide.emit(e);
      }
    });

  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

}
