import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Observable } from 'rxjs';
import { Form } from '../../../shared/model/Form';
import { ThemeFormService } from '../theme-form.service';
import { ActivatedRoute } from '@angular/router';
import { CombineToDocument, ImportService } from '../../../shared-modules/spreadsheet/service/import.service';

@Component({
  selector: 'laji-theme-import',
  templateUrl: './theme-import.component.html',
  styleUrls: ['./theme-import.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ThemeImportComponent {

  readonly form$: Observable<Form.SchemaForm>;
  readonly maxUnitsPerDocument = ImportService.maxPerDocument;
  readonly combineOptions = CombineToDocument;
  readonly feature = Form.Feature;

  constructor(
    route: ActivatedRoute,
    themeFormService: ThemeFormService
  ) {
    this.form$ = themeFormService.getForm(route.snapshot);
  }

}
