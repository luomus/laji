import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { SaveObservationsFacade } from './save-observations.facade';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Form } from '../shared/model/Form';
import { HeaderService } from '../../app/shared/service/header.service'
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';

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
    private cdr: ChangeDetectorRef,
    private translate: TranslateService,
    private headerService: HeaderService,
    private title: Title
  ) {}

  ngOnInit() {
    this.citizenScienceForms$ = this.facade.citizenScienceForms$;
    this.birdMonitoringForms$ = this.facade.birdMonitoringForms$;
    this.researchProjectForms$ = this.facade.researchProjectForms$;
    this.headerService.createTwitterCard(this.translate.instant('saveObservations.h1') + ' | ' + this.title.getTitle());
    this.title.setTitle(this.translate.instant('saveObservations.h1') + ' | ' + this.title.getTitle());
    // Fixes https://www.pivotaltracker.com/story/show/174379048
    setTimeout(() => {
      const paragraph = (document.getElementsByTagName("section")).item(0).getElementsByTagName("p").item(0).innerText;
      this.headerService.updateMetaDescription(paragraph);
      this.cdr.markForCheck()
    });
    this.facade.loadAll();
  }
}
