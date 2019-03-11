import { Component, OnChanges, OnDestroy, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { Taxonomy, TaxonomyDescription } from '../../../../shared/model/Taxonomy';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { TaxonomyApi } from '../../../../shared/api/TaxonomyApi';

@Component({
  selector: 'laji-taxon-overview',
  templateUrl: './taxon-overview.component.html',
  styleUrls: ['./taxon-overview.component.scss']
})
export class TaxonOverviewComponent implements OnChanges, OnDestroy {
  @Input() taxon: Taxonomy;
  @Input() isFromMasterChecklist: boolean;
  @Input() images: any[];

  @Output() taxonSelect = new EventEmitter<string>();

  taxonChildren: Taxonomy[] = [];
  ingress: any;
  description: any;
  _taxonDescription: TaxonomyDescription;

  private childrenSub: Subscription;

  @Input() set taxonDescription(taxonDescription: TaxonomyDescription[]) {
    this.ingress = undefined;
    this.description = undefined;
    this._taxonDescription = taxonDescription && taxonDescription.length > 0 ? taxonDescription[0] : undefined;

    if (this._taxonDescription && this._taxonDescription.groups.length > 0) {
      const group = taxonDescription[0].groups[0];
      if (group.group === 'MX.SDVG1') {
        (group.variables || []).forEach(variable => {
          if (variable.variable === 'MX.ingressText') {
            this.ingress = variable.content;
          }
          if (variable.variable === 'MX.descriptionText') {
            this.description = variable.content;
          }
        });
      }
    }
  }

  constructor(
    public translate: TranslateService,
    private taxonService: TaxonomyApi,
    private cd: ChangeDetectorRef
  ) { }

  ngOnChanges() {
    if (!this.taxon.species) {
      this.getChildren();
    }
  }

  ngOnDestroy() {
    if (this.childrenSub) {
      this.childrenSub.unsubscribe();
    }
  }

  private getChildren() {
    if (this.childrenSub) {
      this.childrenSub.unsubscribe();
    }
    this.childrenSub = this.taxonService
      .taxonomyFindChildren(this.taxon.id, this.translate.currentLang, '1', {
        selectedFields: 'id,vernacularName,scientificName,cursiveName,countOfFinnishSpecies',
        onlyFinnish: false
      })
      .subscribe((data) => {
        this.taxonChildren = data;
        this.cd.markForCheck();
      });
  }
}
