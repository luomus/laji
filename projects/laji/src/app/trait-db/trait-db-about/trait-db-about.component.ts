import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LajiApiClientService } from 'projects/laji-api-client/src/laji-api-client.service';
import { map, startWith, switchMap } from 'rxjs';

const cmsIds = { fi: '9468', sv: '9468', en: '9468' };

@Component({
    template: `
@if (content$ | async; as information) {
  <div [innerHtml]="information?.content"></div>
}
`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class TraitDbAboutComponent {
  content$ = this.translate.onLangChange.pipe(
    startWith({lang: this.translate.getCurrentLang()}),
    map(event => cmsIds[event.lang as 'fi' | 'sv' | 'en']),
    switchMap(cmsId => this.api.get('/information/{id}', { path: { id: cmsId } }))
  );

  constructor(private api: LajiApiClientService, private translate: TranslateService) {}
}
