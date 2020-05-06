import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MonitoringFacade } from './monitoring.facade';
import { Observable } from 'rxjs';
import { FormList } from 'app/+haseka/form-list/haseka-form-list';
import { Global } from '../../environments/global';

@Component({
  selector: 'vir-monitoring',
  templateUrl: './monitoring.component.html',
  styleUrls: ['./monitoring.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MonitoringComponent implements OnInit {
  monitoringForms$: Observable<FormList[]>;

  constructor(private facade: MonitoringFacade) { }

  ngOnInit() {
    this.monitoringForms$ = this.facade.monitoringForms$;
    this.facade.loadAll([Global.forms.waterbirdPairForm, Global.forms.invasiveControl, Global.forms.lolifeForm]);
  }

}
