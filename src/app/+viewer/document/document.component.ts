import { Component, OnInit, Input, OnChanges, ViewChild } from '@angular/core';
import { WarehouseApi } from '../../shared/api/WarehouseApi';
import { Observable } from 'rxjs/Observable';
import { TriplestoreLabelService } from '../../shared/service/triplestore-label.service';
import { ViewerMapComponent } from '../viewer-map/viewer-map.component';

@Component({
  selector: 'laji-document',
  templateUrl: './document.component.html',
  styleUrls: ['./document.component.css']
})
export class DocumentComponent implements OnInit, OnChanges {
  @ViewChild(ViewerMapComponent) map: ViewerMapComponent;
  @Input() uri: string;
  @Input() highlight: string;
  @Input() showTitle = false;
  document: any;
  activeGathering: any;
  mapData: any = [];
  hasDoc: boolean;
  active = 0;
  private _uri: string;

  constructor(private warehouseApi: WarehouseApi, private labelService: TriplestoreLabelService) { }

  ngOnInit() {
    this.updateDocument();
  }

  ngOnChanges() {
    this.updateDocument();
  }

  updateDocument() {
    this.hasDoc = undefined;
    if (!this.uri) {
      this.parseDoc({}, false);
      return;
    }
    const findDox$ = this.uri === this._uri ?
      Observable.of(this.document) :
      this.labelService.get('MY.person')
        .switchMap(() => this.warehouseApi.warehouseQuerySingleGet(this.uri))
        .map(doc => doc.document);
    this._uri = this.uri;
    findDox$
      .subscribe(
        doc => this.parseDoc(doc, true),
        err => this.parseDoc({}, false)
      );
  }

  setActive(i) {
    this.active = i;
    if (this.map) {
      this.map.setActiveIndex(i);
    }
  }

  private parseDoc(doc, found) {
    this.hasDoc = found;
    this.document = doc;
    this.mapData = [];
    this.setActive(0);
    if (this.highlight && doc.gatherings) {
      doc.gatherings.map((gathering, idx) => {
        this.mapData[idx] = gathering.conversions && gathering.conversions.wgs84Geo ?
          gathering.conversions.wgs84Geo : {};
        if (this.highlight && gathering.gatheringId === this.highlight) {
          this.setActive(idx);
        }
        if (gathering.units) {
          gathering.units.map(unit => {
            if (this.highlight && unit.unitId === this.highlight) {
              this.setActive(idx);
            }
          });
        }
      });
    }
  }

}
