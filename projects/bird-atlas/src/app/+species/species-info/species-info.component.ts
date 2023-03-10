import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { environment } from 'projects/bird-atlas/src/env/environment';
import { Taxon } from 'projects/laji-api-client/src/public-api';
import { HeaderService } from 'projects/laji/src/app/shared/service/header.service';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { AtlasApiService, AtlasTaxon } from '../../core/atlas-api.service';
import { BreadcrumbId, BreadcrumbService } from '../../core/breadcrumb.service';

const capitalize = (str: string): string => str.charAt(0).toUpperCase() + str.substring(1);

interface SpeciesInfoData {
  taxon: AtlasTaxon;
  map: SafeHtml;
}

// Temporarily hardcode sensitive taxa until the data is available in the API
const sensitiveTaxa = new Set([
  'MX.26287','MX.26291','MX.26290','MX.26416','MX.26438','MX.26921','MX.26931', 'MX.26928', 'MX.26926',
  'MX.25836', 'MX.25844', 'MX.26488', 'MX.26518', 'MX.26530', 'MX.26597', 'MX.26592', 'MX.26594', 'MX.26596',
  'MX.26647', 'MX.26701', 'MX.26704', 'MX.26722', 'MX.26723', 'MX.26727', 'MX.26472', 'MX.26805', 'MX.26808',
  'MX.26811', 'MX.26825', 'MX.26828', 'MX.27689', 'MX.27697', 'MX.27688', 'MX.206761', 'MX.27665', 'MX.27603',
  'MX.27621', 'MX.27632', 'MX.27797', 'MX.27821', 'MX.27791', 'MX.27955', 'MX.28965', 'MX.28987', 'MX.29008',
  'MX.29011', 'MX.28998', 'MX.29003', 'MX.29004', 'MX.29072', 'MX.29038', 'MX.29068', 'MX.29860', 'MX.30438',
  'MX.32076', 'MX.32816', 'MX.200001', 'MX.32953', 'MX.32207', 'MX.32181', 'MX.32182', 'MX.32625', 'MX.33671',
  'MX.33939', 'MX.33890', 'MX.34517', 'MX.37095', 'MX.35165', 'MX.35169', 'MX.27605', 'MX.27853',
]);

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
      switchMap(params => forkJoin({
        taxon: this.atlasApi.getTaxon(params.get('id')).pipe(
          catchError(err => {
            console.error(err);
            return of(undefined);
          })
        ),
        map: this.atlasApi.getSpeciesMap(params.get('id')).pipe(
          map(html => this.sanitizer.bypassSecurityTrustHtml(html)),
          catchError(err => {
            console.error(err);
            return of(undefined);
          })
        )
      })),
      tap(data => {
        const name: string = data.taxon.vernacularName[this.translate.currentLang];
        this.breadcrumbs.setBreadcrumbName(
          BreadcrumbId.SpeciesInfo,
          name.charAt(0).toUpperCase() + name.substring(1)
        );
        this.headerService.setHeaders({
          title: `${capitalize(data.taxon.vernacularName[this.translate.currentLang])} | ${this.translate.instant('ba.header.title')}`
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
      lang => capitalize(taxon.vernacularName[lang])
    ).join(', ');
  }

  getMapDownloadUrl(id: string) {
    return `${environment.atlasApiBasePath}/map/${id}/atlas?lang=${this.translate.currentLang}&scaling=0`;
  };

  isSensitive(id: string): boolean {
    return sensitiveTaxa.has(id);
  }

  capitalize(str: string): string { return capitalize(str); }
}
