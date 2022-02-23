import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Taxon } from 'projects/laji-api-client/src/public-api';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ApiService } from '../../core/api.service';

@Component({
  selector: 'ba-species-info',
  templateUrl: './species-info.component.html'
})
export class SpeciesInfoComponent {
  taxon$: Observable<Taxon> = this.route.paramMap.pipe(switchMap(params => this.api.getTaxon(params.get('id'))));
  constructor(private route: ActivatedRoute, private api: ApiService) {}
}
