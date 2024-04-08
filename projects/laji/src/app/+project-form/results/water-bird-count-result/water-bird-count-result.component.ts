import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { Form } from '../../../shared/model/Form';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { TaxonomyApi } from '../../../shared/api/TaxonomyApi';
import { TranslateService } from '@ngx-translate/core';
import { map } from 'rxjs/operators';

interface State {
  taxon: string | undefined;
}

@Component({
  selector: 'laji-water-bird-count-result',
  templateUrl: './water-bird-count-result.component.html',
  styleUrls: ['./water-bird-count-result.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WaterBirdCountResultComponent implements OnInit {
  @Input() form: Form.SchemaForm;

  state$: Observable<State>;
  collections = ['HR.62', 'HR.3991', 'HR.3992'];
  taxonOptions$: Observable<{label: string; value: string }[]>;
  mapQuery = {
    includeSubCollections: false,
    gatheringCounts: true, cache: true, countryId: ['ML.206']
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private taxonApi: TaxonomyApi,
    private translate: TranslateService
  ) { }

  ngOnInit(): void {
    this.state$ = this.route.queryParams as Observable<State>;
    this.taxonOptions$ = this.getTaxonOptions$();
  }

  getTaxonOptions$(): Observable < { label: string; value: string }[] > {
    return this.taxonApi.taxonomyList(
      this.translate.currentLang,
      {
        selectedFields: 'id,vernacularName,scientificName',
        taxonSets: ['MX.taxonSetWaterbirdWaterbirds'],
        pageSize: 10000
      }
    ).pipe(
      map(res => res.results),
      map(taxa => taxa.map(t => ({
        label: (t.vernacularName ? t.vernacularName + ' - ' : '') + (t.scientificName ? t.scientificName : ''),
        value: t.id
      }))),
      map(pairs => [{ label: '', value: '' }].concat(pairs))
    );
  }

  updateState(query: any) {
    const currentState = this.route.snapshot.queryParams;
    const nextState = { ...currentState, ...query };
    this.router.navigate([], { queryParams: nextState });
  }

  onTaxonChange(taxon: any) {
    this.updateState({ taxon });
  }
}
