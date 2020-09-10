import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { FormService } from '../../shared/service/form.service';
import { ActivatedRoute } from '@angular/router';
import { map, switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'laji-template-haseka-form',
  template: `<laji-haseka-form [template]="true" [form$]="form$"></laji-haseka-form>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TemplateHasekaFormComponent implements OnInit {

  form$: Observable<any>;

  constructor(
    private formService: FormService,
    private route: ActivatedRoute,
    public translate: TranslateService,
  ) { }

  ngOnInit() {
    this.form$ = this.route.params.pipe(
      switchMap(params => this.formService.getForm(params['formId'], this.translate.currentLang)),
      map((form) => {
        form.uiSchema.gatherings.items.units['ui:field'] = 'HiddenField';
        form.uiSchema.gatherings['ui:options']['belowUiSchemaRoot']['ui:field'] = 'HiddenField';
        return form;
      })
    );
  }

}
