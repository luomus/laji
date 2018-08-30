import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'laji-document-local-print-view',
  templateUrl: './document-local-print-view.component.html',
  styleUrls: ['./document-local-print-view.component.scss']
})
export class DocumentLocalPrintViewComponent implements OnInit {
  @Input() document: Document;
  @Input() fields: any;
  @Input() mapData: any[] = [];
  @Input() imageData: {[key: string]: any} = {};
  @Input() useWorldMap = true;

  constructor() { }

  ngOnInit() {
  }

}
