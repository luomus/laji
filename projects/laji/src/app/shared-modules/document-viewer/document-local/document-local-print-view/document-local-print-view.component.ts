import { Component, Input } from '@angular/core';
import { StoreDocument } from '../../document-viewer.facade';

@Component({
    selector: 'laji-document-local-print-view',
    templateUrl: './document-local-print-view.component.html',
    styleUrls: ['../../styles/document-print.scss'],
    standalone: false
})
export class DocumentLocalPrintViewComponent {
  @Input({ required: true }) document!: StoreDocument;
  @Input() fields: any;
  @Input() mapData: any[] = [];
  @Input() imageData: {[key: string]: any} = {};

}
