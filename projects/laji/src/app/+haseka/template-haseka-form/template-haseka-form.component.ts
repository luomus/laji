import { Component, ChangeDetectionStrategy } from '@angular/core';


@Component({
  selector: 'laji-template-haseka-form',
  template: `<laji-haseka-form [template]="true"></laji-haseka-form>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TemplateHasekaFormComponent {

}
