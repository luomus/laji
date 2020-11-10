import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { LajiFormComponent } from '../../laji-form/laji-form/laji-form.component';
import { FormWithData } from '../../laji-form/laji-form-document.facade';

@Component({
  selector: 'laji-document-form-footer',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocumentFormFooterComponent {
  @Input() form: FormWithData;
  @Input() status = '';
  @Input() saving = false;
  @Input() edit: any;
  @Input() errors: any;
  @Input() lajiForm: LajiFormComponent;
  @Output() submitPublic = new EventEmitter();
  @Output() submitPrivate = new EventEmitter();
  @Output() cancel = new EventEmitter();
  @Output() lock = new EventEmitter();
}
