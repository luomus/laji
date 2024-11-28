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

  descriptionText?: TaxonomyDescriptionVariable[];
  descriptionTextSource?: TaxonomyDescription;

  isChildrenOnlySpecie = false;
  totalObservations = 0;

  mapQuery: WarehouseQueryInterface;
  queryCount: WarehouseQueryInterface;

  queryKeysDeleted = ['coordinateAccuracyMax', 'includeNonValidTaxa', 'cache'];
  private childrenSub: Subscription;

  @Input() set taxonDescription(taxonDescription: TaxonomyDescription[]) {
    this.updateDescriptionText(taxonDescription);
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

  private updateDescriptionText(taxonDescription?: TaxonomyDescription[]) {
    this.descriptionText = undefined;
    this.descriptionTextSource = undefined;

    let generalDescriptionFound = false;

    (taxonDescription || []).forEach(item => {
      (item.groups || []).forEach(group => {
        if (generalDescriptionFound) {
          return;
        }

        // show the general description or if it's not found show the structure description
        if (group.group === 'MX.SDVG1') {
          (group.variables || []).forEach(variable => {
            if (variable.variable === 'MX.descriptionText' && (variable.title || variable.content)) {
              this.descriptionText = [variable];
              this.descriptionTextSource = item;
              generalDescriptionFound = true;
            }
          });
        } else if (group.group === 'MX.SDVG8' && !this.descriptionText) {
          this.descriptionText = group.variables;
          this.descriptionTextSource = item;
        }
      });
    });
  }
}
