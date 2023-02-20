import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  template: `
    <alert type="danger" lajiFormOption="disabled">{{ 'haseka.form.disabled' | translate }}</alert>
  `,
  selector: 'laji-project-form-disabled',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DisabledComponent {

}
