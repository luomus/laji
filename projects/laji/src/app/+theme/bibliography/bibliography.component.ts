import { Component, OnInit } from '@angular/core';
import { LajiApi, LajiApiService } from '../../shared/service/laji-api.service';
import { Information } from '../../shared/model/Information';
import { Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'laji-bibliography',
  template: `
    <div class="container-fluid">
      <h1>{{ 'finbif-bib.title' | translate }}</h1>
      <p>{{ 'finbif-bib.intro' | translate }}</p>
      <hr>
      <div innerHTML="{{ (publications$ | async )?.content }}"></div>
    </div>
  `,
})


export class BibliographyComponent implements OnInit{

  publications$: Observable<Information>;

  constructor(
    private apiService: LajiApiService,
    private translate: TranslateService
  ) {
  }

ngOnInit() {
  this.publications$ = this.apiService.get(LajiApi.Endpoints.information, 'finbif-bib-top', {});
}

}
