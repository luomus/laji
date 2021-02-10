import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import { Form } from '../../shared/model/Form';
import ResultServiceType = Form.ResultServiceType;
import { ProjectFormService } from '../project-form.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'laji-result-service',
  template: `
    <div [ngSwitch]="(form$ | async).options?.resultServiceType">
      <div *ngSwitchCase="ResultServiceType.winterbirdCount">
        <laji-wbc-result [form]="form$ | async"></laji-wbc-result>
      </div>
      <div *ngSwitchCase="ResultServiceType.lineTransect">
        <laji-line-transect-result></laji-line-transect-result>
      </div>
      <div *ngSwitchCase="ResultServiceType.nafi">
        <laji-nafi-result [form]="(form$ | async)"></laji-nafi-result>
      </div>
      <div *ngSwitchCase="ResultServiceType.nafiBumblebee">
        <laji-nafi-bumblebee-result [form]="(form$ | async)"></laji-nafi-bumblebee>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResultsComponent implements OnInit {

  form$: Observable<Form.SchemaForm>;

  ResultServiceType = ResultServiceType;

  constructor(
    private projectFormService: ProjectFormService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.form$ = this.projectFormService.getFormFromRoute$(this.route);
  }

}
