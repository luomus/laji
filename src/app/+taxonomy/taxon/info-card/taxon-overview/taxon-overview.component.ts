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

  private childrenSub: Subscription;

  @Input() set taxonDescription(taxonDescription: Array<TaxonomyDescription>) {
    this.ingress = undefined;
    if (taxonDescription && taxonDescription.length > 0 && taxonDescription[0].id === 'default' && taxonDescription[0].groups.length > 0) {
      const desc = taxonDescription[0].groups[0];
      if (desc.variables.length > 0 && desc.variables[0].title && desc.variables[0].title['en'] === 'Ingress') {
        this.ingress = desc.variables[0].content;
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
