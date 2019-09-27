import { Component, Input, Renderer2, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'lu-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  animations: [
    trigger('sidebarState', [
      state('closed', style({
        'width': '50px',
        'opacity': '0',
        'z-index': '-1'
      }), {params: {transform: '-100%'}}),
      state('open', style({
      })),
      transition('closed<=>open', animate('2000ms')),
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
    ])
  ]
})
export class SidebarComponent implements OnDestroy {
  @Input() position: 'left' | 'right' = 'left';
  @Input() draggable = true;
  @Input() open = true;

  @ViewChild('sidebarRef', {static: false}) sidebarRef: ElementRef;

  destroyDragMoveListener: Function;
  destroyDragEndListener: Function;

  constructor(private renderer: Renderer2, private cdr: ChangeDetectorRef) {}

  onSwitchState() {
    this.open = !this.open;
  }

  onDragStart(mousedown) {
    this.destroyDragMoveListener = this.renderer.listen(document, 'mousemove', this.onDrag.bind(this));
    this.destroyDragEndListener = this.renderer.listen(document, 'mouseup', this.onDragEnd.bind(this));
  }

  onDrag(mousemove) {
    let width = 0;
    let opacity = 1;
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
    }
    if (width <= 100) {
      opacity = (width - 50) / 50;
    }
    this.renderer.setStyle(this.sidebarRef.nativeElement, 'width', `${Math.max(50, width)}px`);
    this.renderer.setStyle(this.sidebarRef.nativeElement, 'opacity', `${Math.max(0, opacity)}`);
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
