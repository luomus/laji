import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Taxon } from 'projects/laji-api-client/src/public-api';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ApiService } from '../../core/api.service';

@Component({
  selector: 'ba-species-info',
  templateUrl: './species-info.component.html',
  styleUrls: ['./species-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpeciesInfoComponent {
  taxon$: Observable<Taxon> = this.route.paramMap.pipe(
    switchMap(params => this.api.getTaxon(params.get('id'), {}, 'multi'))
  );

  constructor(private route: ActivatedRoute, private api: ApiService, private translate: TranslateService) {}

  getVernacularName(taxon: Taxon) {
    return taxon.vernacularName[this.translate.currentLang];
  }

  getForeignVernacularNames(taxon: Taxon) {
    return ['fi', 'sv', 'en'].filter(
      lang => lang !== this.translate.currentLang
    ).map(lang => taxon.vernacularName[lang]).join(', ');
  }
}
