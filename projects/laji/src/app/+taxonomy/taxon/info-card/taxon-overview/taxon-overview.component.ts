import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnDestroy, Output } from '@angular/core';
import {
  Taxonomy,
  TaxonomyDescription,
  TaxonomyDescriptionVariable
} from '../../../../shared/model/Taxonomy';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { TaxonTaxonomyService } from '../../service/taxon-taxonomy.service';
import { WarehouseQueryInterface } from '../../../../shared/model/WarehouseQueryInterface';
import { InfoCardQueryService } from '../shared/service/info-card-query.service';
import { map } from 'rxjs/operators';

interface TaxonOverviewDescription {
  generalDescription?: TaxonomyDescriptionVariable;
  generalDescriptionSource?: TaxonomyDescription;
  structureDescriptions?: TaxonomyDescriptionVariable[];
  structureDescriptionSource?: TaxonomyDescription;
}

@Component({
  selector: 'laji-taxon-overview',
  templateUrl: './taxon-overview.component.html',
  styleUrls: ['./taxon-overview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaxonOverviewComponent implements OnChanges, OnDestroy {
  @Input() taxon: Taxonomy;
  @Input() isFromMasterChecklist: boolean;
  @Input() images: any[];

  @Output() taxonSelect = new EventEmitter<string>();

  taxonChildren: Taxonomy[] = [];

  description: TaxonOverviewDescription = {};

  isChildrenOnlySpecie = false;
  totalObservations = 0;

  mapQuery: WarehouseQueryInterface;
  queryCount: WarehouseQueryInterface;

  queryKeysDeleted = ['coordinateAccuracyMax', 'includeNonValidTaxa', 'cache'];
  private childrenSub: Subscription;

  @Input() set taxonDescription(taxonDescription: TaxonomyDescription[]) {
    this.description = {};

    (taxonDescription || []).forEach((item, idx) => {
      (item.groups || []).forEach(group => {
        if (group.group === 'MX.SDVG1' && this.description.generalDescription === undefined) {
          (group.variables || []).forEach(variable => {
            if (variable.variable === 'MX.descriptionText' && (variable.title || variable.content)) {
              this.description.generalDescription = variable;
              this.description.generalDescriptionSource = item;
            }
          });
        }
        if (group.group === 'MX.SDVG8' && this.description.structureDescriptions === undefined) {
          this.description.structureDescriptions = group.variables;
          this.description.structureDescriptionSource = item;
        }
      });
    });
  }

  constructor(
    public translate: TranslateService,
    private taxonomyService: TaxonTaxonomyService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnChanges() {
    this.getChildren();
    this.mapQuery = InfoCardQueryService.getFinnishObservationQuery(this.taxon.id, true);
    this.queryCount = Object.keys(this.mapQuery).reduce((object, key) => {
      if (this.queryKeysDeleted.indexOf(key) === -1) {
        object[key] = this.mapQuery[key];
      }
      return object;
    }, {});
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
    this.childrenSub = this.taxonomyService
      .getChildren(this.taxon.id).pipe(
        map((obj) => {
          obj.forEach(r => {
            if (!r['observationCountFinland']) {
              r['observationCountFinland'] = 0;
            }
          });
          return obj;
       })
      )
      .subscribe(data => {
        this.taxonChildren = data;
        this.isChildrenOnlySpecie = this.taxonChildren.filter(e => e.taxonRank === 'MX.species').length > 0;
        this.cd.markForCheck();
      });
  }
}
