import { Component, OnInit, OnChanges, Input } from '@angular/core';
import { WbcResultService, SEASON } from '../../wbc-result.service';
import { WarehouseQueryInterface } from '../../../../../shared/model/WarehouseQueryInterface';

@Component({
  selector: 'laji-wbc-species-maps',
  templateUrl: './wbc-species-maps.component.html',
  styleUrls: ['./wbc-species-maps.component.css']
})
export class WbcSpeciesMapsComponent implements OnInit, OnChanges {
  @Input() taxonId: string;
  @Input() taxonCensus = undefined;
  @Input() year: number;
  @Input() season: SEASON;
  @Input() birdAssociationArea: string;

  query1: WarehouseQueryInterface;
  query2: WarehouseQueryInterface;
  query3: WarehouseQueryInterface;

  zeroQuery1: WarehouseQueryInterface;
  zeroQuery2: WarehouseQueryInterface;
  zeroQuery3: WarehouseQueryInterface;

  breaks = [0, 1, 32, 128, 512, 2048, 8192];
  labels = ['0', '1-31', '32-127', '128-511', '512-2047', '2048-8191', '8192-'];
  colorRange = ['#ffffff', 'violet', 'blue', 'lime', 'yellow', 'orange', 'red'];

  constructor(
    private resultService: WbcResultService
  ) { }

  ngOnInit() { }

  ngOnChanges() {
    if (this.taxonId && this.year) {
      this.setQuerys();
    }
  }

  private setQuerys() {
    this.setQuery(1, 'fall');
    this.setQuery(2, 'winter');
    this.setQuery(3, 'spring');
  }

  private setQuery(nbr: number, season: SEASON) {
    const filterParams = this.resultService.getFilterParams(this.year, season, this.birdAssociationArea);
    this['query' + nbr] = {
      ...filterParams,
      taxonId: [this.taxonId]
    };
    this['zeroQuery' + nbr] = {
      ...filterParams,
      taxonCensus: [this.taxonCensus]
    };
  }
}
