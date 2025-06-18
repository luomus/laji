import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { SEASON, WbcResultService } from '../wbc-result.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { IdService } from '../../../../shared/service/id.service';
import { LajiApiClientBService } from 'projects/laji-api-client-b/src/laji-api-client-b.service';

@Component({
  selector: 'laji-wbc-species-charts',
  templateUrl: './wbc-species-charts.component.html',
  styleUrls: ['./wbc-species-charts.component.css']
})
export class WbcSpeciesChartsComponent implements OnInit, OnDestroy {
  activeSpeciesId?: string;
  activeSpecies: any;
  isMammal = false;

  speciesList!: any[];

  activeYear!: number;
  activeSeason!: SEASON;
  activeBirdAssociationArea!: string;

  showSeasonComparison = true;
  loading = false;

  mammals = 'MX.37612';
  private routeSub!: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: LajiApiClientBService,
    private resultService: WbcResultService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.routeSub = this.route.queryParams.subscribe(params => {
      this.updateTaxonInfo(params['species']);
    });
  }

  ngOnDestroy() {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
  }

  updateTaxonInfo(id?: string) {
    if (!id) {
      this.isMammal = false;
      this.activeSpecies = undefined;
      this.activeSpeciesId = undefined;
      this.cd.markForCheck();
      return;
    }
    this.activeSpeciesId = id;
    this.loading = true;

    this.resultService.getSpeciesList(undefined, undefined, undefined, true, true).subscribe(data => {
      this.speciesList = data;
      this.activeSpecies = data.filter(d => (d['unit.linkings.taxon.speciesId'] === IdService.getUri(id)))[0];
      this.cd.markForCheck();
    });

    this.api.get('/taxa/{id}/parents', { path: { id }, query: { selectedFields: 'id' } })
    .subscribe(data => {
      this.isMammal = false;
      data.results.map(parent => {
        if (parent.id === this.mammals) {
          this.isMammal = true;
        }
      });

      this.loading = false;
      this.cd.markForCheck();
    });
  }

  onSpeciesChange(id: string) {
    this.router.navigate( [],
      {
        queryParams: {species: IdService.getId(id)},
        queryParamsHandling: 'merge'
      }
    );
  }
}
