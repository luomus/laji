import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { TaxonomySearch } from '../service/taxonomy-search.service';
import { startWith } from 'rxjs';

const invasiveStatuses = [
    'MX.euInvasiveSpeciesList',
    'MX.controllingRisksOfInvasiveAlienSpecies',
    'MX.quarantinePlantPest',
    'MX.qualityPlantPest',
    'MX.otherPlantPest',
    'MX.nationalInvasiveSpeciesStrategy',
    'MX.otherInvasiveSpeciesList',
  ] as const;
const invasiveStatusesDict = invasiveStatuses.reduce((dict, status) => {
  dict[status] = true;
  return dict;
}, {} as Record<InvasiveStatus, true>);

type InvasiveStatus = typeof invasiveStatuses[number];

@Component({
    selector: 'laji-species-form[search]',
    templateUrl: './species-form.component.html',
    styleUrls: ['./species-form.component.scss'],
    standalone: false
})
export class SpeciesFormComponent implements OnInit, OnDestroy {
  @Input() search!: TaxonomySearch;

  taxonSelectFilters!: Pick<TaxonomySearch['filters'], 'informalTaxonGroups' | 'finnish'>;

  subUpdate?: Subscription;

  invasiveSelected: (InvasiveStatus | 'allInvasiveSpecies' | 'onlyInvasive' | 'onlyNonInvasive')[] = [];

  typeOfOccurrenceInFinlandInclusions?: string[];
  typeOfOccurrenceInFinlandExclusions?: string[];

  finnishCheckboxValue!: boolean;

  initialOpen = {
    taxonRank: false,
    latestRedListStatusFinland: false,
    habitat: false,
    administrativeStatuses: false,
    typeOfOccurrenceInFinland: false,
    invasive: false,
    bold: false,
    dark: false,
  };

  constructor(
    public translate: TranslateService
  ) { }

  ngOnInit() {
    this.taxonSelectFilters = {
      informalTaxonGroups: this.search.filters.informalTaxonGroups,
      finnish: this.search.filters.finnish
    };

    this.finnishCheckboxValue = this.search.filters.finnish !== undefined;

    let firstUpdate = true;
    this.subUpdate = this.search.searchUpdated$.pipe(startWith(undefined)).subscribe(
      () => {
        this.taxonSelectFilters = {
          informalTaxonGroups: this.search.filters.informalTaxonGroups,
          finnish: this.search.filters.finnish
        };
        this.syncTypeOfOccurenceInFinland();
        this.syncInvasiveStatusesFromSearch();
        if (!firstUpdate) {
          return;
        }

        this.initialOpen = {
          typeOfOccurrenceInFinland: !!this.search.filters.typeOfOccurrenceInFinland?.length,
          taxonRank: !!this.search.filters.taxonRank?.length,
          latestRedListStatusFinland: !!this.search.filters['latestRedListStatusFinland.status']?.length,
          habitat: !!this.search.filters['primaryHabitatSearchStrings']?.length
          || !!this.search.filters['anyHabitatSearchStrings']?.length,
          administrativeStatuses: !!this.search.filters['administrativeStatuses']?.length,
          invasive: !!this.invasiveSelected.length,
          bold: this.search.filters.hasBold !== undefined || this.search.filters.hasReferenceSequences !== undefined,
          dark: this.search.filters.darkTaxon !== undefined,
        };
        firstUpdate = false;
      });
  }

  onSearchChange() {
    this.search.query = { ...this.search.query };
    this.search.filters = { ...this.search.filters };
    this.search.updateUrl();
  }

  onActiveFiltersChange(active: TaxonomySearch['filters'] & { taxonId?: string }) {
    const { taxonId, ...filters } = active;
    this.search.taxonId = taxonId;
    this.search.filters = filters;
    this.search.updateUrl();
  }

  /** `laji-observation-active` is agnostic to the shape of the "active filters", thus we need to smuggle taxonId in */
  getActiveFilters(): TaxonomySearch['filters'] & { taxonId?: string } {
    return { taxonId: this.search.taxonId, ...this.search.filters };
  }

  private syncTypeOfOccurenceInFinland() {
    this.typeOfOccurrenceInFinlandInclusions = this.search.filters.typeOfOccurrenceInFinland?.filter(v => !v.startsWith('!'));
    this.typeOfOccurrenceInFinlandExclusions = this.search.filters.typeOfOccurrenceInFinland?.filter(v => v.startsWith('!')).map(s => s.slice(1));
  }

  onFinnishCheckboxValueChange(value: boolean) {
    this.search.filters.finnish = value === true ? true : undefined;
    this.onSearchChange();
  }

  ngOnDestroy() {
    this.subUpdate?.unsubscribe();
  }

  onTaxonSelect(key: string) {
    this.search.taxonId = key;
    this.onSearchChange();
  }

  onHabitatChange(habitats: any) {
    this.search.filters['primaryHabitatSearchStrings'] = habitats.primaryHabitat;
    this.search.filters['anyHabitatSearchStrings'] = habitats.anyHabitat;
    this.onSearchChange();
  }

  updateTypesOfOccurrence(event: {true: string[]; false: string[]}) {
    this.search.filters.typeOfOccurrenceInFinland = [...event.true, ...event.false.map(v => `!${v}`)];
    this.onSearchChange();
  }

  onInvasiveChange(value: (InvasiveStatus | 'allInvasiveSpecies' | 'onlyInvasive' | 'onlyNonInvasive')[]) {
    let nextInvasiveSelected = value;

    if (value.includes('onlyInvasive') && this.search.filters.invasiveSpecies !== true) {
      nextInvasiveSelected = nextInvasiveSelected.filter(v => v !== 'onlyNonInvasive');
      this.search.filters.invasiveSpecies = true;
    } else if (value.includes('onlyNonInvasive') && this.search.filters.invasiveSpecies !== false) {
      nextInvasiveSelected = nextInvasiveSelected.filter(v => v !== 'onlyInvasive');
      this.search.filters.invasiveSpecies = false;
    } else if (['onlyInvasive', 'onlyNonInvasive'].every(v => !value.includes(v as any))) {
      this.search.filters.invasiveSpecies = undefined;
      nextInvasiveSelected = nextInvasiveSelected.filter(v => v !== 'onlyNonInvasive' && v !== 'onlyInvasive');
    }

    if (value.includes('allInvasiveSpecies') && !this.invasiveSelected.includes('allInvasiveSpecies')) {
      nextInvasiveSelected = [...nextInvasiveSelected, ...invasiveStatuses];
    } else if (!value.includes('allInvasiveSpecies') &&  invasiveStatuses.every(status => nextInvasiveSelected.includes(status))) {
      nextInvasiveSelected = [...nextInvasiveSelected, 'allInvasiveSpecies'];
    }

    if (!value.includes('allInvasiveSpecies') && this.invasiveSelected.includes('allInvasiveSpecies')) {
      nextInvasiveSelected = nextInvasiveSelected.filter(v => !(invasiveStatusesDict as any)[v]);
    }

    if (invasiveStatuses.some(status => !nextInvasiveSelected.includes(status)) && this.invasiveSelected.includes('allInvasiveSpecies')) {
      nextInvasiveSelected = nextInvasiveSelected.filter(v => v !== 'allInvasiveSpecies');
    }

    nextInvasiveSelected = [...new Set(nextInvasiveSelected)];
    this.invasiveSelected = nextInvasiveSelected;

    const administrativeStatuses = nextInvasiveSelected.filter(v => (invasiveStatusesDict as any)[v]);

    this.search.filters.administrativeStatuses = [...new Set([
      ...(this.search.filters.administrativeStatuses || []).filter(v => administrativeStatuses.includes(v as any)),
      ...administrativeStatuses
    ])];

    this.onSearchChange();
  }

  private syncInvasiveStatusesFromSearch() {
    const { administrativeStatuses, invasiveSpecies } = this.search.filters;

    if (invasiveSpecies) {
      this.invasiveSelected = ['onlyInvasive'];
    } else if (invasiveSpecies === false) {
      this.invasiveSelected = ['onlyNonInvasive'];
    } else {
      this.invasiveSelected = [];
    }
    if (administrativeStatuses) {
      this.invasiveSelected = [...this.invasiveSelected, ...invasiveStatuses.filter(v => administrativeStatuses.includes(v))];
      if (invasiveStatuses.every(v => administrativeStatuses.includes(v))) {
        this.invasiveSelected.push('allInvasiveSpecies');
      }
    }
  }
}
