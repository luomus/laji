import { AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { LabelItem } from '../../../generic-label-maker.interface';
import { CdkDragEnd, CdkDragMove, CdkDragStart } from '@angular/cdk/drag-drop';

@Component({
  selector: 'll-editor-item',
  templateUrl: './editor-item.component.html',
  styleUrls: ['./editor-item.component.scss']
})
export class EditorItemComponent implements AfterViewInit {

  @Input() magnification: number;
  @Input() active: boolean;
  @Input() maxWidth: number;
  @Input() maxHeight: number;
  @ViewChild('item') elemRef: ElementRef<HTMLDivElement>;

  @Output() itemChange = new EventEmitter<LabelItem>();

  _item: LabelItem;

  width: number;
  height: number;
  x: number;
  y: number;
  lastPointerPosition: {x: number, y: number};
  origElememDimensions: DOMRect;

  private elem: HTMLDivElement;

  constructor() {}

  @Input()
  set item(item: LabelItem) {
    this._item = item;
    if (this._item) {
      this.recalculate();
    }
  }

  ngAfterViewInit(): void {
    this.elem = this.elemRef.nativeElement;
  }

  recalculate() {
    this.width = this._item.width * this.magnification;
    this.height = this._item.height * this.magnification;
    this.x = this._item.x * this.magnification;
    this.y = this._item.y * this.magnification;

    // check that the item fits the label
    if (this.x + this.width > this.maxWidth) {
      this.x = Math.max(0, this.maxWidth - this.width);
    }
    if (this.y + this.height > this.maxHeight) {
      this.y = Math.max(0, this.maxHeight - this.height);
    }
  }

  onDrop(event) {
    console.log(event);
  }

  onResizeStart(event: CdkDragStart) {
    this.origElememDimensions = this.elem.getBoundingClientRect() as DOMRect;
  }

  onResize(event: CdkDragMove) {
    this.elem.style.width = event.pointerPosition.x - this.origElememDimensions.x - 7 + 'px';
    this.elem.style.height = event.pointerPosition.y - this.origElememDimensions.y - 7 + 'px';
    event.source.reset();
  }

  onResizeEnd(event: CdkDragEnd) {
    event.source.reset();
    this.lastPointerPosition = undefined;
    // TODO: send change event with mm as size values
  }
}
