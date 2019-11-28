import { Component, OnInit, Input, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Global } from '../../../../environments/global';
import { Subject, Subscription } from 'rxjs';
import { TaxonTagEffectiveService } from '../../../shared-modules/document-viewer/taxon-tag-effective.service';


@Component({
  selector: 'laji-observation-effective-tags-taxon',
  templateUrl: './observation-effective-tags-taxon.component.html',
  styleUrls: ['./observation-effective-tags-taxon.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ObservationEffectiveTagsTaxonComponent implements OnInit, OnDestroy {

  @Input() unit: any;
  @Input() parentSubject: Subject<boolean>;

  annotationResolving: boolean;
  subscriptParent: Subscription;
  annotationTagsObservation = Global.annotationTags;

  constructor(private taxonTagEffective: TaxonTagEffectiveService, private cd: ChangeDetectorRef) { }

  ngOnInit() {
     this.unit.addedTags = [];
     this.subscriptParent = this.taxonTagEffective.childEventListner().subscribe(event => {
      this.annotationResolving = event;
      this.cd.markForCheck();
    });
  }

  ngOnDestroy() {
    this.subscriptParent.unsubscribe();
  }


}
