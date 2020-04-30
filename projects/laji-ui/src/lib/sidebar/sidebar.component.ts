import {
  Component, Input, Renderer2, OnDestroy, ChangeDetectorRef, ElementRef, ViewChild, AfterViewInit, Inject, PLATFORM_ID, ContentChildren, QueryList
} from '@angular/core';
import { trigger, state, style, transition, animate, group, query, animateChild } from '@angular/animations';
import { isPlatformBrowser } from '@angular/common';
import { fromEvent, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { SidebarLinkComponent } from './sidebar-link/sidebar-link.component';

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
      })),
      transition('open=>closed', animate('300ms ease')),
    ])
  ]
})
export class SidebarComponent implements OnDestroy, AfterViewInit {
  private unsubscribe$ = new Subject<null>();

  @Input() position: 'left' | 'right' = 'left';
  @Input() staticWidth: number;
  @Input() menuTitle: string;

  sidebarMinWidth = 50;

  private _open = true;
  @Input() set open(b) {
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

  preCheckScreenWidth = true;

  @ViewChild('sidebarRef') sidebarRef: ElementRef;
  @ViewChild('contentRef') contentRef: ElementRef;
  @ViewChild('navWrapper') navWrapperRef: ElementRef;
  @ContentChildren(SidebarLinkComponent) sidebarLinks: QueryList<SidebarLinkComponent>;

  destroyResizeListener: Function;
  destroyDragMoveListener: Function;
  destroyDragEndListener: Function;

  destroyCloseOnClickListener: Function;

  constructor(private renderer: Renderer2, private cdr: ChangeDetectorRef, @Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      this.open = !(window.innerWidth < mobileBreakpoint);
    }
  }

  ngAfterViewInit() {
    this.checkScreenWidth();
    this.preCheckScreenWidth = false;
    this.cdr.detectChanges();
    fromEvent(window, 'resize').pipe(
      debounceTime(500),
      distinctUntilChanged(),
      takeUntil(this.unsubscribe$)
    ).subscribe(this.checkScreenWidth.bind(this));
    this.ogWidth = this.sidebarRef.nativeElement.offsetWidth;
    this.checkCloseOnClickListener();

    if (this.sidebarLinks) {
      this.sidebarLinks.forEach((sidebarLink) => {
        sidebarLink.clicked.pipe(takeUntil(this.unsubscribe$)).subscribe(() => {
          if (this.mobile) {
            this.open = false;
          }
        });
      });
    }
  }

  checkScreenWidth(event?) {
    if (event && event['ignore-sidebar']) {
      return;
    }
    const isMobile = window.innerWidth < mobileBreakpoint;
    if (this.mobile !== isMobile) {
      if (isMobile) {
        this.sidebarMinWidth = 0;
        this.open = false;
      } else {
        this.sidebarMinWidth = 50;
        this.open = true;
      }
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

  onResizeAnimationComplete() {
    try {
      const event = new Event('resize');
      event['ignore-sidebar'] = true;
      window.dispatchEvent(event);
    } catch (e) {
      const evt: any = window.document.createEvent('UIEvents');
      evt.initUIEvent('resize', true, false, window, 0);
      window.dispatchEvent(evt);
    }
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
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
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
