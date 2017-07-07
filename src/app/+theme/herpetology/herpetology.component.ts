/**
 * Created by mjtahtin on 18.4.2017.
 */
import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { TranslateService } from '@ngx-translate/core';
import { Taxonomy, TaxonomyImage } from '../../shared/model/Taxonomy';
import { TaxonomyApi } from '../../shared/api/TaxonomyApi';
import { Logger } from '../../shared/logger/logger.service';

import { Observable } from 'rxjs/Observable';
import { CacheService } from '../../shared/service/cache.service';

@Component({
  selector: '[laji-herpetology]',
  templateUrl: './herpetology.component.html',
  styleUrls: ['./herpetology.component.css']
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

  constructor(
    private translate: TranslateService,
    private taxonomyApi: TaxonomyApi,
    private cacheService: CacheService,
    private logger: Logger) {
    const now = new Date();
    this.currentYear = now.getFullYear() + '-01-01';
    this.taxonImages = new Array();
    this.amphibianImages = new Array();
    this.amphibianGalleries = new Array();
  }

  ngOnInit() {
    this.lang = this.translate.currentLang;
    this.updateTaxa();
    this.subTrans = this.translate.onLangChange.subscribe(res => {
      this.lang = res.lang;
    });
}

  updateTaxa() {
    const fetchData$ = Observable.forkJoin(
      this.taxonomyApi
        .taxonomyFindSpecies(
          'MX.37609', 'multi', 'MVL.26',  undefined, undefined, 'MX.typeOfOccurrenceStablePopulation', undefined, '1', '10', undefined,
          {selectedFields: 'id,alternativeVernacularName,vernacularName'}
        )
        .map(species => species.results)
        .switchMap(data => {
          return Observable.forkJoin(data.map(taxon => this.taxonomyApi
            .taxonomyFindMedia(taxon.id, 'multi')
            .map(images => ({taxon: taxon, images: images[0] || {} }))
          ));
        }),
      this.taxonomyApi
        .taxonomyFindSpecies('MX.37610', 'multi', 'MVL.162',  undefined, undefined, 'MX.typeOfOccurrenceStablePopulation')
        .map(species => species.results)
        .switchMap(data => {
          return Observable.forkJoin(data.map(taxon => this.taxonomyApi
            .taxonomyFindMedia(taxon.id, 'multi')
            .map(images => ({taxon: taxon, images: images[0] || {}}))
          ));
        }),
      this.taxonomyApi
        .taxonomyFindSpecies('MX.37608', 'multi', 'MVL.26',  undefined, undefined,
          'MX.typeOfOccurrenceAnthropogenic,MX.typeOfOccurrenceRareVagrant,MX.typeOfOccurrenceVagrant')
        .map(species => species.results)
        .switchMap(data => {
          return Observable.forkJoin(data.map(taxon => this.taxonomyApi
            .taxonomyFindMedia(taxon.id, 'multi')
            .map(images => ({taxon: taxon, images: images[0] || {}}))
          ));
        })
    );

    const cacheKey = 'herpetology';
    this.cacheService.getItem<any[]>(cacheKey)
      .merge(fetchData$.do(data => this.cacheService.setItem(cacheKey, data)))
      .filter(data => !!data)
      .subscribe(data => {
          this.amphibianTaxa = data[0];
          this.reptileTaxa = data[1];
          this.occasionalTaxa = data[2];
        },
        (err) => {
          this.logger.error('Failed to load herpetology images', err);
        }
      );
  }
}
