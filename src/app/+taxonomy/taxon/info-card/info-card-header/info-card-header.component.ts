import {Component, OnChanges, Input, SimpleChanges, Output, EventEmitter, ChangeDetectorRef} from '@angular/core';
import {Taxonomy} from '../../../../shared/model/Taxonomy';
import {Subscription} from 'rxjs';
import {TaxonTaxonomyService} from '../../service/taxon-taxonomy.service';

@Component({
  selector: 'laji-info-card-header',
  templateUrl: './info-card-header.component.html',
  styleUrls: ['./info-card-header.component.scss']
})
export class InfoCardHeaderComponent implements OnChanges {
  @Input() taxon: Taxonomy;
  @Input() activeTab: string;

  parent: Taxonomy;
  siblings: Taxonomy[];

  loadingParent = false;

  private parentSub: Subscription;
  private siblingSub: Subscription;

  @Output() taxonSelect = new EventEmitter<string>();

  constructor(
    private taxonomyService: TaxonTaxonomyService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.taxon) {
      this.setParent();
      this.setSiblings();
    }
  }

  selectRightSibling() {
    let idx = 0;
    for (let i = 0; i < this.siblings.length - 1; i++) {
      if (this.siblings[i].id === this.taxon.id) {
        idx = i + 1;
      }
    }
    this.taxonSelect.emit(this.siblings[idx].id);
  }

  selectLeftSibling() {
    let idx = this.siblings.length - 1;
    for (let i = 1; i < this.siblings.length; i++) {
      if (this.siblings[i].id === this.taxon.id) {
        idx = i - 1;
      }
    }
    this.taxonSelect.emit(this.siblings[idx].id);
  }

  private setParent() {
    if (this.parentSub) {
      this.parentSub.unsubscribe();
    }

    if (this.taxon.hasParent) {
      this.loadingParent = true;
      this.parentSub = this.taxonomyService.getParent(this.taxon.id)
        .subscribe(parent => {
          this.parent = parent;
          this.loadingParent = false;
          this.cd.markForCheck();
        });
    } else {
      this.loadingParent = false;
    }
  }

  private setSiblings() {
    if (this.siblingSub) {
      this.siblingSub.unsubscribe();
    }

    if (this.taxon.hasParent || this.taxon.hasChildren) {
      this.siblingSub = this.taxonomyService.getSiblings(this.taxon.id)
        .subscribe(siblings => {
          this.siblings = siblings;
          this.cd.markForCheck();
        });
    }
  }
}
