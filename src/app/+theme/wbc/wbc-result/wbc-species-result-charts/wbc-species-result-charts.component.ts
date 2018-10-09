import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { SEASON } from '../wbc-result.service';
import { ActivatedRoute } from '@angular/router';
import { Subscription, forkJoin } from 'rxjs';
import { TaxonomyApi } from '../../../../shared/api/TaxonomyApi';

@Component({
  selector: 'laji-wbc-species-result-charts',
  templateUrl: './wbc-species-result-charts.component.html',
  styleUrls: ['./wbc-species-result-charts.component.css']
})
export class WbcSpeciesResultChartsComponent implements OnInit, OnDestroy {
  taxon: any;
  isMammal = false;

  activeYear: number;
  activeSeason: SEASON;
  activeBirdAssociationArea: string;

  compareMode: 'season'|'year' = 'season';
  loading = false;

  mammals = 'MX.37612';
  private routeSub: Subscription;

  constructor(
    private route: ActivatedRoute,
    private taxonService: TaxonomyApi,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.routeSub = this.route.params.subscribe(params => {
      this.updateTaxonInfo(params['id']);
    });
  }

  ngOnDestroy() {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
  }

  updateTaxonInfo(id: string) {
    this.loading = true;

    forkJoin([
      this.taxonService.taxonomyFindBySubject(id, 'fi', {
        selectedFields: 'id,vernacularName,scientificName,cursiveName'
      }),
      this.taxonService.taxonomyFindParents(id, undefined, {
        selectedFields: 'id'
      })
    ]).subscribe(data => {
      this.taxon = data[0];
      this.isMammal = false;
      data[1].map(parent => {
        if (parent.id === this.mammals) {
          this.isMammal = true;
        }
      });

      this.loading = false;
      this.cd.markForCheck();
    })
  }
}
