import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnDestroy, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { TaxonTaxonomyService } from '../../service/taxon-taxonomy.service';
import { WarehouseQueryInterface } from '../../../../shared/model/WarehouseQueryInterface';
import { InfoCardQueryService } from '../shared/service/info-card-query.service';
import { map } from 'rxjs';
import { components } from 'projects/laji-api-client-b/generated/api.d';

type Taxon = components['schemas']['LajiBackendTaxon'];
type TaxonDescription = Taxon['descriptions'][number];
type TaxonDescriptionVariable = TaxonDescription['groups'][number]['variables'][number];

@Component({
    selector: 'laji-taxon-overview',
    templateUrl: './taxon-overview.component.html',
    styleUrls: ['./taxon-overview.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class TaxonOverviewComponent implements OnChanges, OnDestroy {
  @Input({ required: true }) taxon!: Taxon;
  @Input() isFromMasterChecklist?: boolean;
  @Input() images!: any[];

  @Output() taxonSelect = new EventEmitter<string>();

  taxonChildren: Taxon[] = [];

  descriptionText?: TaxonDescriptionVariable[];
  descriptionTextSource?: TaxonDescription;

  isChildrenOnlySpecie = false;
  totalObservations = 0;

  mapQuery!: WarehouseQueryInterface;
  queryCount!: WarehouseQueryInterface;

  queryKeysDeleted: (keyof WarehouseQueryInterface)[] = ['coordinateAccuracyMax', 'includeNonValidTaxa', 'cache'];
  private childrenSub?: Subscription;

  @Input() set taxonDescription(taxonDescription: TaxonDescription[]) {
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
    this.queryCount = (Object.keys(this.mapQuery) as (keyof WarehouseQueryInterface & string)[]).reduce((object, key) => {
      if (this.queryKeysDeleted.indexOf(key) === -1) {
        (object as any)[key] = this.mapQuery[key];
      }
      return object;
    }, {} as WarehouseQueryInterface);
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

  private updateDescriptionText(taxonDescription?: TaxonDescription[]) {
    this.descriptionText = undefined;
    this.descriptionTextSource = undefined;

    const GENERAL_GROUP = 'MX.SDVG1';
    const STRUCTURE_GROUP = 'MX.SDVG8';

    // GENERAL_GROUP has higher precedende than STRUCTURE_GROUP. The loop relies on the fact that the descriptions are
    // already in order (GENERAL_GROUP is before STRUCTURE_GROUP).
    for (const item of (taxonDescription || [])) {
      for (const group of (item.groups || [])) {
        if (group.group === GENERAL_GROUP) { // For general group we display only one variable.
          for (const variable of (group.variables || [])) {
            if (variable.variable === 'MX.descriptionText' && variable.content) {
              this.descriptionText = [variable];
              this.descriptionTextSource = item;
              return;
            }
          }
        } else if (group.group === STRUCTURE_GROUP) { // For structure group we display all variables that have content.
          const variablesWithContent = group.variables.filter(v => !!v.content);
          if (variablesWithContent.length) {
            this.descriptionText = variablesWithContent;
            this.descriptionTextSource = item;
            return;
          }
        }
      }
    }
  }
}
