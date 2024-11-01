import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { CombineToDocument } from '../../shared-modules/spreadsheet/service/import.service';
import { ImportService } from '../../shared-modules/spreadsheet/service/ImportService';
import { ProjectForm, ProjectFormService } from '../../shared/service/project-form.service';

@Component({
  selector: 'laji-import',
  templateUrl: './import.component.html',
  styleUrls: ['./import.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImportComponent {

  readonly projectForm$: Observable<ProjectForm>;
  readonly maxUnitsPerDocument = ImportService.maxPerDocument;
  readonly combineOptions = CombineToDocument;

  constructor(
    private route: ActivatedRoute,
    public projectFormService: ProjectFormService
  ) {
    this.projectForm$ = projectFormService.getProjectFormFromRoute$(this.route);
  }

}
