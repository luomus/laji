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
  ViewChild,
  HostListener,
  Output,
  EventEmitter
} from '@angular/core';
import { WarehouseApi } from '../../../shared/api/WarehouseApi';
import { interval as ObservableInterval, Observable, Subscription, throwError as observableThrowError } from 'rxjs';
import { ViewerMapComponent } from '../viewer-map/viewer-map.component';
import { SessionStorage } from 'ngx-webstorage';
import { IdService } from '../../../shared/service/id.service';
import { UserService } from '../../../shared/service/user.service';
import { Global } from '../../../../environments/global';
import { TranslateService } from '@ngx-translate/core';
import { DocumentViewerChildComunicationService } from '../document-viewer-child-comunication.service';
import { TaxonTagEffectiveService } from '../taxon-tag-effective.service';
import { DocumentToolsService } from '../document-tools.service';
import { AnnotationService } from '../service/annotation.service';
import { AnnotationTag } from '../../../shared/model/AnnotationTag';
import { TemplateForm } from '../../own-submissions/models/template-form';
import { Router } from '@angular/router';
import { LocalizeRouterService } from '../../../locale/localize-router.service';
import { DeleteOwnDocumentService } from '../../../shared/service/delete-own-document.service';



@Component({
  selector: 'laji-document',
  templateUrl: './document.component.html',
  styleUrls: ['./document.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocumentComponent implements AfterViewInit, OnChanges, OnInit, OnDestroy {
  @ViewChild(ViewerMapComponent) map: ViewerMapComponent;
  @Input() uri: string;
  @Input() own: boolean;
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
  activeGathering: any;
  mapData: any = [];
  hasMapData = false;
  hasDoc: boolean;
  active = 0;
  unitCnt;
  isViewInited = false;
  showOnlyHighlighted = true;
  childEvent = false;
  documentToolsOpen = false;
  childComunicationsubscription: Subscription;
  highlightParents: string[] = [];
  @SessionStorage() showFacts = false;
  private _highlight: string;
  private readonly recheckIterval = 10000; // check every 10sec if document not found
  private interval: Subscription;
  private metaFetch: Subscription;
  subscriptParent: Subscription;
  subscriptDocumentTools: Subscription;
  annotationResolving: boolean;
  annotationTags$: Observable<AnnotationTag[]>;
  templateForm: TemplateForm = {
    name: '',
    description: '',
    type: 'gathering'
  };


  constructor(
    private warehouseApi: WarehouseApi,
    private userService: UserService,
    private cd: ChangeDetectorRef,
    private appRef: ApplicationRef,
    private childComunication: DocumentViewerChildComunicationService,
    private taxonTagEffective: TaxonTagEffectiveService,
    private annotationService: AnnotationService,
    private documentToolsService: DocumentToolsService,
    private translate: TranslateService,
    private router: Router,
    private localizeRouterService: LocalizeRouterService,
    private deleteDocumentService: DeleteOwnDocumentService
  ) { }

  ngOnInit() {
    this.annotationTags$ = this.annotationService.getAllTags(this.translate.currentLang);
    this.metaFetch = this.userService.user$.subscribe(person => {
      this.personID = person.id;
      this.cd.markForCheck();
    });

    this.childComunicationsubscription = this.childComunication.childEventListner().subscribe(info => {
      this.childEvent = info;
      this.cd.markForCheck();
   });

   this.subscriptDocumentTools = this.documentToolsService.childEventListner().subscribe(toolsOpen => {
    this.documentToolsOpen = toolsOpen;
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
    if (this.subscriptDocumentTools) {
      this.subscriptDocumentTools.unsubscribe();
      this.childComunicationsubscription.unsubscribe();
    }
    if (this.subscriptParent) {
      this.subscriptParent.unsubscribe();
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
        tap((doc) => {
          this.highlightParents = [];
          this.showOnlyHighlighted = this.shouldOnlyShowHighlighted(doc, this.highlight);
        })
      );
    findDox$
      .subscribe(
        doc => this.parseDoc(doc, doc),
        () => this.parseDoc(undefined, false)
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
      let activeGatheringIdx = 0;
      if (doc && doc.gatherings) {
        doc.gatherings.map((gathering, gatheringIdx) => {
          if (gathering.conversions && gathering.conversions.wgs84Geo) {
            mapData[gatheringIdx] = {
              ...gathering.conversions,
              geoJSON: gathering.conversions.wgs84Geo,
              coordinateAccuracy: gathering.interpretations && gathering.interpretations.coordinateAccuracy,
              sourceOfCoordinates: gathering.interpretations && gathering.interpretations.sourceOfCoordinates
            };
            this.hasMapData = true;
          }
          if (this.highlight && gathering.gatheringId === this.highlight) {
            activeGatheringIdx = gatheringIdx;
          }
          if (gathering.units && this.highlight) {
            this.unitCnt += gathering.units.length;
            gathering.units.forEach(unit => {
              if (unit.samples) {
                unit.samples.forEach(sample => {
                  if (sample.sampleId === this.highlight) {
                    activeGatheringIdx = gatheringIdx;
                  }
                });
              }
              if (unit.unitId === this.highlight) {
                activeGatheringIdx = gatheringIdx;
              }
            });
          }
        });
      }
      this.mapData = mapData;
      this.setActive(activeGatheringIdx);
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

  closeDocument() {
    this.close.emit(!this.documentToolsOpen);
  }

  onDocumentDeleted(e) {
    if (e) {
      this.deleteDocumentService.emitChildEvent(e);
      this.closeDocument();
      this.deleteDocumentService.emitChildEvent(null);
    }
  }


  @HostListener('document:keydown', ['$event'])
  annotationKeyDown(e: KeyboardEvent) {
    if (e.keyCode === 27 && !this.childEvent && !this.documentToolsOpen) {
       e.stopImmediatePropagation();
       this.closeDocument();
      }
  }


}
