import { Component, OnInit } from '@angular/core';
import { SEASON } from '../wbc-result.service';
import { IdService } from '../../../../shared/service/id.service';
import { ActivatedRoute, Router } from '@angular/router';
import { LocalizeRouterService } from '../../../../locale/localize-router.service';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

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

  species$: Observable<string>;

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.species$ = this.route.queryParams.pipe(map(queryMap => queryMap['species']));
  }

  taxonSelect(fullId: string) {
    const species = IdService.getId(fullId);
    this.router.navigate(
      [],
      {
        queryParams: {species, year: this.activeYear, season: this.activeSeason, birdAssociationArea: this.activeBirdAssociationArea},
        queryParamsHandling: 'merge'
      }
    );
  }
}
