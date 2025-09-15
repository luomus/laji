import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostListener,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { TaxaSearchFilters, TaxonomySearch } from './service/taxonomy-search.service';
import { FooterService } from '../../shared/service/footer.service';
import { LocalizeRouterService } from '../../locale/localize-router.service';

const tabNameToIndex = {
  list: 0,
  images: 1,
};
const tabIndexToName = {
  0: 'list',
  1: 'images',
};

@Component({
  selector: 'laji-taxon-browse',
  templateUrl: './species.component.html',
  styleUrls: ['./species.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpeciesComponent implements OnInit, OnDestroy {
  public selectedIndex = 0;

  private subParams!: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public search: TaxonomySearch,
    private cd: ChangeDetectorRef,
    private footerService: FooterService,
    private localizeRouterService: LocalizeRouterService
  ) { }

  ngOnInit() {
    this.footerService.footerVisible = false;

    this.subParams = this.route.params.pipe(
      map(data => data['tab']),
    ).subscribe(tab => {
        this.selectedIndex = tabNameToIndex[<keyof typeof tabNameToIndex>tab];
        this.cd.markForCheck();
    });

    this.search.setSearchFromParams(convertOldParamModelToNew(this.route.snapshot.queryParams));
  }

  ngOnDestroy() {
    this.footerService.footerVisible = true;

    if (this.subParams) {
      this.subParams.unsubscribe();
    }
  }

  @HostListener('window:popstate')
  onPopState() {
    // Route snapshot is not populated with the latest info when this event is triggered. So we need to delay the execution little.
    setTimeout(() => {
      this.search.setSearchFromParams(this.route.snapshot.queryParams);
      this.cd.markForCheck();
    });
  }

  onSelect(tabIndex: number) {
    this.router.navigate(
      this.localizeRouterService.translateRoute(['/taxon', tabIndexToName[<keyof typeof tabIndexToName>tabIndex]]),
      {queryParams: this.route.snapshot.queryParams}
    );
  }
}

const convertOldParamModelToNew = (params: Params): Partial<Record<keyof TaxaSearchFilters, string>> => {
  const oldToNew: Record<string, keyof TaxaSearchFilters> = {
    informalGroupFilters: 'informalTaxonGroups',
    onlyFinnish: 'finnish',
    invasiveSpeciesFilter: 'invasiveSpecies',
    hasBoldData: 'hasBold',
    redListStatusFilters: 'latestRedListStatusFinland.status',
    adminStatusFilters: 'administrativeStatuses',
    taxonRanks: 'taxonRank',
    primaryHabitat: 'primaryHabitat.habitat',
    anyHabitat: 'primaryHabitatSearchStrings',
    typesOfOccurrenceFilters: 'typeOfOccurrenceInFinland',
  };

  const convertedParams = Object.keys(oldToNew).reduce<Partial<Record<keyof TaxaSearchFilters, string>>>((_params, oldKey) => {
    if (oldKey in params) {
      delete (_params as any)[oldKey];
      const param = params[oldKey];
      _params[oldToNew[oldKey]] = (param as any) instanceof Array ? param.join(',') : param;
    }
    return _params;
  }, {...params});

  const { typesOfOccurrenceNotFilters } = convertedParams as any;
  if (typesOfOccurrenceNotFilters) {
    convertedParams.typeOfOccurrenceInFinland = (convertedParams.typeOfOccurrenceInFinland || '') + [
      ,
      (typesOfOccurrenceNotFilters instanceof Array
        ? typesOfOccurrenceNotFilters
        : [typesOfOccurrenceNotFilters]).map(s => `!${s}`)
    ].join(',');
    delete (convertedParams as any).typesOfOccurrenceNotFilters;
  }
  return convertedParams;
};
