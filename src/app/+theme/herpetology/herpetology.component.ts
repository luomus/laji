/**
 * Created by mjtahtin on 18.4.2017.
 */
import { Component, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Subscription } from 'rxjs/Subscription';
import { TranslateService } from '@ngx-translate/core';
import { Taxonomy, TaxonomyImage } from '../../shared/model/Taxonomy';
// import { Taxonomy, TaxonomyImage } from '../../shared/model/Taxonomy/info-card';
import { TaxonomyApi } from '../../shared/api/TaxonomyApi';
import { Logger } from '../../shared/logger/logger.service';

import { Observable } from 'rxjs/Observable';

@Component({
  selector: '[laji-herpetology]',
  templateUrl: './herpetology.component.html',
  styleUrls: ['./herpetology.component.css']
})
export class HerpetologyComponent implements OnInit {


  showForm = false;
  lang;
  private subTrans: Subscription;
  year;
  currentYear;

  public amphibianTaxa: {taxon: Taxonomy, images: any}[] = [{taxon: {id: 'MX.2'}, images: []}];
  public reptileTaxa: {taxon: Taxonomy, images: any}[] = [];
  public occasionalTaxa: {taxon: Taxonomy, images: any}[] = [];

  public taxonImages: Array<TaxonomyImage>;
 // public amphibianImages: Observable<TaxonomyImage[]>;
  public amphibianImages: Array<TaxonomyImage>;

  public amphibianGalleries: Array<Array<TaxonomyImage>>;

  constructor(private translate: TranslateService,  private taxonomyApi: TaxonomyApi, private logger: Logger) {
    const now = new Date();
    this.currentYear = now.getFullYear() + '-01-01';
    const path = "";
    this.taxonImages = new Array();
    this.amphibianImages = new Array();
    this.amphibianGalleries = new Array();

    //this.amphibianTaxa = new Array();
    //this.reptileTaxa = new Array();
    //this.occasionalTaxa = new Array();

  }

  ngOnInit() {
    //   this.showForm = !environment.production;
    this.lang = this.translate.currentLang;
    this.updateTaxa();

   /* var numbers = Rx.Observable.range(1, 7);
    var result = numbers.count(i => i % 2 === 1);
    result.subscribe(x => console.log(x));
    //var numbers = Rx.Observable.range(1, 7);
    var result = this.amphibianTaxa.count(i => i !== null);
    result.subscribe(x => console.log(x));

    //loop over taxons
    for (let i = 0;
    this.amphibianTaxa.count() < result;
    i++
    )

    {

    this.getTaxonMedia(this.amphibianTaxa[i].taxonId);
      //this.getTaxonMedia('MX.37626');
  }

    this.getTaxonMedia('MX.37626');
    this.getTaxonMedia('MX.37621');
    this.getTaxonMedia('MX.37623');
    this.getTaxonMedia('MX.37628');
    this.getTaxonMedia('MX.37630');
*/
    this.subTrans = this.translate.onLangChange.subscribe(res => {
      this.lang = res.lang;
    });
}

  updateTaxa() {
    Observable.forkJoin(
      this.taxonomyApi
        .taxonomyFindSpecies('MX.37609', 'multi', 'MVL.26',  undefined, undefined, 'MX.typeOfOccurrenceStablePopulation')
        .map(species => species.results)
        .switchMap(data => {
          return Observable.forkJoin(data.map(taxon => this.taxonomyApi
            .taxonomyFindMedia(taxon.id, this.translate.currentLang)
            .map(images => ({taxon: taxon, images: images}))
          ));
        }),
      this.taxonomyApi
        .taxonomyFindSpecies('MX.37610', 'multi', 'MVL.162',  undefined, undefined, 'MX.typeOfOccurrenceStablePopulation')
        .map(species => species.results)
        .switchMap(data => {
          return Observable.forkJoin(data.map(taxon => this.taxonomyApi
            .taxonomyFindMedia(taxon.id, this.translate.currentLang)
            .map(images => ({taxon: taxon, images: images}))
          ));
        }),
      this.taxonomyApi
        .taxonomyFindSpecies('MX.37608', 'multi', 'MVL.26',  undefined, undefined, 'MX.typeOfOccurrenceAnthropogenic,MX.typeOfOccurrenceRareVagrant,MX.typeOfOccurrenceVagrant')
        .map(species => species.results)
        .switchMap(data => {
          return Observable.forkJoin(data.map(taxon => this.taxonomyApi
            .taxonomyFindMedia(taxon.id, this.translate.currentLang)
            .map(images => ({taxon: taxon, images: images}))
          ));
        })
    ).subscribe(data => {
      setTimeout(() => {
        this.amphibianTaxa = data[0];
        this.reptileTaxa = data[1];
        this.occasionalTaxa = data[2];
      }, 100);
      console.log(data);
      console.log(this.amphibianTaxa);
      console.log(this.amphibianTaxa[0]);
      console.log(this.amphibianTaxa[0].taxon.scientificName);
    });
  }
}
