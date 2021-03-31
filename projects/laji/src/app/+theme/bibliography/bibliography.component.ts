import { Component, OnInit } from '@angular/core';
import { LajiApi, LajiApiService } from '../../shared/service/laji-api.service';
import { Information } from '../../shared/model/Information';
import { Observable } from 'rxjs';

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


export class BibliographyComponent implements OnInit {

  publications$: Observable<Information>;

  constructor(
    private apiService: LajiApiService
  ) {}

  ngOnInit() {
    this.publications$ = this.apiService.get(LajiApi.Endpoints.information, 'finbif-bib-all', {});
  }

}
