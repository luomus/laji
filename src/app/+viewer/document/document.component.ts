import { Component, Input, OnChanges, ViewChild, AfterViewInit } from '@angular/core';
import { WarehouseApi } from '../../shared/api/WarehouseApi';
import { Observable } from 'rxjs/Observable';
import { TriplestoreLabelService } from '../../shared/service/triplestore-label.service';
import { ViewerMapComponent } from '../viewer-map/viewer-map.component';
import { SessionStorage } from 'ng2-webstorage';

@Component({
  selector: 'laji-document',
  templateUrl: './document.component.html',
  styleUrls: ['./document.component.css']
})
export class DocumentComponent implements AfterViewInit, OnChanges {
  @ViewChild(ViewerMapComponent) map: ViewerMapComponent;
  @Input() uri: string;
  @Input() highlight: string;
  @Input() showTitle = false;
  @Input() useWorldMap = true;
  document: any;
  activeGathering: any;
  mapData: any = [];
  hasDoc: boolean;
  active = 0;
  @SessionStorage() showFacts = false;
  private _uri: string;

  constructor(private warehouseApi: WarehouseApi, private labelService: TriplestoreLabelService) { }

  ngAfterViewInit() {
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
    if (this.document && this.document.gatherings) {
      this.activeGathering = this.document.gatherings[i] || {};
    }
    if (this.map) {
      this.map.setActiveIndex(i);
    }
  }

  toggleFacts() {
    this.showFacts = !this.showFacts;
  }

  private parseDoc(doc, found) {
    this.hasDoc = found;
    this.document = doc;
    this.mapData = [];
    let activeIdx = 0;
    if (doc && doc.gatherings) {
      doc.gatherings.map((gathering, idx) => {
        if (gathering.conversions && gathering.conversions.wgs84Geo) {
          this.mapData[idx] = gathering.conversions.wgs84Geo;
        }
        if (this.highlight && gathering.gatheringId === this.highlight) {
          activeIdx = idx;
        }
        if (gathering.units) {
          gathering.units.map(unit => {
            if (this.highlight && unit.unitId === this.highlight) {
              activeIdx = idx;
            }
          });
        }
      });
    }
    this.setActive(activeIdx);
  }

}
