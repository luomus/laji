import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnDestroy, Output } from '@angular/core';
import { Taxonomy, TaxonomyDescription } from '../../../../shared/model/Taxonomy';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { TaxonTaxonomyService } from '../../service/taxon-taxonomy.service';
import { WarehouseQueryInterface } from '../../../../shared/model/WarehouseQueryInterface';
import { InfoCardQueryService } from '../shared/service/info-card-query.service';
import { CheckLangService } from '../../service/check-lang.service';
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
  ingress: any;
  description: any;
  ylesta: any;
  ylestaTitle: any;
  ylestaSpeciesCardAuthors: any;
  _taxonDescription: TaxonomyDescription[];
  groupHasTranslation: any[];
  ylestaHasTranslation: any[];
  isChildrenOnlySpecie = false;
  totalObservations = 0;
  linkObservations: string;

  contentHasLanguage: boolean;
  currentLang: string;

  mapQuery: WarehouseQueryInterface;

  private childrenSub: Subscription;

  @Input() set taxonDescription(taxonDescription: TaxonomyDescription[]) {
    this.ingress = undefined;
    this.description = undefined;
    this.ylesta = undefined;
    this.ylesta = [{'text': undefined, 'visible': undefined}];
    this.ylestaTitle = undefined;
    this.ylestaSpeciesCardAuthors = undefined;
    this.groupHasTranslation = [];
    this.ylestaHasTranslation = [];
    this._taxonDescription = taxonDescription && taxonDescription.length > 0 ? taxonDescription : undefined;
    if (this._taxonDescription && this._taxonDescription.length > 0) {
      const groups = taxonDescription[0].groups;
      this.groupHasTranslation = this.checklang.checkValue(this._taxonDescription);
      this._taxonDescription.forEach((item, idx) => {
        (item.groups || []).forEach(gruppo => {
          if (gruppo.group === 'MX.SDVG1' && this.description === undefined && this.ingress === undefined) {
            (gruppo.variables || []).forEach(variable => {
              if (variable.variable === 'MX.descriptionText') {
                this.description = variable.content;
                this.ingress = variable.title;
                this.contentHasLanguage = variable.content[this.translate.currentLang] ? true : false;
              }
            });
          }
          if (gruppo.group === 'MX.SDVG8' && this.ylesta[0].text === undefined && this.ylesta[0].visible === undefined) {
            this.ylestaTitle = item.title;
            this.ylestaSpeciesCardAuthors = item.speciesCardAuthors ? item.speciesCardAuthors : null;
            this.ylesta[0].text = gruppo.variables;

            this.ylestaHasTranslation = this.groupHasTranslation[idx].groups.filter(el =>
              el.id === 'MX.SDVG8'
            );
            this.ylesta[0].visible = this.ylestaHasTranslation.length > 0 ? this.ylestaHasTranslation[0].values : [];
          }
        });
        return this.ylesta;
      });
    }
  }

  constructor(
    public translate: TranslateService,
    private taxonomyService: TaxonTaxonomyService,
    private cd: ChangeDetectorRef,
    private checklang: CheckLangService
  ) { }

  ngOnChanges() {
    this.currentLang = this.translate.currentLang;
    this.getChildren();
    this.mapQuery = InfoCardQueryService.getFinnishObservationQuery(this.taxon.id, true);
  }

  ngOnDestroy() {
    if (this.childrenSub) {
      this.childrenSub.unsubscribe();
    }
  }

  checkTotalObservations(event){
    this.totalObservations = event;
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
        this.isChildrenOnlySpecie = this.taxonChildren.filter(e => e.taxonRank === 'MX.species').length > 0 ? true : false;
        this.cd.markForCheck();
      });
  }
}
