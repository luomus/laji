import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { Form } from '../../../shared/model/Form';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { map } from 'rxjs/operators';
import { WarehouseQueryInterface } from '../../../shared/model/WarehouseQueryInterface';
import { LajiApiClientBService } from 'projects/laji-api-client-b/src/laji-api-client-b.service';

interface State {
  taxon: string | undefined;
  year: string | undefined;
}

@Component({
  selector: 'laji-water-bird-count-result',
  templateUrl: './water-bird-count-result.component.html',
  styleUrls: ['./water-bird-count-result.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WaterBirdCountResultComponent implements OnInit {
  @Input() form!: Form.SchemaForm;

  state$!: Observable<State>;
  collections: string[] = ['HR.62', 'HR.3991', 'HR.3992'];
  taxonOptions$!: Observable<{ label: string; value: string }[]>;
  mapQuery: WarehouseQueryInterface = {
    includeSubCollections: false,
    gatheringCounts: true, cache: true, countryId: ['ML.206']
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: LajiApiClientBService,
    private translate: TranslateService
  ) { }

  ngOnInit(): void {
    this.state$ = this.route.queryParams as Observable<State>;
    this.taxonOptions$ = this.getTaxonOptions$();
  }

  getTaxonOptions$(): Observable<{ label: string; value: string }[]> {
    return this.api.post('/taxa', { query: {
        selectedFields: 'id,vernacularName,scientificName',
        pageSize: 10000
      } }, {
        taxonSets: 'MX.taxonSetWaterbirdWaterbirds',
      }).pipe(
      map(res => res.results),
      map(taxa => taxa.map(t => ({
        label: (t.vernacularName ? t.vernacularName + ' - ' : '') + (t.scientificName ? t.scientificName : ''),
        value: t.id ?? ''
      }))),
      map(pairs => [{ label: this.translate.instant('result.map.taxon.empty.label'), value: '' }].concat(pairs))
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

  onYearChange(year: any) {
    this.updateState({ year });
  }
}
