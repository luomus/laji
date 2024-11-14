import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProjectFormService } from '../../shared/service/project-form.service';
import { map, switchMap } from 'rxjs/operators';
import { FormPermissionService } from '../../shared/service/form-permission.service';

@Component({
  selector: 'laji-generate-spreadsheet',
  templateUrl: './generate-spreadsheet.component.html',
  styleUrls: ['./generate-spreadsheet.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GenerateSpreadsheetComponent {

  readonly excelForm$ = this.projectFormService.getProjectFormFromRoute$(this.route).pipe(
    switchMap(projectForm => this.formPermissionService.getRights(projectForm.form).pipe(
      map(rights => ({ projectForm, rights })
    ))),
    map(({ projectForm, rights }) => this.projectFormService.getExcelFormOptions(projectForm, rights.admin)),
    map(form => Array.isArray(form) ? form : [form]),
    map(forms => forms.filter(f => f.allowGenerate).map(f => f.formID))
  );

  constructor(
    private route: ActivatedRoute,
    public projectFormService: ProjectFormService,
    private formPermissionService: FormPermissionService
  ) {}
}
