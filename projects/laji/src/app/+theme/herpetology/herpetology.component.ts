import { filter, map, merge, switchMap, tap } from 'rxjs/operators';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { forkJoin as ObservableForkJoin, of } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { Logger } from '../../shared/logger/logger.service';
import { LocalStorage } from 'ngx-webstorage';
import { LajiApiClientBService } from 'projects/laji-api-client-b/src/laji-api-client-b.service';
import { components } from 'projects/laji-api-client-b/generated/api.d';

type Taxon = components['schemas']['Taxon'];
type TaxonImage = components['schemas']['Image'];

@Component({
  selector: 'laji-herpetology',
  templateUrl: './herpetology.component.html',
  styleUrls: ['./herpetology.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HerpetologyComponent implements OnInit {
  currentYear: string;

  public amphibianTaxa: {taxon: Taxon; images: any}[] = [];
  public reptileTaxa: {taxon: Taxon; images: any}[] = [];
  public occasionalTaxa: {taxon: Taxon; images: any}[] = [];

  public taxonImages: Array<TaxonImage>;
  public amphibianImages: Array<TaxonImage>;

  public amphibianGalleries: Array<Array<TaxonImage>>;

  @LocalStorage() herpetology: any;

  constructor(
    public translate: TranslateService,
    private api: LajiApiClientBService,
    private cd: ChangeDetectorRef,
    private logger: Logger) {
    const now = new Date();
    this.currentYear = now.getFullYear() + '-01-01';
    this.taxonImages = [];
    this.amphibianImages = [];
    this.amphibianGalleries = [];
  }

  ngOnInit() {
    this.updateTaxa();
  }

  updateTaxa() {
    const fetchData$ = ObservableForkJoin(
      this.api.post('/taxa/{id}/species', { path: { id: 'MX.37609' }, query: {
        selectedFields:  'id,alternativeVernacularName,vernacularName',
        pageSize: 10
      } }, {
        informalTaxonGroups: 'MVL.26',
        typeOfOccurrenceInFinland: 'MX.typeOfOccurrenceStablePopulation'
      }
        ).pipe(
        map(species => species.results)).pipe(
        switchMap(data => ObservableForkJoin(data.map(taxon => this.api.get('/taxa/{id}/media',
          { path: { id: taxon.id } })
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            .pipe(
            map(({ results: images }) => ({taxon, images: images[0] || {} })))
          )))),
      this.api.post('/taxa/{id}/species', { path: { id: 'MX.37610' } }, {
        informalTaxonGroups: 'MVL.162',
        typeOfOccurrenceInFinland: 'MX.typeOfOccurrenceStablePopulation'
      }).pipe(
        map(species => species.results)).pipe(
        switchMap(data => ObservableForkJoin(data.map(taxon => this.api.get('/taxa/{id}/media', {
          path: { id: taxon.id }
        }).pipe(
            map(({ results: images }) => ({taxon, images: images[0] || {}})))
          )))),
      this.api.post('/taxa/{id}/species', { path: { id: 'MX.37608' } }, {
        informalTaxonGroups: 'MVL.26',
        typeOfOccurrenceInFinland: ['MX.typeOfOccurrenceAnthropogenic', 'MX.typeOfOccurrenceRareVagrant', 'MX.typeOfOccurrenceVagrant']
      }).pipe(
        map(species => species.results)).pipe(
        switchMap(data => ObservableForkJoin(data.map(taxon => this.api.get('/taxa/{id}/media', {
          path: { id: taxon.id }
        }).pipe(
            map(({ results: images }) => ({taxon, images: images[0] || {}})))
          ))))
    );

    of(this.herpetology).pipe(
      merge(fetchData$.pipe(tap(data => this.herpetology = data))),
      filter(data => !!data))
      .subscribe(data => {
          this.amphibianTaxa = data[0];
          this.reptileTaxa = data[1];
          this.occasionalTaxa = data[2];
          this.cd.markForCheck();
        },
        (err) => {
          this.logger.error('Failed to load herpetology images', err);
          this.cd.markForCheck();
        }
      );
  }
}
