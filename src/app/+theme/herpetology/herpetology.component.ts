import { filter, map, merge, switchMap, tap } from 'rxjs/operators';
/**
 * Created by mjtahtin on 18.4.2017.
 */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { forkJoin as ObservableForkJoin, of, Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { Taxonomy, TaxonomyImage } from '../../shared/model/Taxonomy';
import { TaxonomyApi } from '../../shared/api/TaxonomyApi';
import { Logger } from '../../shared/logger/logger.service';
import { LocalStorage } from 'ngx-webstorage';

@Component({
  selector: 'laji-herpetology',
  templateUrl: './herpetology.component.html',
  styleUrls: ['./herpetology.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HerpetologyComponent implements OnInit {

  lang;
  private subTrans: Subscription;
  year;
  currentYear;

  public amphibianTaxa: {taxon: Taxonomy, images: any}[] = [];
  public reptileTaxa: {taxon: Taxonomy, images: any}[] = [];
  public occasionalTaxa: {taxon: Taxonomy, images: any}[] = [];

  public taxonImages: Array<TaxonomyImage>;
  public amphibianImages: Array<TaxonomyImage>;

  public amphibianGalleries: Array<Array<TaxonomyImage>>;

  @LocalStorage() herpetology;

  constructor(
    private translate: TranslateService,
    private taxonomyApi: TaxonomyApi,
    private cd: ChangeDetectorRef,
    private logger: Logger) {
    const now = new Date();
    this.currentYear = now.getFullYear() + '-01-01';
    this.taxonImages = [];
    this.amphibianImages = [];
    this.amphibianGalleries = [];
  }

  ngOnInit() {
    this.lang = this.translate.currentLang;
    this.updateTaxa();
    this.subTrans = this.translate.onLangChange.subscribe(res => {
      this.lang = res.lang;
    });
}

  updateTaxa() {
    const fetchData$ = ObservableForkJoin(
      this.taxonomyApi
        .taxonomyFindSpecies(
          'MX.37609', 'multi', 'MVL.26',  undefined, undefined, 'MX.typeOfOccurrenceStablePopulation', undefined, '1', '10', undefined,
          {selectedFields: 'id,alternativeVernacularName,vernacularName'}
        ).pipe(
        map(species => species.results)).pipe(
        switchMap(data => {
          return ObservableForkJoin(data.map(taxon => this.taxonomyApi
            .taxonomyFindMedia(taxon.id, 'multi').pipe(
            map(images => ({taxon: taxon, images: images[0] || {} })))
          ));
        })),
      this.taxonomyApi
        .taxonomyFindSpecies('MX.37610', 'multi', 'MVL.162',  undefined, undefined, 'MX.typeOfOccurrenceStablePopulation').pipe(
        map(species => species.results)).pipe(
        switchMap(data => {
          return ObservableForkJoin(data.map(taxon => this.taxonomyApi
            .taxonomyFindMedia(taxon.id, 'multi').pipe(
            map(images => ({taxon: taxon, images: images[0] || {}})))
          ));
        })),
      this.taxonomyApi
        .taxonomyFindSpecies('MX.37608', 'multi', 'MVL.26',  undefined, undefined,
          'MX.typeOfOccurrenceAnthropogenic,MX.typeOfOccurrenceRareVagrant,MX.typeOfOccurrenceVagrant').pipe(
        map(species => species.results)).pipe(
        switchMap(data => {
          return ObservableForkJoin(data.map(taxon => this.taxonomyApi
            .taxonomyFindMedia(taxon.id, 'multi').pipe(
            map(images => ({taxon: taxon, images: images[0] || {}})))
          ));
        }))
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
