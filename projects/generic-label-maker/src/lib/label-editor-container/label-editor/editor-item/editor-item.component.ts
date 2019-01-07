import { AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { LabelItem } from '../../../generic-label-maker.interface';
import { CdkDragEnd, CdkDragMove } from '@angular/cdk/drag-drop';
import { LabelService } from '../../../label.service';

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
  @Output() showSettings = new EventEmitter<LabelItem>();

  _item: LabelItem;

  boundary = '#label-editor';
  width: number;
  height: number;
  size: number;
  x: number;
  y: number;
  origElementDimensions: DOMRect;

  private elem: HTMLDivElement;

  constructor(
    private labelService: LabelService
  ) {}

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
    this.size = this.labelService.mmToPixel(Math.min(this.width, this.height));
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

  recordElementDimensions() {
    this.origElementDimensions = this.elem.getBoundingClientRect() as DOMRect;
  }

  onMoveEnd() {
    const bounds = this.elem.getBoundingClientRect() as DOMRect;
    const deltaX = this.labelService.pixelToMm(bounds.x - this.origElementDimensions.x) / this.magnification;
    const deltaY = this.labelService.pixelToMm(bounds.y - this.origElementDimensions.y) / this.magnification;
    this.itemChange.emit({
      ...this._item,
      x: this._item.x + deltaX,
      y: this._item.y + deltaY,
    });
  }

  onResize(event: CdkDragMove) {
    this.elem.style.width = event.pointerPosition.x - this.origElementDimensions.x - 7 + 'px';
    this.elem.style.height = event.pointerPosition.y - this.origElementDimensions.y - 7 + 'px';
    event.source.reset();
  }

  onResizeEnd(event: CdkDragEnd) {
    event.source.reset();
    this.itemChange.emit({
      ...this._item,
      width: this.labelService.pixelToMm(this.elem.offsetWidth) / this.magnification,
      height: this.labelService.pixelToMm(this.elem.offsetHeight) / this.magnification
    });
  }
}
