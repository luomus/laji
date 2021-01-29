import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { SaveObservationsFacade } from './save-observations.facade';
import { Observable } from 'rxjs';
import { Form } from '../shared/model/Form';

@Component({
  templateUrl: `./save-observations.component.html`,
  styleUrls: ['./save-observations.component.scss']
})
export class SaveObservationsComponent implements OnInit {
  citizenScienceForms$: Observable<Form.List[]>;
  birdMonitoringForms$: Observable<Form.List[]>;
  researchProjectForms$: Observable<Form.List[]>;

  constructor (
    private facade: SaveObservationsFacade,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.citizenScienceForms$ = this.facade.citizenScienceForms$;
    this.birdMonitoringForms$ = this.facade.birdMonitoringForms$;
    this.researchProjectForms$ = this.facade.researchProjectForms$;
    // Fixes https://www.pivotaltracker.com/story/show/174379048
    setTimeout(() => this.cdr.markForCheck());
    this.facade.loadAll();
  }
}
