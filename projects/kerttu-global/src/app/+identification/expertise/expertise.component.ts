import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import { IGlobalSpeciesFilters } from '../../kerttu-global-shared/models';
import { KerttuGlobalApi } from '../../kerttu-global-shared/service/kerttu-global-api';

@Component({
  selector: 'bsg-expertise',
  templateUrl: './expertise.component.html',
  styleUrls: ['./expertise.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExpertiseComponent implements OnInit {
  speciesFilters$: Observable<IGlobalSpeciesFilters>;

  constructor(
    private kerttuGlobalApi: KerttuGlobalApi
  ) {
    this.speciesFilters$ = this.kerttuGlobalApi.getSpeciesFilters();
  }

  ngOnInit(): void {
  }

}
