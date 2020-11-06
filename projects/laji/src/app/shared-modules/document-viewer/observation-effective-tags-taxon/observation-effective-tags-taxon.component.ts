import { Component, OnInit, Input, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Global } from '../../../../environments/global';
import { Subject, Subscription, of, from, Observable } from 'rxjs';
import { TaxonTagEffectiveService } from '../taxon-tag-effective.service';
import { LoadingElementsService } from '../loading-elements.service';
import { ToQNamePipe } from '../../../shared/pipe/to-qname.pipe';
import { AnnotationService } from '../service/annotation.service';
import { AnnotationTag } from '../../../shared/model/AnnotationTag';
import { WarehousePipe } from '../../../shared/pipe/warehouse.pipe';
import { WarehouseValueMappingService } from '../../../shared/service/warehouse-value-mapping.service';
import { TranslateService } from '@ngx-translate/core';
import { switchMap, toArray, concatMap } from 'rxjs/operators';

@Component({
  selector: 'laji-observation-effective-tags-taxon',
  templateUrl: './observation-effective-tags-taxon.component.html',
  styleUrls: ['./observation-effective-tags-taxon.component.scss'],
  providers: [WarehousePipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ObservationEffectiveTagsTaxonComponent implements OnInit, OnDestroy {

  @Input() unit: any;
  @Input() parentSubject: Subject<boolean>;
  @Input() showTitle: boolean;
  @Input() showEffectiveTaxon = true;
  @Input() showEffectiveTag = true;
  @Input() showRecordQuality = true;
  @Input() annotationTags: AnnotationTag[];

  annotationResolving: boolean;
  subscriptParent: Subscription;
  annotationTagsObservation = Global.annotationTags;
  countItems: number;
  haschangedTaxon = false;
  convertEffective$: Observable<any>;
  subEffectiveTags: Subscription;

  constructor(
    private taxonTagEffective: TaxonTagEffectiveService,
    private cd: ChangeDetectorRef,
    private toQname: ToQNamePipe,
    private loadingElements: LoadingElementsService,
    private annotationService: AnnotationService,
    private translate: TranslateService,
    private warehouseValueMappingService: WarehouseValueMappingService
    ) { }

  ngOnInit() {
    this.convertEffective$ = from(this.unit?.interpretations?.effectiveTags || []).pipe(
      concatMap(tag => this.warehouseValueMappingService.getOriginalKey(tag as string)),
      toArray(),
      switchMap(keys => this.annotationTags ?
        of(this.annotationTags.filter(item => keys.includes(item.id))) :
        from(keys).pipe(
          concatMap(key => this.annotationService.getTag(key, this.translate.currentLang)),
          toArray()
        )
      )
    );
     this.unit.addedTags = [];
     this.subscriptParent = this.loadingElements.childEventListner().subscribe(event => {
      this.annotationResolving = event;
      this.cd.markForCheck();
    });

    if (this.unit.linkings && this.unit.linkings.taxon && this.unit.linkings.originalTaxon) {
      this.haschangedTaxon = (this.toQname.transform(this.unit.linkings.taxon.id) !== this.toQname.transform(this.unit.linkings.originalTaxon.id)) ? true : false;
    } else {
      this.haschangedTaxon = false;
    }
  }

  ngOnDestroy() {
    if (this.subscriptParent) {
      this.subscriptParent.unsubscribe();
    }
  }


}
