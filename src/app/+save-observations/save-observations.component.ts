import { Component, OnInit } from '@angular/core';
import { SaveObservationsFacade } from './save-observations.facade';
import { Observable } from 'rxjs';
import { FormList } from '../+haseka/form-list/haseka-form-list';
import { environment } from '../../environments/environment';

@Component({
  templateUrl: `./save-observations.component.html`,
  styleUrls: ['./save-observations.component.scss']
})
export class SaveObservationsComponent implements OnInit {
  citizenScienceForms$: Observable<FormList[]>;
  birdMonitoringForms$: Observable<FormList[]>;
  researchProjectForms$: Observable<FormList[]>;

  constructor (private facade: SaveObservationsFacade) {}

  ngOnInit() {
    this.citizenScienceForms$ = this.facade.citizenScienceForms$;
    this.birdMonitoringForms$ = this.facade.birdMonitoringForms$;
    this.researchProjectForms$ = this.facade.researchProjectForms$;
    if (!environment.saveObservations) {
      return;
    }
    this.facade.loadAll(environment.saveObservations.citizenScienceForms,
                        environment.saveObservations.birdMonitoringForms,
                        environment.saveObservations.researchProjects);
  }
}
