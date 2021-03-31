import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { ProjectFormService } from '../project-form.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'laji-generate-spreadsheet',
  templateUrl: './generate-spreadsheet.component.html',
  styleUrls: ['./generate-spreadsheet.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GenerateSpreadsheetComponent {
  readonly excelForm$: Observable<string[]>;

  constructor(
    private route: ActivatedRoute,
    public projectFormService: ProjectFormService
) {
    this.excelForm$ = projectFormService.getProjectFormFromRoute$(this.route).pipe(
      map(form => projectFormService.getExcelFormIDs(form)),
      map(form => Array.isArray(form) ? form : [form])
    );
  }

}
