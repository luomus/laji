import { Component, Input, Renderer2, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'lu-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  animations: [
    trigger('sidebarState', [
      state('inactive', style({
        'transform': 'translateX({{transform}})',
        'box-shadow': '0 0 0 0 rgba(0,0,0,0.1)'
      }), {params: {transform: '-100%'}}),
      state('active', style({
        'transform': 'none'
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
    let width = 0;
    if (this.position === 'left') {
      width = Math.abs(this.sidebarRef.nativeElement.clientLeft - mousemove.clientX);
    } else {
      width = Math.abs(this.sidebarRef.nativeElement.offsetLeft + this.sidebarRef.nativeElement.clientWidth - mousemove.clientX);
    }
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
