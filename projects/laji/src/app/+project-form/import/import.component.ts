import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Observable } from 'rxjs';
import { Form } from '../../shared/model/Form';
import { ActivatedRoute } from '@angular/router';
import { CombineToDocument, ImportService } from '../../shared-modules/spreadsheet/service/import.service';
import { ProjectForm, ProjectFormService } from '../project-form.service';

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
