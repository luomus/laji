import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { components } from 'projects/laji-api-client-b/generated/api.d';

type Form = components['schemas']['Form'];

@Component({
    selector: 'laji-project-form-header',
    templateUrl: './project-form-header.component.html',
    styleUrls: ['./project-form-header.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class ProjectFormHeaderComponent {

  _form!: Form;

  @Input() displayInstructions = true;
  @Input() description?: string;
  @Input() set form(form: Form) {
    this._form = form;
    if (form.title) {
      this.title.setTitle(form.title + ' | ' + this.title.getTitle());
    }
  }

  constructor(
    public translate: TranslateService,
    private title: Title
  ) { }
}
