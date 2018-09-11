import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'laji-document-local-print-view',
  templateUrl: './document-local-print-view.component.html',
  styleUrls: ['../../styles/document-print.scss']
})
export class DocumentLocalPrintViewComponent implements OnInit {
  @Input() document: Document;
  @Input() fields: any;
  @Input() mapData: any[] = [];
  @Input() imageData: {[key: string]: any} = {};

  constructor() { }

  ngOnInit() {
  }

}
