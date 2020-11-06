import { ChangeDetectionStrategy, Component, Input, OnInit, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { Taxonomy } from '../../../../shared/model/Taxonomy';
import { Image } from '../../../../shared/gallery/image-gallery/image.interface';
import { TaxonomyApi } from 'src/app/shared/api/TaxonomyApi';
import { switchMap, map, tap, flatMap } from 'rxjs/operators';
import { forkJoin, Observable, of } from 'rxjs';
import { PagedResult } from 'src/app/shared/model/PagedResult';
import { TranslateService } from '@ngx-translate/core';
import { isArray } from 'underscore';

type TaxonChildren = {
  taxonomy: Taxonomy,
  species: PagedResult<Taxonomy>
}[];

interface TaxonomyWithChildren extends Taxonomy {
  children: TaxonomyWithChildren[]
}

const rankWhiteList = [
  'MX.superdomain',
  'MX.domain',
  'MX.kingdom',
  'MX.phylum',
  'MX.class',
  'MX.order',
  'MX.family',
  'MX.genus',
  'MX.species'
];

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
      // this.getChildTree(this.taxon, 2, 5).subscribe(d => console.log(d));

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

  getChildTree(taxon: Taxonomy, depth: number, maxDepth: number): Observable<TaxonomyWithChildren[]> {
    if (!taxon.hasChildren) {
      return of([<TaxonomyWithChildren>{
        ...taxon,
        children: []
      }]);
    }
    if (maxDepth <= 0) {
      return of([]);
    }
    return of(null).pipe(
      switchMap(() => this.getChildren(taxon.id, depth <= 1)),
      switchMap(subTaxa => forkJoin(
        ...subTaxa.map(subTaxon => {
          if (this.isMainRank(subTaxon.taxonRank)) {
            if (depth <= 1) {
              return of(subTaxon).pipe(map(s => { return {...s, children: []} }));
            } else {
              return this.getChildTree(subTaxon, depth - 1, maxDepth - 1).pipe(
                map(children => { return { ...subTaxon, children }})
              );
            }
          } else {
            return this.getChildTree(subTaxon, depth, maxDepth - 1);
          }
        }
      ))),
      map((arr: any[]) => arr.reduce((acc: any[], curr) => {
        Array.isArray(curr) ? acc.push(...curr) : acc.push(curr);
        return acc;
      }, []))
    );
  }

  getChildren(id: string, isLeaf?: boolean): Observable<Taxonomy[]> {
    const params = isLeaf ? {
      selectedFields: 'id,vernacularName,scientificName,cursiveName,taxonRank,hasChildren',
      includeMedia: true,
      sortOrder: 'observationCountFinland DESC'
    } : {
      selectedFields: 'id,vernacularName,scientificName,cursiveName,taxonRank,hasChildren',
      sortOrder: 'observationCountFinland DESC'
    }
    return this.taxonomyApi.taxonomyFindChildren(id, this.translate.currentLang, "1", params);
  }

  isMainRank(s: string): boolean {
    return rankWhiteList.includes(s);
  }
}
