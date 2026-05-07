import { Component, Input } from '@angular/core';
import { StoreDocument } from '../../document-viewer.facade';

@Component({
    selector: 'laji-collection-contest-print',
    templateUrl: './collection-contest-print.component.html',
    styleUrls: ['./collection-contest-print.scss'],
    standalone: false
})
export class CollectionContestPrintComponent {
  @Input({ required: true }) document!: StoreDocument;
  @Input() fields: any;
  @Input() mapData: any[] = [];
  @Input() imageData: {[key: string]: any} = {};
  @Input() formLogo?: string;
}
