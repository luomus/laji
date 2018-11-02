import { Component, OnInit } from '@angular/core';
import { SEASON } from '../wbc-result.service';
import { IdService } from '../../../../shared/service/id.service';
import { Router } from '@angular/router';
import { LocalizeRouterService } from '../../../../locale/localize-router.service';

@Component({
  selector: 'laji-wbc-species',
  templateUrl: './wbc-species.component.html',
  styleUrls: ['./wbc-species.component.css']
})
export class WbcSpeciesComponent implements OnInit {
  activeYear: number;
  activeSeason: SEASON;
  activeBirdAssociationArea: string;
  filterBy: string;

  onlyCommonSpecies = true;
  showStatistics = false;

  constructor(
    private router: Router,
    private localizeRouterService: LocalizeRouterService
  ) { }

  ngOnInit() { }

  taxonSelect(fullId: string) {
    const id = IdService.getId(fullId);
    this.router.navigate(
      this.localizeRouterService.translateRoute(['/theme/talvilintulaskenta/stats/species/' + id]),
      {queryParams: {year: this.activeYear, season: this.activeSeason, birdAssociationArea: this.activeBirdAssociationArea}}
    );
  }
}
