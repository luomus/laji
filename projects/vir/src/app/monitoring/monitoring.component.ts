import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { MonitoringFacade } from './monitoring.facade';
import { Observable } from 'rxjs';
import { Global } from '../../environments/global';
import { components } from 'projects/laji-api-client/generated/api.d';

type FormListing = components['schemas']['FormListing'];

@Component({
    selector: 'vir-monitoring',
    templateUrl: './monitoring.component.html',
    styleUrls: ['./monitoring.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class MonitoringComponent implements OnInit {
  monitoringForms$!: Observable<FormListing[]>;

  constructor(private facade: MonitoringFacade) { }

  ngOnInit() {
    this.monitoringForms$ = this.facade.monitoringForms$;
    this.facade.loadAll([Global.forms.waterbirdPairForm, Global.forms.invasiveControl, Global.forms.lolifeForm]);
  }

}
