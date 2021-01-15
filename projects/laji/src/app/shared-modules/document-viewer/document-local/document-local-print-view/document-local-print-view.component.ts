import { Component, Input } from '@angular/core';
import { Document } from '../../../../shared/model/Document';

@Component({
  selector: 'laji-document-local-print-view',
  templateUrl: './document-local-print-view.component.html',
  styleUrls: ['../../styles/document-print.scss']
})
export class DocumentLocalPrintViewComponent {
  @Input() document: Document;
  @Input() fields: any;
  @Input() mapData: any[] = [];
  @Input() imageData: {[key: string]: any} = {};

}
