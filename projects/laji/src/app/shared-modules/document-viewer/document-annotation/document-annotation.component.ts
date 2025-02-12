
import { tap, map, filter, switchMap, take, catchError } from 'rxjs/operators';
import {
  AfterViewInit,
  ApplicationRef,
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
import { isIctAdmin, UserService } from '../../../shared/service/user.service';
import { Global } from '../../../../environments/global';
import { Annotation } from '../../../shared/model/Annotation';
import { Person } from '../../../shared/model/Person';
import { DocumentViewerChildComunicationService } from '../document-viewer-child-comunication.service';
import { TaxonTagEffectiveService } from '../taxon-tag-effective.service';
import { LoadingElementsService } from '../loading-elements.service';
import { CheckFocusService } from '../check-focus.service';
import { TranslateService } from '@ngx-translate/core';
import { AnnotationService } from '../service/annotation.service';
import { DocumentToolsService } from '../document-tools.service';
import { AnnotationTag } from '../../../shared/model/AnnotationTag';
import { TemplateForm } from '../../own-submissions/models/template-form';
import { Router } from '@angular/router';
import { LocalizeRouterService } from '../../../locale/localize-router.service';
import { DeleteOwnDocumentService } from '../../../shared/service/delete-own-document.service';
import { DocumentPermissionService } from '../service/document-permission.service';

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
  @ViewChild(ViewerMapComponent) map?: ViewerMapComponent;
  @Input({ required: true }) uri!: string;
  @Input() highlight?: string;
  @Input() own?: boolean;
  @Input() result?: Array<any>;
  @Input() showTitle = false;
  @Input() useWorldMap = true;
  @Input() openAnnotation = false;
  @Input() hideHeader = false;
  @Input() identifying = false;

  @Output() annotationClose = new EventEmitter<boolean>();
  @Output() deleteDoc = new EventEmitter<string>();

  collectionContestFormId = Global.forms.collectionContest;

  externalViewUrl?: string;
  document: any;
  documentID?: string;
  personID?: string;
  isEditor = false;
  personRoleAnnotation?: Annotation.AnnotationRoleEnum;
  activeGathering: any;
  mapData: any = [];
  hasMapData = false;
  hasDoc?: boolean;
  active = 0;
  unitCnt?: number;
  isViewInited = false;
  showOnlyHighlighted = true;
  indexPagination?: number;
  isNavigation = false;
  childEvent = false;
  childComunicationsubscription!: Subscription;
  showShortcuts = false;
  documentToolsOpen = false;
  showCoordinates = true;
  @SessionStorage() showFacts = false;
  private readonly recheckIterval = 10000; // check every 10sec if document not found
  private interval?: Subscription;
  private metaFetch!: Subscription;
  annotationResolving?: boolean;
  subscriptParent!: Subscription;
  subscriptFocus!: Subscription;
  isfocusedCommentTaxon = false;
  currentLang!: string;
  hasEditors?: boolean;
  unitOrImgExists?: boolean;
  subscriptDocumentTools!: Subscription;
  annotationTags$!: Observable<AnnotationTag[]>;
  templateForm: TemplateForm = {
    name: '',
    description: ''
  };


  constructor(
    private warehouseApi: WarehouseApi,
    private userService: UserService,
    private cd: ChangeDetectorRef,
    private appRef: ApplicationRef,
    private childComunication: DocumentViewerChildComunicationService,
    private taxonTagEffective: TaxonTagEffectiveService,
    private loadingElements: LoadingElementsService,
    private focus: CheckFocusService,
    private translate: TranslateService,
    private documentToolsService: DocumentToolsService,
    private annotationService: AnnotationService,
    private router: Router,
    private localizeRouterService: LocalizeRouterService,
    private deleteDocumentService: DeleteOwnDocumentService,
    private documentPermissionService: DocumentPermissionService
  ) { }

  ngOnInit() {
    this.annotationTags$ = this.annotationService.getAllTags(this.translate.currentLang);
    this.currentLang = this.translate.currentLang;
    this.metaFetch = this.userService.user$.subscribe(person => {
      if (!person) {
        this.personRoleAnnotation = Annotation.AnnotationRoleEnum.basic;
        this.cd.markForCheck();
        return;
      }

      this.personID = person.id;

      if (isIctAdmin(person)) {
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

    this.childComunicationsubscription = this.childComunication.childEventListner().subscribe(info => {
      this.childEvent = info;
      this.cd.markForCheck();
    });

    this.subscriptFocus = this.focus.childEventListner().subscribe(info => {
      this.isfocusedCommentTaxon = info;
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
    if (this.subscriptParent) {
      this.subscriptParent.unsubscribe();
      this.childComunicationsubscription.unsubscribe();
    }
    if (this.subscriptDocumentTools) {
      this.subscriptDocumentTools.unsubscribe();
      this.childComunicationsubscription.unsubscribe();
    }
    if (this.subscriptFocus) {
      this.subscriptFocus.unsubscribe();
      this.childComunicationsubscription.unsubscribe();
    }
  }

  onShowModalChange(state: boolean) {
    this.childEvent = state;
    this.cd.markForCheck();
  }

  updateDocument() {
    if (!this.uri) {
      return;
    }
    const findDoc$ = this.warehouseApi
      .warehouseQuerySingleGet(this.uri, this.own ? {editorOrObserverPersonToken: this.userService.getToken()} : undefined).pipe(
        catchError((errors) => this.own ? this.warehouseApi.warehouseQuerySingleGet(this.uri) : observableThrowError(errors)),
        map((doc) => doc.document),
        tap((doc) => this.showOnlyHighlighted = this.shouldOnlyShowHighlighted(doc, this.highlight))
      );

    const docAndRights$ = findDoc$.pipe(
      switchMap(doc => this.documentPermissionService.getRightsToWarehouseDocument(doc).pipe(
        map(rights => ({doc, rights}))
      ))
    );

    docAndRights$
      .subscribe(({doc, rights}) => {
        this.isEditor = rights.isEditor;
        this.parseDoc(doc, doc);
      },
        () => this.parseDoc(undefined, false)
      );
  }

  shouldOnlyShowHighlighted(doc: any, highlight?: string) {
    if (!highlight) {
      return false;
    }
    if (
      (doc.gatheringId && doc.gatheringId === highlight) ||
      (doc.unitId && doc.unitId === highlight)
    ) {
      return true;
    }
    return ['gatherings', 'units'].some(level =>
      doc[level]?.some((subLevel: any) => this.shouldOnlyShowHighlighted(subLevel, highlight))
    );
  }

  setActive(i: number) {
    this.active = i;
    if (this.document && this.document?.gatherings) {
      this.activeGathering = this.document?.gatherings[i] || {};
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

  toggleShowOnlyHighlighted() {
    this.showOnlyHighlighted = !this.showOnlyHighlighted;
  }

  private parseDoc(doc: any, found: boolean) {
    this.cd.detectChanges();
    this.hasDoc = found;
    this.hasEditors = false;
    this.unitCnt = 0;
    if (found) {
      this.document = doc;
      this.hasMapData = false;
      const mapData: any[] = [];
      this.externalViewUrl = (Global.externalViewers as Record<string, string>)[doc.sourceId] ?
        (Global.externalViewers as Record<string, string>)[doc.sourceId].replace('%uri%', doc.documentId) : '';
      if (doc.documentId) {
        this.documentID = IdService.getId(doc.documentId);
      }
      let activeIdx = 0;
      if (doc && doc.gatherings) {
        doc.gatherings.map((gathering: any, idx: number) => {
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
            gathering.units.map((unit: any) => {
              if (this.highlight && unit.unitId === this.highlight) {
                activeIdx = idx;
              }
            });
          }
        });
      }
      this.mapData = mapData;
      this.setActive(activeIdx);
      if (this.document?.linkings && this.document?.linkings.editors &&
        this.document?.linkings?.editors.filter((e: any) => e.id !== undefined).length > 0) {
        this.hasEditors = true;
      }

      this.unitOrImgExists = this.document.gatherings?.some(({units}: {units: any}) =>
        (units || []).some((unit: any) =>
          unit.unitId === this.highlight || (unit.media || []).some((media: any) => media.fullURL === this.highlight)
        )
      );


      if (this.result) {
        this.indexPagination = this.getIndexPagination();
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
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.indexPagination! += 1;
    this.move();
  }

  previous() {
      this.isNavigation = true;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.indexPagination! -= 1;
      this.move();
  }

  getIndexPagination() {
    return this.result?.findIndex(i => (i.fullURL === this.highlight || i.unit?.unitId === this.highlight));
  }

  closeDocument() {
    if (this.documentToolsOpen) {
      this.annotationClose.emit(false);
    } else {
    this.annotationClose.emit(true);
    }
  }

  toggleShortcuts() {
    this.showShortcuts = !this.showShortcuts;
  }

  onDocumentDeleted(e: any) {
    if (e) {
      this.deleteDocumentService.emitChildEvent(e);
      this.closeDocument();
      this.deleteDocumentService.emitChildEvent(null);

      /*this.router.navigate(
        this.localizeRouterService.translateRoute(['/vihko/ownSubmissions/'])
      );*/
    }
  }

  onManualLinkClick(event: MouseEvent) {
    event.stopPropagation();
  }


  @HostListener('document:keydown', ['$event'])
  annotationKeyDown(e: KeyboardEvent) {
      if (e.keyCode === 37 && !this.childEvent && !this.isfocusedCommentTaxon && !this.documentToolsOpen) { // left
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        if (this.result && this.indexPagination! > 0) {
          e.preventDefault();
          this.previous();
        }
      }

      if (e.keyCode === 39 && !this.childEvent && !this.isfocusedCommentTaxon && !this.documentToolsOpen) { // right
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        if (this.result && this.indexPagination! < this.result.length - 1) {
          e.preventDefault();
          this.next();
        }
      }

      if (e.keyCode === 187 && e.altKey) { // alt + ? --> open shortcuts div
        e.preventDefault();
        this.toggleShortcuts();
      }

    if (e.keyCode === 27 && !this.childEvent && !this.documentToolsOpen) {
       e.preventDefault();
       this.closeDocument();
      }

  }

  private move() {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const documentOrImage = this.result![this.indexPagination!];
    this.uri = documentOrImage.documentId || documentOrImage.document?.documentId;
    this.highlight = documentOrImage.fullURL || documentOrImage.unit?.unitId;
    this.showShortcuts = false;
    this.cd.markForCheck();
    this.updateDocument();
  }

}


