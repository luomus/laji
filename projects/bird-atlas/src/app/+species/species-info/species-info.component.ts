import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { environment } from 'projects/bird-atlas/src/env/environment';
import { Taxon } from 'projects/laji-api-client/src/public-api';
import { HeaderService } from 'projects/laji/src/app/shared/service/header.service';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { AtlasApiService, AtlasTaxon, TaxonStatsResponse } from '../../core/atlas-api.service';
import { BreadcrumbId, BreadcrumbService } from '../../core/breadcrumb.service';
import { Lang } from '../../core/api.service';

const capitalize = (str: string): string => str.charAt(0).toUpperCase() + str.substring(1);

interface SpeciesInfoData {
  taxon: AtlasTaxon | undefined;
  map: SafeHtml | undefined;
  stats: TaxonStatsResponse | undefined;
}

@Component({
  templateUrl: './species-info.component.html',
  styleUrls: ['./species-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpeciesInfoComponent {
  data$: Observable<SpeciesInfoData>;

  loading = true;

  constructor(
    private route: ActivatedRoute,
    private atlasApi: AtlasApiService,
    private translate: TranslateService,
    private breadcrumbs: BreadcrumbService,
    private sanitizer: DomSanitizer,
    private headerService: HeaderService,
    private cdr: ChangeDetectorRef
  ) {
    this.data$ = this.route.paramMap.pipe(
      tap(() => {
        this.breadcrumbs.setBreadcrumbName(BreadcrumbId.SpeciesInfo, undefined);
        this.loading = true;
        this.cdr.markForCheck();
      }),
      map(params => params.get('id')!),
      switchMap(id => forkJoin({
        taxon: this.atlasApi.getTaxon(id).pipe(
          catchError(err => {
            console.error(err);
            return of(undefined);
          })
        ),
        map: this.atlasApi.getSpeciesMap(id).pipe(
          map(html => this.sanitizer.bypassSecurityTrustHtml(html)),
          catchError(err => {
            console.error(err);
            return of(undefined);
          })
        ),
        stats: this.atlasApi.getTaxonStats(id).pipe(
          catchError(err => {
            console.error(err);
            return of(undefined);
          })
        )
      })),
      tap(data => {
        const name: string = data.taxon!.vernacularName[<Lang>this.translate.currentLang];
        this.breadcrumbs.setBreadcrumbName(
          BreadcrumbId.SpeciesInfo,
          name.charAt(0).toUpperCase() + name.substring(1)
        );
        this.headerService.setHeaders({
          title: `${capitalize(data.taxon!.vernacularName[<Lang>this.translate.currentLang])} | ${this.translate.instant('ba.header.title')}`
        });
        this.loading = false;
        this.cdr.detectChanges();
      })
    );
  }

  getForeignVernacularNames(taxon: Taxon) {
    return ['fi', 'sv', 'en'].filter(
      lang => lang !== this.translate.currentLang
    ).map(
      lang => capitalize((taxon.vernacularName as any)[lang])
    ).join(', ');
  }

  getMapDownloadUrl(id: string) {
    return `${environment.atlasApiBasePath}/map/${id}/atlas?lang=${this.translate.currentLang}&scaling=0`;
  };

  capitalize(str: string): string { return capitalize(str); }
}
