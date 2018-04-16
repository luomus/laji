import {Component, Input, OnInit, OnDestroy } from '@angular/core';
import { AreaType } from '../../../../shared/service/area.service';
import { WarehouseApi } from '../../../../shared/api';
import {PagedResult, WarehouseQueryInterface} from '../../../../shared/model';
import {ActivatedRoute, Router} from "@angular/router";
import {Subscription} from "rxjs/Subscription";
import {ObservationListService} from "../../../../shared-modules/observation-result/service/observation-list.service";

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
  query: WarehouseQueryInterface;
  private subQuery: Subscription;
  private fetchSub: Subscription;
  result: PagedResult<any> = {
    currentPage: 1,
    lastPage: 1,
    results: [],
    total: 0,
    pageSize: 0
  };
  years = [];
  yearLineLengths: any;
  minYear: number;
  maxYear: number;
  line = [];
  afterBothFetched: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private resultService: ObservationListService
  ) {}

  ngOnInit() {
    this.subQuery = this.route.queryParams.subscribe(({taxonId, birdAssociationAreas}) => {
      if (taxonId) this.taxonId = taxonId;
      if (birdAssociationAreas) this.birdAssociationAreas = birdAssociationAreas.split(',');
      this.fetch();
    });
    this.fetchSub = this.resultService.getAggregate(
      {
        collectionId: [this.collectionId],
        namedPlaceId: this.birdAssociationAreas
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
        if (!year) return;
        yearLineLengths[year] = result.count;
        if (minYear === undefined || year < minYear) minYear = +year;
        if (maxYear === undefined || year > maxYear) maxYear = +year;
      });
      this.yearLineLengths = yearLineLengths;
      this.minYear = minYear;
      this.maxYear = maxYear;
      console.log("initial data", this.minYear, this.maxYear);
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
    console.log('update', this.taxonId, this.birdAssociationAreas);
    this.navigate(this.taxonId, this.birdAssociationAreas);
  }

  private fetch() {
    this.loading = true;
    this.fetchSub = this.resultService.getAggregate(
      {
        //time: [this.parseDateTimeRange(time || '' + this.getCurrentSeason())],
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
        console.log("got data, should update", data);
        this.loading = false;
        let yearsToPairCounts = {};
        data.results.forEach(result => {
          const {year} = result.gathering.conversions;
          if (!year) return;
          yearsToPairCounts[year] = result.individualCountSum;
        });
        this.afterBothFetched = () => {
          this.line = Object.keys(this.yearLineLengths).map(year => {
            return yearsToPairCounts[year];
          });
          console.log("this.line", this.line);
        };

        if (this.yearLineLengths) {
          console.log("RIGHT AWAY");
          this.afterBothFetched();
          this.afterBothFetched = undefined;
        }
        //this.changeDetectorRef.markForCheck();
      }, (err) => {
        this.loading = false;
        //this.changeDetectorRef.markForCheck();
        //this.logger.error('Observation table data handling failed!', err);
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
