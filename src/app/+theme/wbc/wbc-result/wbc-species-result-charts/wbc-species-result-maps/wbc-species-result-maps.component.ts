import { Component, OnInit, OnChanges, Input } from '@angular/core';
import { WbcResultService, SEASON } from '../../wbc-result.service';
import { WarehouseQueryInterface } from '../../../../../shared/model/WarehouseQueryInterface';

@Component({
  selector: 'laji-wbc-species-result-maps',
  templateUrl: './wbc-species-result-maps.component.html',
  styleUrls: ['./wbc-species-result-maps.component.css']
})
export class WbcSpeciesResultMapsComponent implements OnInit, OnChanges {
  @Input() taxonId: string;
  @Input() year: number;
  @Input() season: SEASON;
  @Input() birdAssociationArea: string;

  query1: WarehouseQueryInterface;
  query2: WarehouseQueryInterface;
  query3: WarehouseQueryInterface;

  constructor(
    private resultService: WbcResultService
  ) { }

  ngOnInit() { }

  ngOnChanges() {
    if (this.year) {
      this.setQuerys();
    }
  }

  private setQuerys() {
    this.query1 = {
      ...this.resultService.getFilterParams(this.year, 'fall', this.birdAssociationArea),
      taxonId: [this.taxonId],
    };
    this.query2 = {
      ...this.resultService.getFilterParams(this.year, 'winter', this.birdAssociationArea),
      taxonId: [this.taxonId],
    };
    this.query3 = {
      ...this.resultService.getFilterParams(this.year, 'spring', this.birdAssociationArea),
      taxonId: [this.taxonId],
    };
  }
}
