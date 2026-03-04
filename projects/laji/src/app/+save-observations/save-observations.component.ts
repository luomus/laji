import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { SaveObservationsFacade } from './save-observations.facade';
import { Observable } from 'rxjs';
import { getDescription, HeaderService } from '../shared/service/header.service';
import { TranslateService } from '@ngx-translate/core';
import { components } from 'projects/laji-api-client-b/generated/api.d';

type FormListing = components['schemas']['FormListing'];

@Component({
    templateUrl: `./save-observations.component.html`,
    styleUrls: ['./save-observations.component.scss'],
    standalone: false
})
export class SaveObservationsComponent implements OnInit {
  citizenScienceForms$!: Observable<FormListing[]>;
  birdMonitoringForms$!: Observable<FormListing[]>;
  completeListForms$!: Observable<FormListing[]>;
  researchProjectForms$!: Observable<FormListing[]>;

  constructor(
    private facade: SaveObservationsFacade,
    private cdr: ChangeDetectorRef,
    private headerService: HeaderService,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    this.citizenScienceForms$ = this.facade.citizenScienceForms$;
    this.birdMonitoringForms$ = this.facade.birdMonitoringForms$;
    this.completeListForms$ = this.facade.completeListForms$;
    this.researchProjectForms$ = this.facade.researchProjectForms$;
    // Fixes https://www.pivotaltracker.com/story/show/174379048
    setTimeout(() => this.cdr.markForCheck());
    this.facade.loadAll();
    this.headerService.setHeaders({
      description: getDescription(this.translate.instant('saveObservations.desc'))
    });
  }
}
