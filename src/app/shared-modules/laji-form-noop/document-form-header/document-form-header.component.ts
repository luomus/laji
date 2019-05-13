import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'laji-document-form-header',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocumentFormHeaderComponent {

  @Input() formID: string;
  @Input() namedPlaceID: string;
  @Input() printType: string;
  @Input() formData: any;
  @Input() displayObservationList: boolean;
  @Input() displayLatest: boolean;
  @Input() description: string;
  @Input() displayTitle = true;

  form: any;

}
