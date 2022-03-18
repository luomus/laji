import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Taxon } from 'projects/laji-api-client/src/public-api';
import { HeaderService } from 'projects/laji/src/app/shared/service/header.service';
import { forkJoin, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { LajiApiService } from '../../core/api.service';
import { AtlasApiService } from '../../core/atlas-api.service';
import { BreadcrumbId, BreadcrumbService } from '../../core/breadcrumb.service';

const capitalize = (str: string): string => str.charAt(0).toUpperCase() + str.substring(1);

@Component({
  selector: 'ba-species-info',
  templateUrl: './species-info.component.html',
  styleUrls: ['./species-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpeciesInfoComponent {
  data$ = this.route.paramMap.pipe(
    tap(() => this.breadcrumbs.setBreadcrumbName(BreadcrumbId.SpeciesInfo, undefined)),
    switchMap(params => forkJoin({
      taxon: this.lajiApi.getTaxon(params.get('id'), {}, 'multi').pipe(
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
    })
  );

  constructor(
    private route: ActivatedRoute,
    private lajiApi: LajiApiService,
    private translate: TranslateService,
    private breadcrumbs: BreadcrumbService,
    private atlasApi: AtlasApiService,
    private sanitizer: DomSanitizer,
    private headerService: HeaderService
  ) {}

  getForeignVernacularNames(taxon: Taxon) {
    return ['fi', 'sv', 'en'].filter(
      lang => lang !== this.translate.currentLang
    ).map(
      lang => capitalize(taxon.vernacularName[lang])
    ).join(', ');
  }

  capitalize(str: string): string { return capitalize(str); }
}
