/// <reference path="../../../../../node_modules/@types/node/index.d.ts" />

import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { Setup } from '../generic-label-maker.interface';
import { LabelService, PageLayout } from '../label.service';
const style = require('../../styles/ll-label.css');

@Component({
  selector: 'll-label-print',
  templateUrl: './label-print.component.html',
  styleUrls: ['./label-print.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LabelPrintComponent implements OnInit {

  @Input() setup: Setup;
  @Input() data: object[];
  @Input() labelButton = 'PDF';
  // tslint:disable-next-line:no-input-rename
  @Input('class') btnClass = 'btn btn-default';

  @Output() click = new EventEmitter<void>();
  @Output() html = new EventEmitter<string>();

  @ViewChild('pagesContainer') public pageContainer: ElementRef<HTMLDivElement>;

  pages: object[][] = [];
  pageLayout: PageLayout;
  nroPages: number;

  constructor(
    private labelService: LabelService
  ) { }

  ngOnInit() {
  }


  btnClick(event: MouseEvent) {
    event.preventDefault();
    this.click.emit();
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
  }

  printReady() {
    this.nroPages--;
    if (this.nroPages <= 0) {
        const html = `<!DOCTYPE html>
<html>
  <head><meta charset="utf-8"><title>Labels</title><style>${style}</style></head>
  <body style="margin: 0; padding: 0;">${this.pageContainer.nativeElement.innerHTML}</body>
</html>`;
        this.html.emit(html);
    }
  }
}
