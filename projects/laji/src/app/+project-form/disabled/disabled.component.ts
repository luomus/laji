import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  template: `
    <lu-alert type="danger" lajiFormOption="disabled">{{ 'haseka.form.disabled' | translate }}</lu-alert>
  `,
  selector: 'laji-project-form-disabled',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DisabledComponent {

}
