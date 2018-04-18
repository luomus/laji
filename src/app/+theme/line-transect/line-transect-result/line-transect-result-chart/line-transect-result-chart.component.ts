import {Component, Input, OnInit, OnDestroy, ChangeDetectorRef} from '@angular/core';
import { AreaType } from '../../../../shared/service/area.service';
import { WarehouseApi } from '../../../../shared/api';
import {PagedResult, WarehouseQueryInterface} from '../../../../shared/model';
import {ActivatedRoute, Router} from "@angular/router";
import {Subscription} from "rxjs/Subscription";
import {ObservationListService} from "../../../../shared-modules/observation-result/service/observation-list.service";
import {Logger} from "../../../../shared/logger";

@Component({
  selector: 'laji-line-transect-result-chart',
  templateUrl: './line-transect-result-chart.component.html',
  styleUrls: ['./line-transect-result-chart.component.css']
})
export class LineTransectResultChartComponent implements OnInit, OnDestroy {

  @Input() informalTaxonGroup: string;
  @Input() collectionId: string;
  @Input() lang = 'fi';

  loading = false;
  areaTypes = AreaType;
  birdAssociationAreas = [];
  taxon: string;
  private taxonId: string;
  private subQuery: Subscription;
  private fetchSub: Subscription;
  result: PagedResult<any> = {
    currentPage: 1,
    lastPage: 1,
    results: [],
    total: 0,
    pageSize: 0
  };
  private yearLineLengths: any;
  minYear: number;
  maxYear: number;
  line: number[][];
  private afterBothFetched: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private resultService: ObservationListService,
    private logger: Logger,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.subQuery = this.route.queryParams.subscribe(({taxonId, birdAssociationAreas}) => {
      if (taxonId) this.taxonId = taxonId;
      if (birdAssociationAreas) this.birdAssociationAreas = birdAssociationAreas.split(',');
      this.fetch();
    });
    this.loading = true;
    this.fetchSub = this.resultService.getAggregate(
      {
        collectionId: [this.collectionId]
      },
      ['gathering.conversions.year'],
      1,
      1000,
      [],
      this.lang
    ).subscribe(data => {
      const yearLineLengths = {};
      let minYear, maxYear;
      data.results.forEach(result => {
        const {year} = result.gathering.conversions;
        if (!year) {
          return;
        }
        yearLineLengths[year] = result.count;
        if (minYear === undefined || year < minYear) {
          minYear = +year;
        }
        if (maxYear === undefined || year > maxYear) {
          maxYear = +year;
        }
      });
      this.yearLineLengths = yearLineLengths;
      this.minYear = minYear;
      this.maxYear = maxYear;
      if (this.afterBothFetched) {
        this.afterBothFetched();
        this.afterBothFetched = undefined;
      }
    });
  }

  ngOnDestroy() {
    this.subQuery.unsubscribe();
  }

  private navigate(taxonId: string, birdAssociationAreas: string[]) {
    this.router.navigate([], {queryParams: {
      taxonId: taxonId,
      birdAssociationAreas: birdAssociationAreas.join(',')
    }});
  }

  private update() {
    this.navigate(this.taxonId, this.birdAssociationAreas);
  }

  private fetch() {
    this.loading = true;
    this.fetchSub = this.resultService.getAggregate(
      {
        collectionId: [this.collectionId],
        namedPlaceId: this.birdAssociationAreas,
        taxonId: [this.taxonId],
        pairCounts: true
      },
      ['gathering.conversions.year'],
      1,
      1000,
      [],
      this.lang
    ).subscribe(data => {
        this.result = data;
        const yearsToPairCounts = {};
        data.results.forEach(result => {
          const {year} = result.gathering.conversions;
          if (!year) return;
          yearsToPairCounts[year] = result.individualCountSum;
        });
        this.afterBothFetched = () => {
          this.line = Object.keys(yearsToPairCounts).map(year =>
            [+year, yearsToPairCounts[year] / this.yearLineLengths[year]]
          );
          console.log(this.line);
          this.loading = false;
          this.cdr.markForCheck();
        };

        if (this.yearLineLengths) {
          this.afterBothFetched();
          this.afterBothFetched = undefined;
        }
      }, (err) => {
        this.logger.error('Line transect chart data handling failed!', err);
      });
  }

  updateBirdAssociationArea(value) {
    this.birdAssociationAreas = value;
    this.update();
  }

  onTaxonSelect(value, result) {
    this.taxonId = result.key;
    this.update();
  }
}
