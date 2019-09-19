import { Component, Input, Renderer2, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'lu-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  animations: [
    trigger('sidebarState', [
      state('inactive', style({
        'width': '0px',
        'overflow-x': 'hidden',
        'padding': '0px',
        'opacity': '0'
      })),
      state('active', style({
        'width': '*',
        'overflow-x': 'unset',
        'padding': '*',
        'opacity': '1'
      })),
      transition('inactive<=>active', animate('200ms')),
    ])
  ]
})
export class SidebarComponent implements OnDestroy {
  @Input() position: 'left' | 'right' = 'left';
  @Input() draggable = true;

  @ViewChild('sidebarRef', {static: false}) sidebarRef: ElementRef;

  active = true;

  destroyDragMoveListener: Function;
  destroyDragEndListener: Function;

  constructor(private renderer: Renderer2) {}

  onSwitchState() {
    this.active = !this.active;
  }

  onSwitchPosition() {
    this.position === 'left' ? this.position = 'right' : this.position = 'left';
  }

  onDragStart(mousedown) {
    this.destroyDragMoveListener = this.renderer.listen(document, 'mousemove', this.onDrag.bind(this));
    this.destroyDragEndListener = this.renderer.listen(document, 'mouseup', this.onDragEnd.bind(this));
  }

  onDrag(mousemove) {
    const width = Math.abs(this.sidebarRef.nativeElement.clientLeft - mousemove.clientX);
    this.renderer.setStyle(this.sidebarRef.nativeElement, 'width', `${width}px`);
  }

  onDragEnd(mouseup) {
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
