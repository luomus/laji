import { Component, Input, Renderer2, OnDestroy, ChangeDetectorRef, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { trigger, state, style, transition, animate, group, query, animateChild } from '@angular/animations';

const mobileBreakpoint = 450;

@Component({
  selector: 'lu-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  animations: [
    trigger('sidebarOpen', [
      state('closed', style({
        'width': '50px'
      })),
      state('open', style({
      })),
      transition('open=>closed', group([
        query('@sidebarContentOpen', [
          animateChild()
        ]),
        query('@sidebarOpenbtnOpen', [
          animateChild()
        ]),
        animate('300ms ease')
      ])),
      transition('closed=>open', group([
        animate('300ms ease'),
      ])),
    ]),
    trigger('sidebarContentOpen', [
      state('closed', style({
        opacity: 0,
        display: 'none'
      })),
      state('open', style({
        opacity: 1,
      })),
      transition('closed<=>open', animate('300ms ease')),
    ]),
    trigger('sidebarOpenbtnOpen', [
      state('closed', style({
        opacity: 1,
      })),
      state('open', style({
        opacity: 0,
        display: 'none'
      })),
      transition('open=>closed', animate('300ms ease')),
    ]),
    trigger('sidebarOpenMobile', [
      state('closed', style({
        'transform': 'translateX(-50%)'
      })),
      state('open', style({
        'transform': 'translateX(0%)',
      })),
      transition('closed<=>open', animate('200ms')),
    ])
  ]
})
export class SidebarComponent implements OnDestroy, AfterViewInit {
  @Input() position: 'left' | 'right' = 'left';

  open = true;
  disableWidthAnim = false;
  mobile = false;

/*   @Input() draggable = true;
  @Input() open = true; */

  @ViewChild('sidebarRef', {static: false}) sidebarRef: ElementRef;
  @ViewChild('navWrapper', {static: false}) navWrapperRef: ElementRef;

/*   minWidthThreshold = 200;
  prevWidth = 0; */

  destroyResizeListener: Function;
  destroyDragMoveListener: Function;
  destroyDragEndListener: Function;

  constructor(private renderer: Renderer2, private cdr: ChangeDetectorRef) {}

  ngAfterViewInit() {
    this.detectMobileMode();
    this.destroyResizeListener = this.renderer.listen(window, 'resize', this.detectMobileMode);
  }

  detectMobileMode() {
    this.mobile = window.innerWidth < mobileBreakpoint;
    this.cdr.detectChanges();
  }

  onSwitchOpen() {
    this.open = !this.open;
  }

  onDragStart(mousedown) {
    this.disableWidthAnim = true;
    this.destroyDragMoveListener = this.renderer.listen(document, 'mousemove', this.onDrag.bind(this));
    this.destroyDragEndListener = this.renderer.listen(document, 'mouseup', this.onDragEnd.bind(this));
  }

  onDrag(mousemove) {
    const width = this.calcSidebarWidth(mousemove.clientX);
    if (width < 50) {
      this.open = false;
      this.cdr.markForCheck();
    } else {
      this.open = true;
      this.cdr.markForCheck();
    }
    this.renderer.setStyle(this.sidebarRef.nativeElement, 'width', `${Math.max(50, width)}px`);
  }

  onDragEnd() {
    this.disableWidthAnim = false;
    this.destroyDragMoveListener();
    this.destroyDragEndListener();
  }

  ngOnDestroy() {
    if (this.destroyDragMoveListener) {
      this.destroyDragMoveListener();
    }
    if (this.destroyDragEndListener) {
      this.destroyDragEndListener();
    }
  }

  calcSidebarWidth(mouseX) {
    let width = 50;
    if (this.position === 'left') {
      width = Math.abs(this.sidebarRef.nativeElement.clientLeft - mouseX);
    } else {
      width = Math.abs(this.sidebarRef.nativeElement.offsetLeft + this.sidebarRef.nativeElement.clientWidth - mouseX);
    }
    return width;
  }
}
