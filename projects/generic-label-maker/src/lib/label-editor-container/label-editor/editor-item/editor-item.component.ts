import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { ILabelItem } from '../../../generic-label-maker.interface';
import { CdkDragEnd, CdkDragMove } from '@angular/cdk/drag-drop';
import { LabelService } from '../../../label.service';

@Component({
  selector: 'll-editor-item',
  templateUrl: './editor-item.component.html',
  styleUrls: ['./editor-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditorItemComponent implements AfterViewInit {

  @Input() magnification: number;
  @Input() active: boolean;
  @Input() boundary = '#label-editor';
  @ViewChild('item') elemRef: ElementRef<HTMLDivElement>;

  @Output() done = new EventEmitter<void>();
  @Output() itemChange = new EventEmitter<ILabelItem>();
  @Output() showSettings = new EventEmitter<ILabelItem>();
  @Output() itemClick = new EventEmitter<ILabelItem>();

  _item: ILabelItem;

  width: number;
  height: number;
  size: number;
  x: number;
  y: number;
  origElementDimensions: DOMRect;

  private maxWidthMm: number;
  private maxWidthPx: number;
  private maxHeightMm: number;
  private maxHeightPx: number;

  private elem: HTMLDivElement;

  constructor(
    private labelService: LabelService
  ) {}

  @Input()
  set maxHeight(height: number) {
    this.maxHeightMm = height * this.magnification;
    this.maxHeightPx = this.labelService.mmToPixel(this.maxHeightMm);
  }

  @Input()
  set maxWidth(width: number) {
    this.maxWidthMm = width * this.magnification;
    this.maxWidthPx = this.labelService.mmToPixel(this.maxWidthMm);
  }

  @Input()
  set item(item: ILabelItem) {
    this._item = item;
    if (this._item) {
      this.recalculate();
    }
  }

  ngAfterViewInit(): void {
    this.elem = this.elemRef.nativeElement;
  }

  recalculate() {
    this.width = this._item.style['width.mm'] * this.magnification;
    this.height = this._item.style['height.mm'] * this.magnification;
    this.size = this.labelService.mmToPixel(Math.min(this.width, this.height));
    this.x = this._item.x * this.magnification;
    this.y = this._item.y * this.magnification;

    // check that the item fits the label
    if (this.x + this.width > this.maxWidthMm) {
      this.x = Math.max(0, this.maxWidthMm - this.width);
    }
    if (this.y + this.height > this.maxHeightMm) {
      this.y = Math.max(0, this.maxHeightMm - this.height);
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
    const width = event.pointerPosition.x - this.origElementDimensions.x - 7;
    const height = event.pointerPosition.y - this.origElementDimensions.y - 7;
    const widthMaxMm = this.labelService.pixelToMm(width) + this.x;
    const heightMaxMm = this.labelService.pixelToMm(height) + this.y;

    this.elem.style.width = (widthMaxMm < this.maxWidthMm ? width : this.labelService.mmToPixel(this.maxWidthMm - this.x)) + 'px';
    this.elem.style.height = (heightMaxMm < this.maxHeightMm ? height : this.labelService.mmToPixel(this.maxHeightMm - this.y)) + 'px';

    event.source.reset();
  }

  onResizeEnd(event: CdkDragEnd) {
    event.source.reset();
    this.itemChange.emit({
      ...this._item,
      style: {
        ...this._item.style,
        'width.mm': this.labelService.pixelToMm(this.elem.offsetWidth) / this.magnification,
        'height.mm': this.labelService.pixelToMm(this.elem.offsetHeight) / this.magnification
      }
    });
  }
}
