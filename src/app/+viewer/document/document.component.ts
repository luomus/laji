import { AfterViewInit, Component, Input, OnChanges, OnDestroy, ViewChild } from '@angular/core';
import { WarehouseApi } from '../../shared/api/WarehouseApi';
import { Observable } from 'rxjs/Observable';
import { TriplestoreLabelService } from '../../shared/service/triplestore-label.service';
import { ViewerMapComponent } from '../viewer-map/viewer-map.component';
import { SessionStorage } from 'ng2-webstorage';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'laji-document',
  templateUrl: './document.component.html',
  styleUrls: ['./document.component.css']
})
export class DocumentComponent implements AfterViewInit, OnChanges, OnDestroy {
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
  isViewInited = false;
  @SessionStorage() showFacts = false;
  private _uri: string;
  private readonly recheckIterval = 10000; // check every 10sec if document not found
  private interval: Subscription;

  constructor(private warehouseApi: WarehouseApi, private labelService: TriplestoreLabelService) { }

  ngAfterViewInit() {
    this.isViewInited = true;
    this.updateDocument();
  }

  ngOnChanges() {
    this.hasDoc = undefined;
    if (this.isViewInited) {
      this.updateDocument();
    }
  }

  ngOnDestroy() {
    if (this.interval) {
      this.interval.unsubscribe();
    }
  }

  updateDocument() {
    if (!this.uri) {
      return;
    }
    const findDox$ = this.uri === this._uri ?
      Observable.of(this.document) :
      this.labelService.get('MY.person')
        .switchMap(() => this.warehouseApi.warehouseQuerySingleGet(this.uri))
        .map(doc => doc.document)
        .do(() => this._uri = this.uri);
    findDox$
      .subscribe(
        doc => this.parseDoc(doc, doc),
        err => this.parseDoc(undefined, false)
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
    if (found) {
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
      if (this.interval) {
        this.interval.unsubscribe();
      }
    } else if (!this.interval) {
      this.interval = Observable
        .interval(this.recheckIterval)
        .subscribe(() => this.updateDocument());
    }
  }

}
