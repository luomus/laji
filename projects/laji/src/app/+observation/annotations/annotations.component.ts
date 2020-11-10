import { Component, ChangeDetectionStrategy, Input, OnInit,
ChangeDetectorRef, Output, EventEmitter, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { WarehouseQueryInterface } from '../../shared/model/WarehouseQueryInterface';
import { Subscription, Observable, forkJoin, of } from 'rxjs';
import {TranslateService} from '@ngx-translate/core';
import { WarehouseApi } from '../../shared/api/WarehouseApi';
import { map, switchMap } from 'rxjs/operators';
import { Annotation } from '../../shared/model/Annotation';
import { PagedResult } from '../../shared/model/PagedResult';
import { AnnotationService } from '../../shared-modules/document-viewer/service/annotation.service';
import { AnnotationTag } from '../../shared/model/AnnotationTag';
import { DeleteOwnDocumentService } from '../../shared/service/delete-own-document.service';
import { ToQNamePipe } from 'projects/laji/src/app/shared/pipe/to-qname.pipe';



@Component({
  selector: 'laji-annotations',
  templateUrl: './annotations.component.html',
  styleUrls: ['./annotations.component.scss'],
  providers: [ToQNamePipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnnotationsComponent implements OnInit, OnChanges, OnDestroy {

  @Input() query: WarehouseQueryInterface;
  @Input() showPaginator = true;
  @Input() limit = 1000;


  @Output() hasData = new EventEmitter<boolean>();
  annotations: any;
  subAnnotation: Subscription;
  gathering: any[];
  result: PagedResult<any> = {
    currentPage: 1,
    lastPage: 1,
    results: [],
    total: 0,
    pageSize: 0
  };
  lang: string;
  loading: boolean;
  page: number;
  total: number;
  count: number;
  size: number;
  paginatorDisplay: boolean;
  annotationTags$: Observable<AnnotationTag[]>;
  subscriptionDeleteOwnDocument: Subscription;
  childEvent: any;



  constructor(
    private warehouseApi: WarehouseApi,
    private translations: TranslateService,
    private cd: ChangeDetectorRef,
    private annotationService: AnnotationService,
    private translate: TranslateService,
    private deleteOwnDocument: DeleteOwnDocumentService,
    private toQname: ToQNamePipe
  ) { }

  ngOnInit() {
    this.lang = this.translations.currentLang;
    this.annotationTags$ = this.annotationService.getAllTags(this.lang);

    this.subscriptionDeleteOwnDocument = this.deleteOwnDocument.childEventListner().subscribe(info => {
      this.childEvent = info;
      if (this.childEvent !== null) {
        setTimeout(() => {
          this.updateAnnotations();
          this.subscriptionDeleteOwnDocument.unsubscribe();
        }, 1300);
      }
      this.cd.markForCheck();
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (
      changes['query'] || changes['size'] || changes['limit'] ) {
      this.page = 1;
      this.updateAnnotations();
    }
  }


  updateAnnotations() {
    if (!this.query) {
      return;
    }

    if (this.subAnnotation) {
      this.subAnnotation.unsubscribe();
    }

    this.annotations = [];
    this.lang = this.translations.currentLang;
    this.loading = true;
    this.cd.markForCheck();
    this.subAnnotation = this.warehouseApi.warehouseQueryListGet(
      this.query,
      [
        'document.documentId',
        'unit.media.thumbnailURL',
        'document.createdDate',
        'unit.media.fullURL',
        'gathering.displayDateTime',
        'gathering.country',
        'gathering.biogeographicalProvince',
        'gathering.locality',
        'gathering.municipality',
        'gathering.team',
        'unit.annotationCount',
        'unit.unitId',
        'unit.linkings.originalTaxon.scientificName',
        'unit.linkings.taxon.scientificName',
        'unit.linkings.originalTaxon.id',
        'unit.linkings.taxon.id',
        'unit.linkings.taxon.vernacularName',
        'unit.reportedInformalTaxonGroup',
        'unit.linkings.originalTaxon.vernacularName',
        'unit.wild',
        'document.linkings.collectionQuality',
        'unit.interpretations.reliability',
        'unit.interpretations.effectiveTags',
        'unit.interpretations.individualCount',
        'unit.interpretations.invasiveControlEffectiveness',
        'unit.interpretations.invasiveControlled',
        'unit.interpretations.needsCheck',
        'unit.interpretations.needsIdentification',
        'unit.interpretations.recordQuality',
        'unit.unitId'
      ],
      ['document.createdDate DESC', 'unit.unitId ASC'],
      18,
      this.page
    ).subscribe(data => {
      this.cd.markForCheck();
      this.result = data;
      this.paginatorDisplay = this.result.total > this.result.pageSize;
      this.total = this.result.total;
      this.count = this.result.total;
      this.size = this.result.pageSize;
      this.loading = false;
    });

  }


  pageChanged(event) {
    this.page = event.page;
    this.updateAnnotations();
  }

  ngOnDestroy() {
    if (this.subscriptionDeleteOwnDocument) {
      this.subscriptionDeleteOwnDocument.unsubscribe();
    }
  }


}
