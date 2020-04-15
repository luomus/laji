
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
  HostListener,
  Output,
  EventEmitter
} from '@angular/core';
import { WarehouseApi } from '../../../shared/api/WarehouseApi';
import { animate, style, transition, trigger } from '@angular/animations';
import { interval as ObservableInterval, Subscription, throwError as observableThrowError, Observable } from 'rxjs';
import { ViewerMapComponent } from '../viewer-map/viewer-map.component';
import { SessionStorage } from 'ngx-webstorage';
import { IdService } from '../../../shared/service/id.service';
import { UserService } from '../../../shared/service/user.service';
import { Global } from '../../../../environments/global';
import { Annotation } from '../../../shared/model/Annotation';
import { Person } from '../../../shared/model/Person';
import { DocumentViewerChildComunicationService } from '../../../shared-modules/document-viewer/document-viewer-child-comunication.service';
import { TaxonTagEffectiveService } from '../../../shared-modules/document-viewer/taxon-tag-effective.service';
import { LoadingElementsService } from '../../../shared-modules/document-viewer/loading-elements.service';
import { CheckFocusService } from '../../../shared-modules/document-viewer/check-focus.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'laji-document-annotation',
  templateUrl: './document-annotation.component.html',
  styleUrls: ['./document-annotation.component.scss'],
  animations: [
    trigger('shortcutsInOut', [
        transition('void => *', [
           style({opacity: 0, transform: 'translateX(-30px)'}),
            animate(400, style({transform: 'translateX(0px)', opacity: 1 }))
        ]),
        transition('* => void', [
            animate(400, style({opacity: 0, transform: 'translateX(-30px)'}))
        ])
    ])
  ]
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

  @Output() close = new EventEmitter<boolean>();

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
  unitCnt: number;
  isViewInited = false;
  showOnlyHighlighted = true;
  indexPagination: number;
  isNavigation = false;
  childEvent = false;
  childComunicationsubscription: Subscription;
  showShortcuts = false;
  showCoordinates = true;
  @SessionStorage() showFacts = false;
  private _uri: string;
  private readonly recheckIterval = 10000; // check every 10sec if document not found
  private interval: Subscription;
  private metaFetch: Subscription;
  annotationResolving: boolean;
  subscriptParent: Subscription;
  subscriptFocus: Subscription;
  isfocusedCommentTaxon = false;
  currentLang: string;


  constructor(
    private warehouseApi: WarehouseApi,
    private userService: UserService,
    private cd: ChangeDetectorRef,
    private appRef: ApplicationRef,
    private childComunication: DocumentViewerChildComunicationService,
    private taxonTagEffective: TaxonTagEffectiveService,
    private loadingElements: LoadingElementsService,
    private focus: CheckFocusService,
    private translate: TranslateService
  ) { }

  ngOnInit() {
    this.currentLang = this.translate.currentLang;
    this.metaFetch = this.userService.user$.subscribe((person: Person) => {
      this.personID = person.id;
      if (person.role) {
        this.personRoleAnnotation = Annotation.AnnotationRoleEnum.expert;
      } else {
        if (person.roleAnnotation) {
          this.personRoleAnnotation = person.roleAnnotation;
        } else {
          this.personRoleAnnotation = Annotation.AnnotationRoleEnum.basic;
        }
      }

      this.cd.markForCheck();
    });
    // this.personRoleAnnotation = Annotation.AnnotationRoleEnum.basic;


    this.childComunicationsubscription = this.childComunication.childEventListner().subscribe(info => {
      this.childEvent = info;
      this.cd.markForCheck();
    });

    this.subscriptFocus = this.focus.childEventListner().subscribe(info => {
      this.isfocusedCommentTaxon = info;
      this.cd.markForCheck();
    });

    this.subscriptParent = this.taxonTagEffective.childEventListner().subscribe(event => {
      this.annotationResolving = event;
      if (this.annotationResolving) {
        this.cd.markForCheck();
        this.updateDocument();
      }
    });

  }

  ngAfterViewInit() {
    this.isViewInited = true;
    this.updateDocument();
    this.cd.detectChanges();
  }

  ngOnChanges() {
    this.hasDoc = undefined;
    if (this.isViewInited) {
      this.updateDocument();
      this.cd.detectChanges();
    }
  }

  ngOnDestroy() {
    if (this.interval) {
      this.interval.unsubscribe();
      this.childComunicationsubscription.unsubscribe();
    }
    if (this.metaFetch) {
      this.metaFetch.unsubscribe();
      this.childComunicationsubscription.unsubscribe();
    }
    if (this.subscriptParent) {
      this.subscriptParent.unsubscribe();
      this.childComunicationsubscription.unsubscribe();
    }

    if (this.subscriptFocus) {
      this.subscriptFocus.unsubscribe();
      this.childComunicationsubscription.unsubscribe();
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

    if (this.mapData.length === 0 ) {
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
    this.cd.detectChanges();
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
    this.taxonTagEffective.emitChildEvent(false);
    this.loadingElements.emitChildEvent(false);
    this.cd.markForCheck();
  }

  next() {
    this.isNavigation = true;
    this.indexPagination += 1;
    this.document = this.result[this.indexPagination].document;
    this.uri = this.result[this.indexPagination].document.documentId;
    this.highlight = this.result[this.indexPagination].unit.unitId;
    this.showShortcuts = false;
    this.cd.markForCheck();
    this.updateDocument();
  }


  previous() {
      this.isNavigation = true;
      this.indexPagination -= 1;
      this.document = this.result[this.indexPagination].document;
      this.uri = this.result[this.indexPagination].document.documentId;
      this.highlight = this.result[this.indexPagination].unit.unitId;
      this.showShortcuts = false;
      this.cd.markForCheck();
      this.updateDocument();

  }

  setIndexPagination() {
    return this.result.findIndex(i => i.unit.unitId === this.highlight);
  }

  closeDocument() {
    this.close.emit(true);
  }

  toggleShortcuts() {
    this.showShortcuts = !this.showShortcuts;
  }


@HostListener('window:keydown', ['$event'])
  annotationKeyDown(e: KeyboardEvent) {
      if (e.keyCode === 37 && !this.childEvent && !this.isfocusedCommentTaxon) { // left
        if (this.result && this.indexPagination > 0) {
          this.previous();
        }
      }

      if (e.keyCode === 39 && !this.childEvent && !this.isfocusedCommentTaxon) { // right
        if (this.result && this.indexPagination < this.result.length - 1) {
          this.next();
        }
      }

      if (e.keyCode === 187 && e.altKey) { // alt + ? --> open shortcuts div
        this.toggleShortcuts();
      }

    if (e.keyCode === 27 && !this.childEvent) {
       e.stopImmediatePropagation();
       this.closeDocument();
      }

  }

}


