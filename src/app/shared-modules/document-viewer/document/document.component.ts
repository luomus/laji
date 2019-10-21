import { catchError, filter, map, switchMap, take, tap } from 'rxjs/operators';
import {
  AfterViewInit,
  ApplicationRef,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { WarehouseApi } from '../../../shared/api/WarehouseApi';
import { interval as ObservableInterval, Subscription, throwError as observableThrowError } from 'rxjs';
import { ViewerMapComponent } from '../viewer-map/viewer-map.component';
import { SessionStorage } from 'ngx-webstorage';
import { IdService } from '../../../shared/service/id.service';
import { UserService } from '../../../shared/service/user.service';
import { Global } from '../../../../environments/global';


@Component({
  selector: 'laji-document',
  templateUrl: './document.component.html',
  styleUrls: ['./document.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocumentComponent implements AfterViewInit, OnChanges, OnInit, OnDestroy {
  @ViewChild(ViewerMapComponent, { static: false }) map: ViewerMapComponent;
  @Input() uri: string;
  @Input() own: boolean;
  @Input() showTitle = false;
  @Input() useWorldMap = true;
  @Input() openAnnotation = false;
  @Input() hideHeader = false;
  @Input() identifying = false;

  collectionContestFormId = Global.forms.collectionContest;

  externalViewUrl: string;
  document: any;
  documentID: string;
  editors: string[];
  personID: string;
  activeGathering: any;
  mapData: any = [];
  hasMapData = false;
  hasDoc: boolean;
  active = 0;
  unitCnt;
  isViewInited = false;
  showOnlyHighlighted = true;
  highlightParents: string[] = [];
  @SessionStorage() showFacts = false;
  private _uri: string;
  private _highlight: string;
  private readonly recheckIterval = 10000; // check every 10sec if document not found
  private interval: Subscription;
  private metaFetch: Subscription;

  constructor(
    private warehouseApi: WarehouseApi,
    private userService: UserService,
    private cd: ChangeDetectorRef,
    private appRef: ApplicationRef
  ) { }

  ngOnInit() {
    this.metaFetch = this.userService.user$.subscribe(person => {
      this.personID = person.id;
      this.cd.markForCheck();
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
    const findDox$ = this.warehouseApi
      .warehouseQuerySingleGet(this.uri, this.own ? {editorOrObserverPersonToken: this.userService.getToken()} : undefined).pipe(
        catchError((errors) => this.own ? this.warehouseApi.warehouseQuerySingleGet(this.uri) : observableThrowError(errors)),
        map(doc => doc.document),
        tap((doc) => {
          this.highlightParents = [];
          this.showOnlyHighlighted = this.shouldOnlyShowHighlighted(doc, this.highlight);
        })
      );
    findDox$
      .subscribe(
        doc => this.parseDoc(doc, doc),
        err => this.parseDoc(undefined, false)
      );
  }

  shouldOnlyShowHighlighted(doc, highlight) {
    if (!highlight) {
      return false;
    }
    const id = this.getId(doc);
    if (id === highlight) {
      this.highlightParents.push(id);
      return true;
    }
    let hasHighlight = false;
    ['gatherings', 'units', 'samples'].forEach(level => {
      if (Array.isArray(doc[level])) {
        doc[level].forEach(subLevel => {
          if (!hasHighlight) {
            hasHighlight = this.shouldOnlyShowHighlighted(subLevel, highlight);
            if (hasHighlight) {
              this.highlightParents.push(id);
            }
          }
        });
      }
    });
    return hasHighlight;
  }

  @Input() set highlight(id: string) {
    this._highlight = IdService.getUri(id);
  }

  get highlight() {
    return this._highlight;
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

  toggleShowOnlyHighlighted() {
    this.showOnlyHighlighted = !this.showOnlyHighlighted;
  }

  private getId(doc): string {
    let id = '';
    ['documentId', 'gatheringId', 'unitId', 'sampleId'].forEach(field => {
      if (doc[field]) {
        id = doc[field];
      }
    });
    return id;
  }

  private parseDoc(doc, found) {
    this.hasDoc = found;
    this.unitCnt = 0;
    if (found) {
      this.document = doc;
      this.hasMapData = false;
      const mapData = [];
      this.externalViewUrl = Global.externalViewers[doc.sourceId] ?
        Global.externalViewers[doc.sourceId].replace('%uri%', doc.documentId) : '';
      if (doc.documentId) {
        this.documentID = IdService.getId(doc.documentId);
      }
      if (doc.linkings && doc.linkings.editors) {
        this.editors = doc.linkings.editors.map(editor => IdService.getId(editor.id)).filter(val => val);
      } else {
        this.editors = [];
      }
      let activeIdx = 0;
      if (doc && doc.gatherings) {
        doc.gatherings.map((gathering, idx) => {
          if (gathering.conversions && gathering.conversions.wgs84Geo) {
            mapData[idx] = {
              ...gathering.conversions,
              geoJSON: gathering.conversions.wgs84Geo,
              coordinateAccuracy: gathering.interpretations && gathering.interpretations.coordinateAccuracy,
              sourceOfCoordinates: gathering.interpretations && gathering.interpretations.sourceOfCoordinates
            };
            this.hasMapData = true;
          }
          if (this.highlight && gathering.gatheringId === this.highlight) {
            activeIdx = idx;
          }
          if (gathering.units && this.highlight) {
            this.unitCnt += gathering.units.length;
            gathering.units.forEach(unit => {
              if (unit.samples) {
                unit.samples.forEach(sample => {
                  if (sample.sampleId === this.highlight) {
                    activeIdx = idx;
                  }
                });
              }
              if (unit.unitId === this.highlight) {
                activeIdx = idx;
              }
            });
          }
        });
      }
      this.mapData = mapData;
      this.setActive(activeIdx);
      if (this.interval) {
        this.interval.unsubscribe();
      }
    } else if (!this.interval) {
      this.interval = this.appRef.isStable.pipe(
          filter(stable => stable),
          take(1),
          switchMap(() => ObservableInterval(this.recheckIterval))
        ).subscribe(() => this.updateDocument());
    }
    this.cd.markForCheck();
  }

}
