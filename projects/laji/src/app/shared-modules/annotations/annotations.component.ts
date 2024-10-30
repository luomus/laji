import { Component, EventEmitter, Input, OnInit, Output, ViewChild,
ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { AnnotationService } from '../document-viewer/service/annotation.service';
import { Annotation } from '../../shared/model/Annotation';
import { IdService } from '../../shared/service/id.service';
import { DocumentViewerFacade } from '../document-viewer/document-viewer.facade';
import {
  AnnotationFormAnnotation,
  AnnotationFormNewComponent
} from './annotation-form-new/annotation-form-new.component';
import {map, switchMap } from 'rxjs/operators';
import { Subscription, timer } from 'rxjs';
import { PagedResult } from '../../shared/model/PagedResult';
import { WarehouseQueryInterface } from '../../shared/model/WarehouseQueryInterface';
import { WarehouseApi } from '../../shared/api/WarehouseApi';
import { TaxonTagEffectiveService } from '../document-viewer/taxon-tag-effective.service';
import { LoadingElementsService } from '../document-viewer/loading-elements.service';
import { PlatformService } from '../../root/platform.service';
import { AnnotationTag } from '../../shared/model/AnnotationTag';

@Component({
  selector: 'laji-annotations',
  templateUrl: './annotations.component.html',
  styleUrls: ['./annotations.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush

})
export class AnnotationsComponent implements OnInit, OnDestroy {
  @Input({ required: true }) rootID!: string;
  @Input() targetID?: string;
  @Input() documentID?: string;
  @Input() isEditor?: boolean;
  @Input() personID?: string;
  @Input() personRoleAnnotation?: Annotation.AnnotationRoleEnum;
  @Input() identifying = false;
  @Input() unit: any;
  @Input() gathering: any;
  @Input() annotations: Annotation[] = [];
  @Input() formVisible?: boolean;
  @Input() listVisible?: boolean;
  @Input() annotationTags?: AnnotationTag[];
  @Output() annotationsClose = new EventEmitter<any>();
  @Output() annotationChange = new EventEmitter<Annotation>();
  @Output() loadingForm = new EventEmitter<any>();


  @ViewChild('formAnnotation') formAnnotation!: AnnotationFormNewComponent;
  error = false;
  adding = false;
  expert = true;
  type?: Annotation.TypeEnum;
  annotation!: AnnotationFormAnnotation;
  annotationRole = Annotation.AnnotationRoleEnum;
  loading = false;
  lastAnnotationAddedId?: string;
  result: PagedResult<any> = {
    currentPage: 1,
    lastPage: 1,
    results: [],
    total: 0,
    pageSize: 0
  };
  randomKeyBefore?: string;
  randomKeyAfter?: string;
  page = 1;
  subscribeRefreshedAnnotations?: Subscription;
  subscribeRefreshedAnnotations1?: Subscription;
  query: WarehouseQueryInterface = {};
  activeTags?: Annotation[];
  deleting = false;
  statusAction = {
    status: false,
    action: this.deleting ? 'deleting' : 'adding'
  };
  countCall = 0;



  constructor(
    private annotationService: AnnotationService,
    private documentViewerFacade: DocumentViewerFacade,
    private cd: ChangeDetectorRef,
    private warehouseApi: WarehouseApi,
    private taxonTagEffective: TaxonTagEffectiveService,
    private loadingElements: LoadingElementsService,
    private platformService: PlatformService
    ) { }

  ngOnInit() {
    this.initEmptyAnnotation();
    this.findRendomKey1();
    if (this.identifying) {
      this.adding = true;
    }

    if (this.unit && this.unit.interpretations && this.unit.interpretations.effectiveTags) {
      this.activeTags = this.unit.interpretations.effectiveTags;
    }

    if (this.platformService.isServer) {
      return;
    }
    setTimeout(() => {
      this.loadingForm.emit(this.statusAction);
    }, 4000);
  }

  ngOnDestroy() {
    this.subscribeRefreshedAnnotations?.unsubscribe();
    this.subscribeRefreshedAnnotations1?.unsubscribe();
  }

  initEmptyAnnotation() {
    this.annotation = {
      rootID: IdService.getId(this.rootID),
      targetID: IdService.getId(this.targetID),
      identification: {
        taxon: '',
        taxonID: '',
        taxonSpecifier: ''
      },
      addedTags: [],
      removedTags: [],
      deleted: false,
      type: Annotation.TypeEnum.TypeOpinion,
      occurrenceAtTimeOfAnnotation: {
        countryVerbatim: this.gathering && this.gathering.country ? this.gathering.country : '',
        dateBegin: this.gathering && this.gathering.eventDate && this.gathering.eventDate.begin ? this.gathering.eventDate.begin : '',
        dateEnd: this.gathering && this.gathering.eventDate && this.gathering.eventDate.end ? this.gathering.eventDate.end : '',
        locality: this.gathering && this.gathering.locality ? this.gathering.locality : '',
        municipalityVerbatim: this.gathering && this.gathering.municipalityVerbatim ? this.gathering.municipalityVerbatim : '',
        taxonId : this.unit && this.unit.linkings && this.unit.linkings.originalTaxon ? this.unit.linkings.originalTaxon.id : '' ,
        taxonVerbatim: this.unit && this.unit.taxonVerbatim ? this.unit.taxonVerbatim : '',
        wgs84centerPointLat: this.gathering && this.gathering.conversions && this.gathering.conversions.wgs84CenterPoint ?
        this.gathering.conversions.wgs84CenterPoint.lat : undefined,
        wgs84centerPointLon: this.gathering && this.gathering.conversions && this.gathering.conversions.wgs84CenterPoint ?
        this.gathering.conversions.wgs84CenterPoint.lon : undefined
      }
    };
  }

  onSuccess(annotation: Annotation) {
    this.statusAction = {
      status: true,
      action: this.deleting ? 'deleting' : 'adding'
    };
    this.loadingForm.emit(this.statusAction);
    this.lastAnnotationAddedId = annotation.id;
    this.annotations = [annotation, ...this.annotations];
    this.saveDone(annotation);
  }

  onLoading(status: boolean) {
    this.loading = status;
  }

  closeAddForm() {
    this.adding = false;
  }

  changeModeForm() {
   this.expert = !this.expert;
   this.cd.markForCheck();
  }

  onDelete(annotation: Annotation) {
    this.loading = true;
    this.deleting = true;
    this.statusAction = {
      status: true,
      action: this.deleting ? 'deleting' : 'adding'
    };
    this.loadingForm.emit(this.statusAction);
    this.loadingElements.emitChildEvent(true);
    this.annotationService.delete(annotation)
      .subscribe(
        (data: Annotation) => {
          const foundIndex = this.annotations.findIndex(x => IdService.getId(x.id) === IdService.getId(data.id));
          this.annotations[foundIndex] = data;
          this.saveDone(data);
        },
        (e) => {
          this.loading = false;
          this.loadingElements.emitChildEvent(false);
        }
      );
  }

  private saveDone(annotation?: Annotation) {
    this.findRendomKey();
    this.annotationChange.emit(annotation);
    this.closeAddForm();
    this.initEmptyAnnotation();
  }

  showDocument() {
    this.documentViewerFacade.showDocumentID({
      highlight: this.unit.unitId,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      document: this.documentID!,
      openAnnotation: true,
      result: undefined
    });
  }

  findRendomKey() {
    this.subscribeRefreshedAnnotations = timer(0, 5000).pipe(
      switchMap(() =>
        this.warehouseApi.warehouseQueryDocumentAggregateGet(
          {documentId: [this.rootID]},
          ['document.documentId', 'document.randomKey'],
          ['document.randomKey'],
          10,
          this.page
          )
        )
      ).pipe(
        map(data => data.results)
      ).subscribe(
        data => {
          data.forEach((r: any) => {
            this.randomKeyAfter = r.aggregateBy['document.randomKey'];
          });
        this.cd.markForCheck();

        this.countCall++;

        if (this.countCall > 4) {
          this.subscribeRefreshedAnnotations?.unsubscribe();
          this.loadingElements.emitChildEvent(true);
        }

        if (this.randomKeyAfter === undefined) {
          this.subscribeRefreshedAnnotations?.unsubscribe();
          this.taxonTagEffective.emitChildEvent(false);
          this.loadingElements.emitChildEvent(false);
          this.loadingForm.emit(false);
        }

        if (this.randomKeyAfter !== this.randomKeyBefore) {
          this.subscribeRefreshedAnnotations?.unsubscribe();
          this.taxonTagEffective.emitChildEvent(true);
          this.loadingElements.emitChildEvent(true);
          this.countCall = 0;
        }
      });
  }

  findRendomKey1() {
    this.subscribeRefreshedAnnotations1 = this.warehouseApi.warehouseQueryDocumentAggregateGet(
          {documentId: [this.rootID]},
          ['document.documentId', 'document.randomKey'],
          ['document.randomKey'],
          10,
          this.page
          ).pipe(
            map(data => data.results)
          ).subscribe(
            data => {
              data.forEach((r: any) => {
                this.randomKeyBefore = r.aggregateBy['document.randomKey'];
              });
            this.cd.markForCheck();
          });
  }


}
