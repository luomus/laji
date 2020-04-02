import { Component, OnInit, Input, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Global } from '../../../../environments/global';
import { Subject, Subscription } from 'rxjs';
import { TaxonTagEffectiveService } from '../../../shared-modules/document-viewer/taxon-tag-effective.service';
import { LoadingElementsService } from '../../../shared-modules/document-viewer/loading-elements.service';
import { ToQNamePipe } from '../../../shared/pipe/to-qname.pipe';


@Component({
  selector: 'laji-observation-effective-tags-taxon',
  templateUrl: './observation-effective-tags-taxon.component.html',
  styleUrls: ['./observation-effective-tags-taxon.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ObservationEffectiveTagsTaxonComponent implements OnInit, OnDestroy {

  @Input() unit: any;
  @Input() parentSubject: Subject<boolean>;

  @Input() showEffectiveTaxon = true;
  @Input() showEffectiveTag = true;
  @Input() showRecordQuality = true;

  annotationResolving: boolean;
  subscriptParent: Subscription;
  annotationTagsObservation = Global.annotationTags;
  countItems: number;
  haschangedTaxon = false;

  constructor(
    private taxonTagEffective: TaxonTagEffectiveService,
    private cd: ChangeDetectorRef,
    private toQname: ToQNamePipe,
    private loadingElements: LoadingElementsService
    ) { }

  ngOnInit() {
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
    this.subscriptParent.unsubscribe();
  }


}
