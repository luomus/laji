import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Taxon } from 'projects/laji-api-client/src/public-api';
import { Observable } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { ApiService } from '../../core/api.service';
import { BreadcrumbId, BreadcrumbService } from '../../core/breadcrumb.service';

@Component({
  selector: 'ba-species-info',
  templateUrl: './species-info.component.html',
  styleUrls: ['./species-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpeciesInfoComponent {
  taxon$: Observable<Taxon> = this.route.paramMap.pipe(
    tap(() => this.breadcrumbs.setBreadcrumbName(BreadcrumbId.SpeciesInfo, undefined)),
    switchMap(params => this.api.getTaxon(params.get('id'), {}, 'multi')),
    tap(taxon => {
      const name: string = taxon.vernacularName[this.translate.currentLang];
      this.breadcrumbs.setBreadcrumbName(
        BreadcrumbId.SpeciesInfo,
        name.charAt(0).toUpperCase() + name.substring(1)
      );
    })
  );

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private translate: TranslateService,
    private breadcrumbs: BreadcrumbService
  ) {}

  getForeignVernacularNames(taxon: Taxon) {
    return ['fi', 'sv', 'en'].filter(
      lang => lang !== this.translate.currentLang
    ).map(lang => taxon.vernacularName[lang]).join(', ');
  }
}
