import { Component, Input, Renderer2, OnDestroy, ChangeDetectorRef, ElementRef, ViewChild } from '@angular/core';
import { trigger, state, style, transition, animate, group, query, animateChild } from '@angular/animations';

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
/*     trigger('sidebarState', [
      state('closed', style({
        'width': '50px',
        'opacity': '0',
        'z-index': '-1'
      }), {params: {transform: '-100%'}}),
      state('open', style({
      })),
      transition('closed<=>open', animate('200ms')),
    ]),
    trigger('sidebarStateMobile', [
      state('closed', style({
        'transform': 'translateX({{transform}})',
        'box-shadow': '0 0 0 0 rgba(0,0,0,0.1)'
      }), {params: {transform: '-100%'}}),
      state('open', style({
        'transform': 'translateX(0%)',
      })),
      transition('closed<=>open', animate('200ms')),
    ]) */
  ]
})
export class SidebarComponent implements OnDestroy {
  @Input() position: 'left' | 'right' = 'left';

  open = true;

/*   @Input() draggable = true;
  @Input() open = true; */

  @ViewChild('sidebarRef', {static: false}) sidebarRef: ElementRef;
  @ViewChild('navWrapper', {static: false}) navWrapperRef: ElementRef;

/*   minWidthThreshold = 200;
  prevWidth = 0; */

  destroyDragMoveListener: Function;
  destroyDragEndListener: Function;

  constructor(private renderer: Renderer2, private cdr: ChangeDetectorRef) {}

  onSwitchOpen() {
    this.open = !this.open;
  }

  onDragStart(mousedown) {
    this.destroyDragMoveListener = this.renderer.listen(document, 'mousemove', this.onDrag.bind(this));
    this.destroyDragEndListener = this.renderer.listen(document, 'mouseup', this.onDragEnd.bind(this));
  }

  onDrag(mousemove) {
    let width = 0;
    if (this.position === 'left') {
      width = Math.abs(this.sidebarRef.nativeElement.clientLeft - mousemove.clientX);
    } else {
      width = Math.abs(this.sidebarRef.nativeElement.offsetLeft + this.sidebarRef.nativeElement.clientWidth - mousemove.clientX);
    }
    if (width < 50) {
      this.onDragEnd();
      this.open = false;
      this.cdr.markForCheck();
    } else {
      this.open = true;
      this.cdr.markForCheck();
    }
    this.renderer.setStyle(this.sidebarRef.nativeElement, 'width', `${Math.max(50, width)}px`);
  }

  onDragEnd() {
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
}

/**
 * DOM COMPONENTS
 * - Sidebar (variable width, always opaque)
 *   - SidebarContentWrapper (fixed width, transparent when closed)
 *     - Close button
 *     - SidebarContent
 *   - Open button (hamburger)
 *   - Dragbar (left or right edge of host)
 * - Content
 *
 * INPUTS
 * - Position
 * - Width
 *
 * ANIMS
 * - open <=> closed
 *
 * ON MOBILE
 * - disable dragbar
 * - open <=> closed animation uses TranslateX instead of changing width
 *
 */
