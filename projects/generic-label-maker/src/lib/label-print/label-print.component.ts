import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output, SimpleChanges,
  ViewChild
} from '@angular/core';
import { ISetup, QRCodeErrorCorrectionLevel } from '../generic-label-maker.interface';
import { IPageLayout, LabelService } from '../label.service';

const style = `
.ll-print-content {
  display: grid;
  grid-gap: 0;
  grid-auto-flow: column;
  align-items: start;
  justify-items: start;
  page-break-inside: avoid;
  page-break-after: always;
}
.ll-label-item {
  position: absolute;
  overflow: hidden;
}
.ll-label {
  position: relative;
  overflow: hidden;
}
.ll-label.preview {
  border: 1px solid #333;
}
`;

@Component({
  selector: 'll-label-print',
  templateUrl: './label-print.component.html',
  styleUrls: ['./label-print.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LabelPrintComponent implements OnChanges {

  @Input() visible = true;
  @Input() setup: ISetup;
  @Input() data: object[];
  // tslint:disable-next-line:no-input-rename
  @Input() btnClass = 'btn btn-default';
  @Input() qrCodeErrorCorrectionLevel: QRCodeErrorCorrectionLevel = QRCodeErrorCorrectionLevel.levelM;

  @Output() pressed = new EventEmitter<void>();
  @Output() html = new EventEmitter<string>();

  @ViewChild('pagesContainer') public pageContainer: ElementRef<HTMLDivElement>;

  pages: object[][] = [];
  pageLayout: IPageLayout;
  nroPages: number;
  printing = false;

  constructor(
    private labelService: LabelService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.visible) {
      this.renderPages();
    }
  }

  renderPages() {
    if (!this.data || this.data.length === 0) {
      return;
    }
    this.pressed.emit();
    this.printing = true;
    this.pageLayout = this.labelService.countLabelsPerPage(this.setup);
    const perPage = this.pageLayout.rows * this.pageLayout.cols;
    const pages = [];
    let page = [];
    this.data.forEach((item, idx) => {
      if (idx % perPage === 0 && page.length > 0) {
        pages.push([...page]);
        page = [];
      }
      page.push(item);
    });
    if (page.length > 0) {
      pages.push([...page]);
    }
    this.pages = pages;
    this.nroPages = pages.length;
    this.cdr.markForCheck();
  }

  printReady() {
    this.nroPages--;
    if (this.nroPages <= 0) {
      const html = `<!DOCTYPE html>
<html>
  <head><meta charset="utf-8"><title>Labels</title><style>${style}</style></head>
  <body style="margin: 0; padding: 0;">${this.pageContainer.nativeElement.innerHTML}</body>
</html>`;
      this.printing = this.visible;
      this.html.emit(html);
    }
  }
}
