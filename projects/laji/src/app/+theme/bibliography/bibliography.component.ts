import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { LajiApiClientBService } from 'projects/laji-api-client-b/src/laji-api-client-b.service';
import { components } from 'projects/laji-api-client-b/generated/api';

type Information = components['schemas']['Information'];

@Component({
    selector: 'laji-bibliography',
    template: `
    <div class="container-fluid">
      <h1>{{ 'finbif-bib.title' | translate }}</h1>
      <p>{{ 'finbif-bib.intro' | translate }}</p>
      <hr>
      <div class="finBif-publications" innerHTML="{{ (publications$ | async )?.content }}"></div>
    </div>
  `,
    standalone: false
})

export class BibliographyComponent implements OnInit {
  publications$!: Observable<Information>;

  constructor(
    private api: LajiApiClientBService
  ) {}

  ngOnInit() {
    this.publications$ = this.api.get('/information/{id}', { path: { id: 'finbif-bib-all' } });
  }
}
