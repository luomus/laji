import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { SEASON, WbcResultService } from '../wbc-result.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { TaxonomyApi } from '../../../../shared/api/TaxonomyApi';
import { IdService } from '../../../../shared/service/id.service';

@Component({
  selector: 'laji-wbc-species-charts',
  templateUrl: './wbc-species-charts.component.html',
  styleUrls: ['./wbc-species-charts.component.css']
})
export class WbcSpeciesChartsComponent implements OnInit, OnDestroy {
  activeSpeciesId: string;
  activeSpecies: any;
  isMammal = false;

  speciesList: any[];

  activeYear: number;
  activeSeason: SEASON;
  activeBirdAssociationArea: string;

  showSeasonComparison = true;
  loading = false;

  mammals = 'MX.37612';
  private routeSub: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private taxonService: TaxonomyApi,
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

  updateTaxonInfo(id: string) {
    this.activeSpeciesId = id;
    this.loading = true;

    this.resultService.getSpeciesList(undefined, undefined, undefined, true, true).subscribe(data => {
      this.speciesList = data;
      this.activeSpecies = data.filter(d => (d['unit.linkings.taxon.speciesId'] === IdService.getUri(id)))[0];
      this.cd.markForCheck();
    });

    this.taxonService.taxonomyFindParents(id, undefined, {
      selectedFields: 'id'
    })
    .subscribe(data => {
      this.isMammal = false;
      data.map(parent => {
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
