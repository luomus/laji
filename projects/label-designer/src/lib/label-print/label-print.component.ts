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
import { IPageLayout, ISetup, QRCodeErrorCorrectionLevel } from '../label-designer.interface';
import { LabelService } from '../label.service';

/* eslint-disable max-len */
/**
 * @ignore
 */
const style = `
@import url('https://fonts.googleapis.com/css?family=Cormorant+Garamond|Merriweather|Noto+Serif|Old+Standard+TT|Open+Sans|Open+Sans+Condensed|Source+Code+Pro:300&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
.ll-page {
  box-sizing: border-box;
  overflow: hidden;
  border: 0;
}
.ll-print-content {
  display: grid;
  grid-gap: 0;
  grid-auto-flow: column;
  align-items: start;
  justify-items: start;
}
.ll-label-item {
  position: absolute;
}
.ll-label {
  direction: ltr;
  position: relative;
  overflow: hidden;
}
.ll-label.preview {
  border: 1px solid #333;
}
.qrcode img {
  width: 100%;
}
`;
/* eslint-enable max-len */

export interface IRenderPageOptions {
  skip?: number;
  repeat?: number;
}

/**
 * Convert the label setup together with data to html that can be used for printing.
 *
 * Please note that this will not generate pdf. Instead this will generate html that can
 * be used to generate the pdf externally. It's up to the host system to decide what to
 * do with the html received.
 */
@Component({
  selector: 'll-label-print',
  templateUrl: './label-print.component.html',
  styleUrls: ['./label-print.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LabelPrintComponent implements OnChanges {

  /**
   * Show elements that are printed.
   */
  @Input() visible = true;

  /**
   * Setup used for the label
   */
  @Input() setup: ISetup;

  /**
   * Array that holds key value objects that are used for the data on the label.
   */
  @Input() data: Record<string, any>[];

  /**
   * Css class that are on the print button.
   */
  @Input() btnClass = 'btn btn-default';

  /**
   * Error correction level used for the QR Code
   */
  @Input() qrCodeErrorCorrectionLevel: QRCodeErrorCorrectionLevel = QRCodeErrorCorrectionLevel.levelM;

  /**
   * This event is triggered when print button is pressed or when renderPages method is called.
   */
  @Output() pressed: EventEmitter<void> = new EventEmitter<void>();

  /**
   * This event is triggered when the html generated from the labels are ready.
   *
   * Event will have the html string in it.
   */
  @Output() html: EventEmitter<string> = new EventEmitter<string>();

  /**
   * @ignore
   */
  @ViewChild('pagesContainer', { static: true }) public pageContainer: ElementRef<HTMLDivElement>;

  /**
   * @ignore
   */
  pages: Record<string, any>[][] = [];
  /**
   * @ignore
   */
  pageLayout: IPageLayout;
  /**
   * @ignore
   */
  nroPages: number;
  /**
   * @ignore
   */
  printing = false;

  /**
   * @ignore
   */
  constructor(
    private labelService: LabelService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnChanges(): void {
    if (this.visible) {
      this.renderPages();
    }
  }

  /**
   * Render the label pages.
   *
   * This method can be used to start page rendering even if the button itself would not be visible.
   */
  renderPages(options?: IRenderPageOptions): void {
    if (!this.data || this.data.length === 0) {
      return;
    }
    this.pressed.emit();
    this.printing = true;
    this.pageLayout = this.labelService.countLabelsPerPage(this.setup);
    const perPage = this.pageLayout.rows * this.pageLayout.cols;
    const pages = [];
    const skip = new Array(Math.max(options.skip || 0, 0)).fill(null);
    const repeat = Math.max(options.repeat || 1, 1);
    const data = this.data.reduce((all: any[], current) => {
      for (let i = 0; i < repeat; i++) {
        all.push(current);
      }
      return all;
    }, []) as any[];
    let page = [];
    [...skip, ...data].forEach((item, idx) => {
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

  /**
   * @ignore
   */
  printReady(): void {
    this.nroPages--;
    if (this.nroPages <= 0) {
      const html = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8"><title>Labels</title><style>${style}</style>
    <script type="application/javascript">await document.fonts.ready;</script>
  </head>
  <body style="margin: 0; padding: 0;">${this.pageContainer.nativeElement.innerHTML}</body>
</html>`;
      this.printing = this.visible;
      this.html.emit(html);
    }
  }
}
