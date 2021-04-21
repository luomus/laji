import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { KerttuGlobalApi } from '../../kerttu-global-shared/service/kerttu-global-api';
import { Observable } from 'rxjs';

@Component({
  selector: 'laji-species-list',
  templateUrl: './species-list.component.html',
  styleUrls: ['./species-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpeciesListComponent implements OnInit {
  speciesList$: Observable<any[]>;

  constructor(
    private kerttuApi: KerttuGlobalApi
  ) {
    this.speciesList$ = this.kerttuApi.getSpeciesList();
   }

  ngOnInit(): void {
  }

}
