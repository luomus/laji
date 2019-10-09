import { Component, Input, Renderer2, OnDestroy, ChangeDetectorRef, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { trigger, state, style, transition, animate, group, query, animateChild } from '@angular/animations';

const mobileBreakpoint = 768;
const sidebarMinWidth = 50;

@Component({
  selector: 'lu-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  animations: [
    trigger('sidebarOpen', [
      state('closed', style({
        'width': `${sidebarMinWidth}px`
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
    ])
  ]
})
export class SidebarComponent implements OnDestroy, AfterViewInit {
  @Input() position: 'left' | 'right' = 'left';

  open = true;
  disableWidthAnim = false;
  mobile = false;

  ogWidth = 0;
  widthBeforeDrag = 0;

  @ViewChild('sidebarRef', {static: false}) sidebarRef: ElementRef;
  @ViewChild('navWrapper', {static: false}) navWrapperRef: ElementRef;

  destroyResizeListener: Function;
  destroyDragMoveListener: Function;
  destroyDragEndListener: Function;

  constructor(private renderer: Renderer2, private cdr: ChangeDetectorRef) {}

  ngAfterViewInit() {
    this.detectMobileMode();
    this.destroyResizeListener = this.renderer.listen(window, 'resize', this.detectMobileMode.bind(this));
    this.ogWidth = this.sidebarRef.nativeElement.offsetWidth;
  }

  detectMobileMode() {
    this.mobile = window.innerWidth < mobileBreakpoint;
    this.cdr.detectChanges();
  }

  onSwitchOpen() {
    this.open = !this.open;
    this.cdr.detectChanges();
  }

  onDragStart(mousedown) {
    this.widthBeforeDrag = this.sidebarRef.nativeElement.offsetWidth;
    this.disableWidthAnim = true;
    this.destroyDragMoveListener = this.renderer.listen(document, 'mousemove', this.onDrag.bind(this));
    this.destroyDragEndListener = this.renderer.listen(document, 'mouseup', this.onDragEnd.bind(this));
  }

  onDrag(mousemove) {
    const width = this.calcSidebarWidth(mousemove.clientX);
    if (width <= sidebarMinWidth) {
      this.open = false;
      this.cdr.markForCheck();
    } else {
      this.open = true;
      this.cdr.markForCheck();
    }
    this.renderer.setStyle(this.sidebarRef.nativeElement, 'width', `${Math.max(sidebarMinWidth, width)}px`);
  }

  onDragEnd(mouseup) {
    this.disableWidthAnim = false;
    const currentWidth = this.calcSidebarWidth(mouseup.clientX);
    if (currentWidth < this.ogWidth) {
      if (currentWidth > this.widthBeforeDrag) {
        this.renderer.setStyle(this.sidebarRef.nativeElement, 'width', `${this.ogWidth}px`);
        this.open = true;
      } else {
        this.open = false;
      }
      this.cdr.markForCheck();
    }
    this.destroyDragMoveListener();
    this.destroyDragEndListener();
  }

  ngOnDestroy() {
    if (this.destroyResizeListener) {
      this.destroyResizeListener();
    }
    if (this.destroyDragMoveListener) {
      this.destroyDragMoveListener();
    }
    if (this.destroyDragEndListener) {
      this.destroyDragEndListener();
    }
  }

  calcSidebarWidth(mouseX) {
    let width = sidebarMinWidth;
    if (this.position === 'left') {
      width = Math.abs(this.sidebarRef.nativeElement.clientLeft - mouseX);
    } else {
      width = Math.abs(this.sidebarRef.nativeElement.offsetLeft + this.sidebarRef.nativeElement.clientWidth - mouseX);
    }
    return width;
  }
}
