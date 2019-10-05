
import { startWith, tap, map, filter, switchMap, take, catchError, retryWhen, delay, concat } from 'rxjs/operators';
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
  ViewChild,
  Output,
  EventEmitter
} from '@angular/core';
import { WarehouseApi } from '../../../shared/api/WarehouseApi';
import { interval as ObservableInterval, Subscription, throwError as observableThrowError, Observable } from 'rxjs';
import { ViewerMapComponent } from '../viewer-map/viewer-map.component';
import { SessionStorage } from 'ngx-webstorage';
import { IdService } from '../../../shared/service/id.service';
import { UserService } from '../../../shared/service/user.service';
import { Global } from '../../../../environments/global';
import { Annotation } from '../../../shared/model/Annotation';
import { Person } from '../../../shared/model/Person';
import { PagedResult } from 'app/shared/model/PagedResult';

@Component({
  selector: 'laji-document-annotation',
  templateUrl: './document-annotation.component.html',
  styleUrls: ['./document-annotation.component.scss']
})
export class DocumentAnnotationComponent implements AfterViewInit, OnChanges, OnInit, OnDestroy {
  @ViewChild(ViewerMapComponent, { static: false }) map: ViewerMapComponent;
  @Input() uri: string;
  @Input() highlight: string;
  @Input() own: boolean;
  @Input() result: Array<any>;
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
  personRoleAnnotation: Annotation.AnnotationRoleEnum;
  activeGathering: any;
  mapData: any = [];
  hasMapData = false;
  hasDoc: boolean;
  active = 0;
  unitCnt;
  isViewInited = false;
  showOnlyHighlighted = true;
  indexPagination: number;
  isNavigation = false;
  @SessionStorage() showFacts = false;
  private _uri: string;
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
    this.metaFetch = this.userService.user$.subscribe((person: Person) => {
      this.personID = person.id;
      if (person.roleAnnotation) {
        this.personRoleAnnotation = person.roleAnnotation;
      } else {
        this.personRoleAnnotation = Annotation.AnnotationRoleEnum.basic;
      }
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
        tap((doc) => this.showOnlyHighlighted = this.shouldOnlyShowHighlighted(doc, this.highlight))
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
    if (
      (doc.gatheringId && doc.gatheringId === highlight) ||
      (doc.unitId && doc.unitId === highlight)
    ) {
      return true;
    }
    let hasHighlight = false;
    ['gatherings', 'units'].forEach(level => {
      if (Array.isArray(doc[level])) {
        doc[level].forEach(subLevel => {
          if (hasHighlight) {
            return hasHighlight;
          }
          hasHighlight = this.shouldOnlyShowHighlighted(subLevel, highlight);
        });
      }
    });
    return hasHighlight;
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

    /*if (this.isNavigation) {
      this.map.data = this.mapData;
      this.map.initDataAnnotation(i);
      this.isNavigation = false;
    } else {
      if (this.map) {
        this.map.setActiveIndex(i);
      }
    }*/
    if (this.mapData.length > 0 ) {

    } else {
      this.map = undefined;
    }



    if (this.map) {
      this.map.data = this.mapData;
      this.map.useWorldMap = this.useWorldMap;
        this.map.setActiveIndex(i);
    }

  }

  toggleFacts() {
    this.showFacts = !this.showFacts;
  }

  toggleShowOnlyHighlighted() {
    this.showOnlyHighlighted = !this.showOnlyHighlighted;
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
          if (gathering.units) {
            this.unitCnt += gathering.units.length;
            gathering.units.map(unit => {
              if (this.highlight && unit.unitId === this.highlight) {
                activeIdx = idx;
              }
            });
          }
        });
      }
      this.mapData = mapData;
      this.setActive(activeIdx);

      if (this.result) {
        this.indexPagination = this.setIndexPagination();
      }

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

  next() {
    this.isNavigation = true;
    this.indexPagination += 1;
    this.document = this.result[this.indexPagination].document;
    this.uri = this.result[this.indexPagination].document.documentId;
    this.highlight = this.result[this.indexPagination].unit.unitId;
    this.cd.markForCheck();
    this.updateDocument();
  }


  previous() {
      this.isNavigation = true;
      this.indexPagination -= 1;
      this.document = this.result[this.indexPagination].document;
      this.uri = this.result[this.indexPagination].document.documentId;
      this.highlight = this.result[this.indexPagination].unit.unitId;
      this.cd.markForCheck();
      this.updateDocument();

  }

  setIndexPagination() {
    return this.result.findIndex(i => i.unit.unitId === this.highlight);
  }

}


