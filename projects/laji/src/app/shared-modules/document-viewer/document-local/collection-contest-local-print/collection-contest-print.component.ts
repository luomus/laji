import { Component, Input } from '@angular/core';
import { Document } from '../../../../shared/model/Document';

@Component({
  selector: 'laji-collection-contest-print',
  templateUrl: './collection-contest-print.component.html',
  styleUrls: ['./collection-contest-print.scss']
})
export class CollectionContestPrintComponent {
  @Input({ required: true }) document!: Document;
  @Input() fields: any;
  @Input() mapData: any[] = [];
  @Input() imageData: {[key: string]: any} = {};
  @Input() formLogo?: string;

}
