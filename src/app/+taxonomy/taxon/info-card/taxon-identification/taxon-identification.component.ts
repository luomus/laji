import { ChangeDetectionStrategy, Component, Input, OnInit, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { Taxonomy } from '../../../../shared/model/Taxonomy';
import { Image } from '../../../../shared/gallery/image-gallery/image.interface';
import { TaxonomyApi } from 'src/app/shared/api/TaxonomyApi';
import { switchMap, map } from 'rxjs/operators';
import { forkJoin } from 'rxjs';
import { PagedResult } from 'src/app/shared/model/PagedResult';
import { TranslateService } from '@ngx-translate/core';

type TaxonChildren = {
  taxonomy: Taxonomy,
  species: PagedResult<Taxonomy>
}[];

@Component({
  selector: 'laji-taxon-identification',
  templateUrl: './taxon-identification.component.html',
  styleUrls: ['./taxon-identification.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaxonIdentificationComponent implements OnInit, OnChanges {
  @Input() taxon: Taxonomy;
  @Input() taxonImages: Array<Image>;

  taxonChildren: TaxonChildren = [];

  loading = false;

  constructor(private taxonomyApi: TaxonomyApi, private cdr: ChangeDetectorRef, private translate: TranslateService) { }

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.taxon) {
      if (this.taxon.taxonRank === 'MX.species') {
        this.loading = false;
        this.taxonChildren = [];
        return;
      }
      this.loading = true;
      this.taxonomyApi.taxonomyFindChildren(this.taxon.id, this.translate.currentLang).pipe(
        switchMap(result => {
          return forkJoin(
            ...result.map(
              taxon => this.taxonomyApi.species({
                id: taxon.id,
                selectedFields: 'id,vernacularName,scientificName,cursiveName',
                includeMedia: true,
                pageSize: 8,
                sortOrder: 'observationCountFinland DESC'
              }, this.translate.currentLang).pipe(
                map(res => {
                  return {
                    taxonomy: taxon,
                    species: res
                  };
                })
              )
            )
          );
        })
      ).subscribe(res => {
        this.taxonChildren = res;
        this.loading = false;
        this.cdr.markForCheck();
      });
    }
  }
}
