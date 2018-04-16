import {Component, Input } from '@angular/core';
import { AreaType } from '../../../../shared/service/area.service';
import { WarehouseApi } from '../../../../shared/api';
import { WarehouseQueryInterface } from '../../../../shared/model';
import {ActivatedRoute, Router} from "@angular/router";
import {Subscription} from "rxjs/Subscription";
import {ObservationListService} from "../../../../shared-modules/observation-result/service/observation-list.service";

@Component({
  selector: 'laji-line-transect-result-chart',
  templateUrl: './line-transect-result-chart.component.html',
  styleUrls: ['./line-transect-result-chart.component.css']
})
export class LineTransectResultChartComponent implements onInit, onDestroy {

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
    //this.query = {
    //  //time: [this.parseDateTimeRange(time || '' + this.getCurrentSeason())],
    //  collectionId: [this.collectionId],
    //  namedPlaceId: this.birdAssociationAreas,
    //  taxonId: this.taxonId,
    //  aggregateBy: ['gathering.conversions.year'],
    //  pairCounts: true
    //};
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
        taxonId: this.taxonId,
        pairCounts: true
      },
      ['gathering.conversions.year'],
      1,
      1000,
      [],
      this.lang
    ).subscribe(data => {
        this.result = data;
        console.log(this.result);
        this.loading = false;
        this.changeDetectorRef.markForCheck();
      }, (err) => {
        this.loading = false;
        this.changeDetectorRef.markForCheck();
        this.logger.error('Observation table data handling failed!', err);
      });
  }

  updateBirdAssociationArea(value) {
    console.log(this.birdAssociationAreas, value);
    this.birdAssociationAreas = value;
    this.update();
  }

  onTaxonSelect(value, result) {
    this.taxonId = result.key;
    this.update();
  }
}
