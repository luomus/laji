import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LajiApiClientBService } from 'projects/laji-api-client-b/src/laji-api-client-b.service';
import { of } from 'rxjs';
import { map, startWith, switchMap } from 'rxjs/operators';

const cmsIds = { fi: '6491', sv: '6491', en: '6491' };

@Component({
  template: `
<ng-container *ngIf="content$ | async; let information">
  <div [innerHtml]="information?.content"></div>
</ng-container>
`
})
export class TraitDbAboutComponent {
  content$ = this.translate.onLangChange.pipe(
    startWith({lang: this.translate.currentLang}),
    map(event => cmsIds[event.lang]),
    switchMap(cmsId => of({ content: 'todo: ' + cmsId }))
  );

  constructor(private api: LajiApiClientBService, private translate: TranslateService) {}
}
