import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ThemeFormService } from '../theme-form.service';
import { Observable } from 'rxjs';
import { Form } from '../../../shared/model/Form';

@Component({
  selector: 'laji-theme-generate-spreadsheet',
  templateUrl: './theme-generate-spreadsheet.component.html',
  styleUrls: ['./theme-generate-spreadsheet.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ThemeGenerateSpreadsheetComponent {
  readonly form$: Observable<Form.SchemaForm>;

  constructor(
    route: ActivatedRoute,
    themeFormService: ThemeFormService
  ) {
    this.form$ = themeFormService.getForm(route.snapshot);
  }

}
