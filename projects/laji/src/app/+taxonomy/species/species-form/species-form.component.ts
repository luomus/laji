import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { TaxonomySearchQuery } from '../service/taxonomy-search-query';
import { SpeciesFormQuery } from './species-form-query.interface';
import { Util } from '../../../shared/service/util.service';

type InvasiveStatuses = Pick<SpeciesFormQuery,
  'euInvasiveSpeciesList'
  | 'controllingRisksOfInvasiveAlienSpecies'
  | 'quarantinePlantPest'
  | 'qualityPlantPest'
  | 'otherPlantPest'
  | 'nationalInvasiveSpeciesStrategy'
  | 'otherInvasiveSpeciesList'
>;

type BoldField = keyof (Pick<SpeciesFormQuery, 'onlyBold' | 'onlyNonBold'>);

@Component({
  selector: 'laji-species-form[searchQuery]',
  templateUrl: './species-form.component.html',
  styleUrls: ['./species-form.component.css']
})
export class SpeciesFormComponent implements OnInit, OnDestroy {
  @Input() searchQuery!: TaxonomySearchQuery;

  public taxonSelectFilters!: {
    informalTaxonGroup?: string;
    onlyFinnish?: boolean;
  };

  public formQuery: SpeciesFormQuery = {
    onlyFinnish: true,
    onlyInvasive: false,
    onlyNonInvasive: false,
    euInvasiveSpeciesList: false,
    controllingRisksOfInvasiveAlienSpecies: false,
    quarantinePlantPest: false,
    allInvasiveSpecies: false,
    nationalInvasiveSpeciesStrategy: false,
    otherInvasiveSpeciesList: false,
    otherPlantPest: false,
    qualityPlantPest: false,
    onlyBold: false,
    onlyNonBold: false
  };

  public subUpdate?: Subscription;

  public invasiveSelected: (keyof SpeciesFormQuery)[] = [];
  public invasiveStatuses: (keyof InvasiveStatuses)[] = [
    'euInvasiveSpeciesList',
    'controllingRisksOfInvasiveAlienSpecies',
    'quarantinePlantPest',
    'qualityPlantPest',
    'otherPlantPest',
    'nationalInvasiveSpeciesStrategy',
    'otherInvasiveSpeciesList',
  ];

  public boldSelected: BoldField[] = [];

  constructor(
    public translate: TranslateService
  ) { }

  ngOnInit() {
    this.taxonSelectFilters = {
      informalTaxonGroup: this.searchQuery.query.informalGroupFilters,
      onlyFinnish: this.searchQuery.query.onlyFinnish
    };
    this.queryToFormQuery();

    this.subUpdate = this.searchQuery.queryUpdated$.subscribe(
      res => {
        this.taxonSelectFilters = {
          informalTaxonGroup: this.searchQuery.query.informalGroupFilters,
          onlyFinnish: this.searchQuery.query.onlyFinnish
        };
        if (res.formSubmit) {
          this.queryToFormQuery();
          this.onSubmit();
        }
      });
  }

  ngOnDestroy() {
    if (this.subUpdate) {
      this.subUpdate.unsubscribe();
    }
  }

  onTaxonSelect(key: string) {
    this.formQuery.taxon = key;
    this.searchQuery.query.target = key;
    this.onQueryChange();
  }

  onHabitatChange(habitats: any) {
    this.searchQuery.query.primaryHabitat = habitats.primaryHabitat;
    this.searchQuery.query.anyHabitat = habitats.anyHabitat;
    this.onQueryChange();
  }

  onInvasiveChange(ids: (keyof SpeciesFormQuery)[]) {
    const id = Util.arrayDiff(this.invasiveSelected, ids)[0];
    if (id === 'onlyInvasive') {
      this.onInvasiveToggle();
    } else if (id === 'onlyNonInvasive') {
      this.onNonInvasiveToggle();
    } else {
      this.onInvasiveCheckBoxToggle(id);
    }
  }

  onBoldChange(checkboxStates: BoldField[]) {
    const changedSelection = Util.arrayDiff(this.boldSelected, checkboxStates)[0];

    if (changedSelection === 'onlyBold') {
      this.formQuery.onlyBold = !this.formQuery.onlyBold;
      if (this.formQuery.onlyBold) {
        this.formQuery.onlyNonBold = false;
      }

    } else if (changedSelection === 'onlyNonBold') {
      this.formQuery.onlyNonBold = !this.formQuery.onlyNonBold;
      if (this.formQuery.onlyNonBold) {
        this.formQuery.onlyBold = false;
      }
    }

    this.updateBoldSelected();
    this.onQueryChange();
  }

  updateTypesOfOccurrence(event: {true: string[]; false: string[]}) {
    this.searchQuery.query.typesOfOccurrenceFilters = event.true;
    this.searchQuery.query.typesOfOccurrenceNotFilters = event.false;
    this.onQueryChange();
  }

  private updateInvasiveSelected() {
    const invasiveSelected: (keyof SpeciesFormQuery)[] = [];
    const allFields: (keyof Omit<SpeciesFormQuery, 'taxon'>)[] = [
      'onlyInvasive',
      'onlyNonInvasive',
      'euInvasiveSpeciesList',
      'controllingRisksOfInvasiveAlienSpecies',
      'quarantinePlantPest',
      'qualityPlantPest',
      'otherPlantPest',
      'nationalInvasiveSpeciesStrategy',
      'otherInvasiveSpeciesList',
      'allInvasiveSpecies',
    ];
    for (const i in allFields) {
      if (this.formQuery[allFields[i]]) {
        invasiveSelected.push(allFields[i]);
      }
    }
    this.invasiveSelected = invasiveSelected;
  }

  private updateBoldSelected() {
    const boldSelected: BoldField[] = [];
    const allBoldFields: BoldField[] = [
      'onlyBold',
      'onlyNonBold'
    ];
    for (const i in allBoldFields) {
      if (this.formQuery[allBoldFields[i]]) {
        boldSelected.push(allBoldFields[i]);
      }
    }
    this.boldSelected = boldSelected;
  }

  private onInvasiveToggle() {
    this.formQuery.onlyInvasive = !this.formQuery.onlyInvasive;
    if (this.formQuery.onlyInvasive) {
      this.formQuery.onlyNonInvasive = false;
    }
    this.updateInvasiveSelected();
    this.onQueryChange();
  }

  private onNonInvasiveToggle() {
    this.formQuery.onlyNonInvasive = !this.formQuery.onlyNonInvasive;
    if (this.formQuery.onlyNonInvasive) {
      this.formQuery.onlyInvasive = false;
    }
    this.updateInvasiveSelected();
    this.onQueryChange();
  }

  private onInvasiveCheckBoxToggle(field: keyof SpeciesFormQuery) {
    if (field === 'allInvasiveSpecies') {
      this.formQuery.allInvasiveSpecies = !this.formQuery.allInvasiveSpecies;
      this.invasiveStatuses.map(status => { this.formQuery[status] = this.formQuery.allInvasiveSpecies; });
    } else {
      (this.formQuery as any)[field] = !this.formQuery[field];
      if (!this.formQuery[field] && this.formQuery.allInvasiveSpecies) {
        this.formQuery.allInvasiveSpecies = false;
      }
    }
    this.formQueryToQuery();
    this.onAdministrativeStatusChange();
  }

  onAdministrativeStatusChange() {
    const admins = this.searchQuery.query.adminStatusFilters;
    let cnt = 0;
    this.invasiveStatuses.map((key: keyof InvasiveStatuses) => {
      const realKey = 'MX.' + key;
      this.formQuery[key] = admins && admins.indexOf(realKey) > -1 || false;
      if (this.formQuery[key]) {
        cnt++;
      }
    });
    this.formQuery.allInvasiveSpecies = cnt === this.invasiveStatuses.length;
    this.updateInvasiveSelected();
    this.onQueryChange();
  }

  onQueryChange(updateFormQuery?: boolean) {
    if (updateFormQuery) {
      this.queryToFormQuery();
    }
    this.onSubmit();
  }

  onSubmit() {
    this.formQueryToQuery();
    this.searchQuery.updateUrl();
    this.searchQuery.query = { ...this.searchQuery.query };
    this.formQuery.taxon = this.searchQuery.query.target ? this.formQuery.taxon : '';
    return false;
  }

  updateQuery(key: string, value: any) {
    (this.searchQuery.query as any)[key] = value;
    this.onQueryChange();
  }

  private formQueryToQuery() {
    const query = this.searchQuery.query;
    query.onlyFinnish = this.formQuery.onlyFinnish ? true : undefined;
    query.invasiveSpeciesFilter = this.formQuery.onlyInvasive ? true : (this.formQuery.onlyNonInvasive ? false : undefined);
    query.hasBoldData = this.formQuery.onlyBold ? true : (this.formQuery.onlyNonBold ? false : undefined);

    if (query.adminStatusFilters) {
      query.adminStatusFilters = [...query.adminStatusFilters];
    }

    this.invasiveStatuses
      .map((key) => {
        const value = 'MX.' + key;
        if (!this.formQuery[key]) {
          if (query.adminStatusFilters) {
            const idx = query.adminStatusFilters.indexOf(value);
            if (idx > -1) {
              query.adminStatusFilters.splice(idx, 1);
            }
          }
          return;
        }
        if (!query.adminStatusFilters) {
          query.adminStatusFilters = [];
        }
        if (query.adminStatusFilters.indexOf(value) === -1) {
          query.adminStatusFilters.push(value);
        }
      });
  }

  private queryToFormQuery() {
    const query = this.searchQuery.query;
    this.formQuery = {
      onlyFinnish: !!query.onlyFinnish,
      onlyInvasive: query.invasiveSpeciesFilter === true,
      onlyNonInvasive: query.invasiveSpeciesFilter === false,
      taxon: query.target,
      euInvasiveSpeciesList: this.hasInMulti(query.adminStatusFilters, 'MX.euInvasiveSpeciesList'),
      qualityPlantPest: this.hasInMulti(query.adminStatusFilters, 'MX.qualityPlantPest'),
      otherPlantPest: this.hasInMulti(query.adminStatusFilters, 'MX.otherPlantPest'),
      quarantinePlantPest: this.hasInMulti(query.adminStatusFilters, 'MX.quarantinePlantPest'),
      nationalInvasiveSpeciesStrategy: this.hasInMulti(query.adminStatusFilters, 'MX.nationalInvasiveSpeciesStrategy'),
      otherInvasiveSpeciesList: this.hasInMulti(query.adminStatusFilters, 'MX.otherInvasiveSpeciesList'),
      controllingRisksOfInvasiveAlienSpecies: this.hasInMulti(query.adminStatusFilters, 'MX.controllingRisksOfInvasiveAlienSpecies'),
      allInvasiveSpecies: this.hasInMulti(query.adminStatusFilters, this.invasiveStatuses.map(val => 'MX.' + val)),
      onlyBold: query.hasBoldData === true,
      onlyNonBold: query.hasBoldData === false
    };

    this.updateInvasiveSelected();
    this.updateBoldSelected();
  }

  private hasInMulti(multi: any, value: any, noOther = false): boolean {
    if (Array.isArray(value)) {
      return value.filter(val => !this.hasInMulti(multi, val, noOther)).length === 0;
    }
    if (Array.isArray(multi) && multi.indexOf(value) > -1) {
      return noOther ? multi.length === (Array.isArray(value) ? value.length : 1) : true;
    }
    return false;
  }
}
