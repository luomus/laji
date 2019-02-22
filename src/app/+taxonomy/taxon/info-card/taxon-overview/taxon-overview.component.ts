import { Component, OnChanges, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { Taxonomy, TaxonomyDescription } from '../../../../shared/model/Taxonomy';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { TaxonomyApi } from '../../../../shared/api/TaxonomyApi';

@Component({
  selector: 'laji-taxon-overview',
  templateUrl: './taxon-overview.component.html',
  styleUrls: ['./taxon-overview.component.scss']
})
export class TaxonOverviewComponent implements OnChanges {
  @Input() taxon: Taxonomy;
  @Input() images: any[];

  @Output() hasImageData = new EventEmitter<boolean>();
  @Output() taxonSelect = new EventEmitter<string>();

  taxonChildren: Taxonomy[] = [];
  ingress: any;
  description: any;
  _taxonDescription: TaxonomyDescription;

  private childrenSub: Subscription;

  @Input() set taxonDescription(taxonDescription: TaxonomyDescription[]) {
    this.ingress = undefined;
    this.description = undefined;
    if (taxonDescription && taxonDescription.length > 0 && taxonDescription[0].groups.length > 0) {
      const desc = taxonDescription[0].groups[0];
      (desc.variables || []).forEach(variable => {
        if (variable.title && variable.title['en'] === 'Ingress') {
          this.ingress = variable.content;
        }
        if (variable.title && variable.title['en'] === 'Description') {
          this.description = variable.content;
        }
      });
    }
    this._taxonDescription = taxonDescription && taxonDescription.length > 0 ? taxonDescription[0] : undefined;
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

  get isFromMasterChecklist() {
    const masterChecklist = 'MR.1';
    if (!this.taxon) {
      return false;
    }
    if (this.taxon.checklist) {
      return this.taxon.checklist.indexOf(masterChecklist) > -1;
    }
    return this.taxon.nameAccordingTo === masterChecklist;
  }

  private getChildren() {
    if (this.childrenSub) {
      this.childrenSub.unsubscribe();
    }
    this.childrenSub = this.taxonService
      .taxonomyFindChildren(this.taxon.id, this.translate.currentLang, '1', {
        selectedFields: 'id,vernacularName,scientificName,cursiveName,countOfFinnishSpecies'
      })
      .subscribe((data) => {
        this.taxonChildren = data;
        this.cd.markForCheck();
      });
  }
}
