import { Component, OnInit, Input } from '@angular/core';
import { Document } from '../../../../shared/model/Document';

@Component({
  selector: 'laji-collection-contest-print',
  templateUrl: './collection-contest-print.component.html',
  styleUrls: ['./collection-contest-print.scss']
})
export class CollectionContestPrintComponent implements OnInit {
  @Input() document: Document;
  @Input() fields: any;
  @Input() mapData: any[] = [];
  @Input() imageData: {[key: string]: any} = {};
  @Input() formLogo: string;

  constructor() {console.log(this.fields); }

  ngOnInit() { }

}
