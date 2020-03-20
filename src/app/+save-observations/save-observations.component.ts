import { Component, OnInit } from '@angular/core';
import { FormList } from 'app/+haseka/form-list/haseka-form-list';
import { SaveObservationsFacade } from './save-observations.facade';
import { Observable } from 'rxjs';

const citizenScienceFormIds = ['MHL.3', 'MHL.6', 'JX.652', 'MHL.53'];
const researchProjectFormIds = ['MHL.1', 'MHL.33', 'MHL.50', 'MHL.57'];
@Component({
  templateUrl: `./save-observations.component.html`,
  styleUrls: ['./save-observations.component.scss']
})
export class SaveObservationsComponent implements OnInit {
  citizenScienceForms$: Observable<FormList[]>;
  researchProjectForms$: Observable<FormList[]>;

  constructor (private facade: SaveObservationsFacade) {}

  ngOnInit() {
    this.citizenScienceForms$ = this.facade.citizenScienceForms$;
    this.researchProjectForms$ = this.facade.researchProjectForms$;
    this.facade.loadAll(citizenScienceFormIds, researchProjectFormIds);
  }
}
