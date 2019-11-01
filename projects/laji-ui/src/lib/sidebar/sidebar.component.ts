import { Component, Input, Renderer2, OnDestroy, ChangeDetectorRef, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { trigger, state, style, transition, animate, group, query, animateChild } from '@angular/animations';

const mobileBreakpoint = 768;

@Component({
  selector: 'lu-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  animations: [
    trigger('sidebarOpen_wrapper', [
      state('closed', style({
        'width': '{{sidebarMinWidth}}px'
      }), {params: {sidebarMinWidth: 0}}),
      state('open', style({
      })),
      transition('open=>closed', group([
        query('@sidebarOpen_content', [
          animateChild()
        ]),
        query('@sidebarOpen_menu', [
          animateChild()
        ], {optional: true}),
        animate('300ms ease')
      ])),
      transition('closed=>open', group([
        animate('300ms ease'),
      ])),
    ]),
    trigger('sidebarOpen_content', [
      state('closed', style({
        opacity: 0,
        display: 'none'
      })),
      state('open', style({
        opacity: 1,
      })),
      transition('closed<=>open', animate('300ms ease')),
    ]),
    trigger('sidebarOpen_menu', [
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
  @Input() staticWidth: number;

  sidebarMinWidth = 50;

  private _open = true;
  set open(b) {
    this._open = b;
    this.checkCloseOnClickListener();
  }
  get open() {
    return this._open;
  }

  dragging = false;
  mobile = false;

  ogWidth = 0;
  widthBeforeDrag = 0;

  @ViewChild('sidebarRef', {static: false}) sidebarRef: ElementRef;
  @ViewChild('contentRef', {static: false}) contentRef: ElementRef;
  @ViewChild('navWrapper', {static: false}) navWrapperRef: ElementRef;

  destroyResizeListener: Function;
  destroyDragMoveListener: Function;
  destroyDragEndListener: Function;

  destroyCloseOnClickListener: Function;

  constructor(private renderer: Renderer2, private cdr: ChangeDetectorRef) {}

  ngAfterViewInit() {
    this.checkScreenWidth();
    this.destroyResizeListener = this.renderer.listen(window, 'resize', this.checkScreenWidth.bind(this));
    this.ogWidth = this.sidebarRef.nativeElement.offsetWidth;
    this.checkCloseOnClickListener();
  }

  checkScreenWidth() {
    const isMobile = window.innerWidth < mobileBreakpoint;
    if (isMobile) {
      this.sidebarMinWidth = 0;
      this.open = false;
    } else {
      this.sidebarMinWidth = 50;
      this.open = true;
    }
    this.mobile = isMobile;
    this.cdr.detectChanges();
  }

  checkCloseOnClickListener() {
    if (this.mobile && this.open && this.contentRef && !this.destroyCloseOnClickListener) {
      setTimeout(() => {
        this.destroyCloseOnClickListener = this.renderer.listen(this.contentRef.nativeElement, 'click', this.onContentClick.bind(this));
      });
    } else if (this.destroyCloseOnClickListener) {
      this.destroyCloseOnClickListener = this.destroyCloseOnClickListener();
    }
  }

  onSwitchOpen() {
    this.open = !this.open;
    this.cdr.detectChanges();
  }

  onDragStart(mousedown) {
    this.widthBeforeDrag = this.sidebarRef.nativeElement.offsetWidth;
    this.dragging = true;
    this.destroyDragListeners();
    this.destroyDragMoveListener = this.renderer.listen(document, 'mousemove', this.onDrag.bind(this));
    this.destroyDragEndListener = this.renderer.listen(document, 'mouseup', this.onDragEnd.bind(this));
  }

  onContentClick() {
    if (this.mobile) {
      this.open = false;
      this.cdr.detectChanges();
    }
  }

  onDrag(mousemove) {
    const width = this.calcSidebarWidth(mousemove.clientX);
    if (width <= this.sidebarMinWidth) {
      if (this.open) {
        this.open = false;
        this.cdr.markForCheck();
      }
    } else {
      if (!this.open) {
        this.open = true;
        this.cdr.markForCheck();
      }
    }
    this.renderer.setStyle(this.sidebarRef.nativeElement, 'width', `${Math.max(this.sidebarMinWidth, width)}px`);
  }

  onDragEnd(mouseup) {
    this.dragging = false;
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

  destroyDragListeners() {
    if (this.destroyDragMoveListener) {
      this.destroyDragMoveListener = this.destroyDragMoveListener();
    }
    if (this.destroyDragEndListener) {
      this.destroyDragMoveListener = this.destroyDragEndListener();
    }
  }

  ngOnDestroy() {
    if (this.destroyResizeListener) {
      this.destroyResizeListener = this.destroyResizeListener();
    }
    if (this.destroyCloseOnClickListener) {
      this.destroyCloseOnClickListener = this.destroyCloseOnClickListener();
    }
    this.destroyDragListeners();
  }

  calcSidebarWidth(mouseX) {
    let width = this.sidebarMinWidth;
    if (this.position === 'left') {
      width = Math.abs(this.sidebarRef.nativeElement.clientLeft - mouseX);
    } else {
      width = Math.abs(this.sidebarRef.nativeElement.offsetLeft + this.sidebarRef.nativeElement.clientWidth - mouseX);
    }
    return width;
  }
}
