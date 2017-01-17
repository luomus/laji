import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { WarehouseApi } from '../../shared/api/WarehouseApi';

@Component({
  selector: 'laji-document',
  templateUrl: './document.component.html',
  styleUrls: ['./document.component.css']
})
export class DocumentComponent implements OnInit, OnChanges {

  @Input() uri: string;
  document: Object;
  private _uri: string;

  constructor(private warehouseApi: WarehouseApi) { }

  ngOnInit() {
    this.updateDocument();
  }

  ngOnChanges() {
    this.updateDocument();
  }

  updateDocument() {
    if (this.uri === this._uri) {
      return;
    }
    this._uri = this.uri;
    this.warehouseApi
      .warehouseQuerySingleGet(this.uri)
      .map(doc => doc.document)
      .subscribe(
        doc => this.document = doc,
        err => this.document = {}
      );
  }

}
