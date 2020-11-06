import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { ProjectForm, ProjectFormService } from '../project-form.service';

@Component({
  selector: 'laji-generate-spreadsheet',
  templateUrl: './generate-spreadsheet.component.html',
  styleUrls: ['./generate-spreadsheet.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GenerateSpreadsheetComponent {
  readonly projectForm$: Observable<ProjectForm>;

  constructor(
    private route: ActivatedRoute,
    public projectFormService: ProjectFormService
) {
    this.projectForm$ = projectFormService.getProjectFormFromRoute$(this.route);
  }

}
