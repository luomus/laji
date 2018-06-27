
import {fromEvent as observableFromEvent,  Subscription ,  Observable } from 'rxjs';
import {
  Directive, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output
} from '@angular/core';
import { WindowRef } from '../windows-ref';

@Directive({
  selector: '[lajiClickOutSide]'
})
export class ClickOutSideDirective implements OnInit, OnDestroy {

  private sub: Subscription;
  private init = true;

  @Input() clickOutSideActive = true;
  @Output() lajiClickOutSide = new EventEmitter<MouseEvent>();

  constructor(
    private _elementRef: ElementRef,
    private _windowRef: WindowRef
  ) { }

  ngOnInit() {
    this.init = false;
    this.sub = observableFromEvent(this._windowRef.nativeWindow.document, 'click').subscribe((e: MouseEvent) => {
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
