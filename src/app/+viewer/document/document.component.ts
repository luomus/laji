import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { WarehouseApi } from '../../shared/api/WarehouseApi';
import { Observable } from 'rxjs/Observable';
import { ViewerMapComponent } from '../viewer-map/viewer-map.component';
import { SessionStorage } from 'ng2-webstorage';
import { Subscription } from 'rxjs/Subscription';
import { IdService } from '../../shared/service/id.service';
import { UserService } from '../../shared/service/user.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'laji-document',
  templateUrl: './document.component.html',
  styleUrls: ['./document.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocumentComponent implements AfterViewInit, OnChanges, OnInit, OnDestroy {
  @ViewChild(ViewerMapComponent) map: ViewerMapComponent;
  @Input() uri: string;
  @Input() highlight: string;
  @Input() own: boolean;
  @Input() showTitle = false;

  useWorldMap = true;
  externalViewUrl: string;
  document: any;
  documentID: string;
  editors: string[];
  personID: string;
  activeGathering: any;
  mapData: any = [];
  hasDoc: boolean;
  active = 0;
  isViewInited = false;
  @SessionStorage() showFacts = false;
  private _uri: string;
  private readonly recheckIterval = 10000; // check every 10sec if document not found
  private interval: Subscription;
  private metaFetch: Subscription;

  constructor(
    private warehouseApi: WarehouseApi,
    private userService: UserService,
    private changeDetector: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.metaFetch = this.userService.action$
      .startWith('')
      .switchMap(() => this.userService.getUser())
      .subscribe(person => {
        this.personID = person.id;
        this.updateView();
      });
  }

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
    if (this.metaFetch) {
      this.metaFetch.unsubscribe();
    }
  }

  updateDocument() {
    if (!this.uri) {
      return;
    }
    const findDox$ = this.uri === this._uri ?
      Observable.of(this.document) :
      this.warehouseApi
        .warehouseQuerySingleGet(this.uri, this.own ? {
          editorOrObserverPersonToken: this.userService.getToken()
        } : undefined)
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
    this.useWorldMap = !(
      this.activeGathering.interpretations &&
      this.activeGathering.interpretations.country &&
      this.activeGathering.interpretations.country === 'http://tun.fi/ML.206'
    );

    if (this.map) {
      this.map.setActiveIndex(i);
    }
  }

  toggleFacts() {
    this.showFacts = !this.showFacts;
  }

  updateView() {
    this.changeDetector.markForCheck();
  }

  private parseDoc(doc, found) {
    this.hasDoc = found;
    if (found) {
      this.document = doc;
      this.mapData = [];
      this.externalViewUrl = environment.externalViewers[doc.sourceId] ?
        environment.externalViewers[doc.sourceId].replace('%uri%', doc.documentId) : '';
      if (doc.documentId) {
        this.documentID = IdService.getId(doc.documentId);
      }
      if (doc.editorUserIds) {
        this.editors = doc.editorUserIds.map(editor => IdService.getId(editor));
      } else {
        this.editors = [];
      }
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
    this.updateView();
  }

}
