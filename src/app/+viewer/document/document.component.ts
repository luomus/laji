import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { WarehouseApi } from '../../shared/api/WarehouseApi';

@Component({
  selector: 'laji-document',
  templateUrl: './document.component.html',
  styleUrls: ['./document.component.css']
})
export class DocumentComponent implements OnInit, OnChanges {

  @Input() uri: string;
  item: Object;
  mapData: Object[] = [];
  hasDoc: boolean;
  active = 0;
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
        doc => this.parseDoc(doc, true),
        err => this.parseDoc({}, false)
      );
  }

  setActive(i) {
    this.active = i;
  }

  private parseDoc(doc, found) {
    this.hasDoc = found;
    this.item = doc;
    this.mapData = [];
    if (doc.gatherings) {
      doc.gatherings.map(gathering => {
        if (gathering.conversions && gathering.conversions.wgs84Geo) {
          this.mapData.push(gathering.conversions.wgs84Geo);
        }
      });
    }
  }

}
