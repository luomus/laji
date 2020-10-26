import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MonitoringFacade } from './monitoring.facade';
import { Observable } from 'rxjs';
import { Global } from '../../environments/global';
import { Form } from '../../../../../src/app/shared/model/Form';

@Component({
  selector: 'vir-monitoring',
  templateUrl: './monitoring.component.html',
  styleUrls: ['./monitoring.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MonitoringComponent implements OnInit {
  monitoringForms$: Observable<Form.List[]>;

  constructor(private facade: MonitoringFacade) { }

  ngOnInit() {
    this.monitoringForms$ = this.facade.monitoringForms$;
    this.facade.loadAll([Global.forms.waterbirdPairForm, Global.forms.invasiveControl, Global.forms.lolifeForm]);
  }

}
