import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges
} from '@angular/core';
import { Subscription } from 'rxjs';
import { TaxonTaxonomyService } from '../../service/taxon-taxonomy.service';
import { components } from 'projects/laji-api-client-b/generated/api.d';

type Taxon = components['schemas']['Taxon'];

@Component({
  selector: 'laji-info-card-header',
  templateUrl: './info-card-header.component.html',
  styleUrls: ['./info-card-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InfoCardHeaderComponent implements OnChanges {
  @Input() taxon!: Taxon;
  @Input() activeTab!: string;

  parent: Taxon[] | undefined;
  siblings: Taxon[] | undefined;

  loadingParent = false;
  subParam: any;

  private parentSub: Subscription | undefined;
  private siblingSub: Subscription | undefined;

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
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    for (let i = 0; i < this.siblings!.length - 1; i++) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      if (this.siblings![i].id === this.taxon.id) {
        idx = i + 1;
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.taxonSelect.emit(this.siblings![idx].id);
  }

  selectLeftSibling() {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    let idx = this.siblings!.length - 1;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    for (let i = 1; i < this.siblings!.length; i++) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      if (this.siblings![i].id === this.taxon.id) {
        idx = i - 1;
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.taxonSelect.emit(this.siblings![idx].id);
  }


  private setParent() {
    if (this.parentSub) {
      this.parentSub.unsubscribe();
    }

    if (this.taxon.hasParent) {
      this.loadingParent = true;
      this.parentSub = this.taxonomyService.getParents(this.taxon.id)
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
