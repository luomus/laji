import { Component, ChangeDetectionStrategy, Input, OnInit,
ChangeDetectorRef, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { WarehouseQueryInterface } from '../../shared/model/WarehouseQueryInterface';
import { Subscription, Observable, forkJoin, of } from 'rxjs';
import {TranslateService} from '@ngx-translate/core';
import { WarehouseApi } from '../../shared/api/WarehouseApi';
import { map, switchMap } from 'rxjs/operators';
import { Annotation } from '../../shared/model/Annotation';
import { PagedResult } from '../../shared/model/PagedResult';
import { AnnotationListService } from './service/annotation-list.service';


@Component({
  selector: 'laji-annotations',
  templateUrl: './annotations.component.html',
  styleUrls: ['./annotations.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnnotationsComponent implements OnInit, OnChanges {

  @Input() query: WarehouseQueryInterface;
  @Input() showPaginator = true;
  @Input() limit = 1000;


  @Output() hasData = new EventEmitter<boolean>();
  annotations: any;
  subAnnotation: Subscription;
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



  constructor(
    private warehouseApi: WarehouseApi,
    private translations: TranslateService,
    private cd: ChangeDetectorRef,
    private annotationService: AnnotationListService
  ) { }

  ngOnInit() {
    this.lang = this.translations.currentLang;
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
    /*this.subAnnotation = this.warehouseApi.warehouseQueryListGet(
      this.query,
      [
        'document.documentId',
        'gathering.team',
        'gathering.province',
        'unit.linkings.taxon.id',
        'unit.linkings.taxon.scientificName',
        'unit.linkings.originalTaxon.scientificName',
        'unit.linkings.originalTaxon.species',
        'gathering.municipality',
        'gathering.locality',
        'gathering.displayDateTime',
        'unit.media.fullURL',
        'unit.annotations.annotationClass'
      ],
      ['gathering.displayDateTime ASC'],
      50,
      this.page
    ).subscribe(data => {
      this.result = data;
      this.paginatorDisplay = this.result.total > this.result.pageSize;
      this.total = this.result.total;
      this.count = this.result.total;
      this.size = this.result.pageSize;
      this.cd.markForCheck();
      this.loading = false;
    }); */

    this.subAnnotation = this.annotationService.getList
        (
        this.query,
        // ['document.documentId', 'unit.media.thumbnailURL', 'document.collectionId',
        // 'gathering.country', 'unit.linkings.taxon.scientificName', 'unit.linkings.taxon.nameFinnish',
        // 'unit.linkings.taxon.speciesNameEnglish', 'unit.linkings.taxon.speciesNameSwedish' ,
        // 'gathering.biogeographicalProvince', 'gathering.locality', 'gathering.municipality',
        // 'unit.quality.taxon.reliability', 'unit.annotationCount', 'gathering.team'],
        ['document.documentId', 'unit.media.thumbnailURL', 'document.collectionId'],
         this.page,
         this.size,
         undefined,
         this.lang
         )
      .subscribe(data => {
        this.result = data;
        this.paginatorDisplay = this.result.total > this.result.pageSize;
        this.total = this.result.total;
        this.count = this.result.total;
        this.size = this.result.pageSize;
        this.loading = false;
        this.cd.markForCheck();
      });
  }


  pageChanged(event) {
    this.page = event.page;
    this.updateAnnotations();
  }


}
