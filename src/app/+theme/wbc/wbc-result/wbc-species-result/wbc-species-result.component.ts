import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { AreaType } from '../../../../shared/service/area.service';
import { WbcResultService, SEASON } from '../wbc-result.service';

@Component({
  selector: 'laji-wbc-species-result',
  templateUrl: './wbc-species-result.component.html',
  styleUrls: ['./wbc-species-result.component.css']
})
export class WbcSpeciesResultComponent implements OnInit {
  years: number[] = [];
  seasons: SEASON[] = ['fall', 'winter', 'spring'];
  areaTypes = AreaType;

  activeYear: number;
  activeSeason: SEASON;
  activeBirdAssociationArea: string;

  constructor(
    private resultService: WbcResultService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.resultService.getYears()
      .subscribe(
        years => {
          this.years = years;
          this.cd.markForCheck();
        }
      )
  }

  yearChange(newYear: string) {
    if (!newYear) {
      this.activeYear = undefined;
      this.seasonChange(undefined);
      return;
    }
    this.activeYear = parseInt(newYear, 10);
  }

  seasonChange(newSeason: SEASON) {
    this.activeSeason = newSeason;
  }

  birdAssociationAreaChange(newArea: string) {
    this.activeBirdAssociationArea = newArea;
  }


}
