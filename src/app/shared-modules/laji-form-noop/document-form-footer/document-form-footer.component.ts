import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { LajiFormComponent } from '@laji-form/laji-form/laji-form.component';

@Component({
  selector: 'laji-document-form-footer',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocumentFormFooterComponent {
  @Input() form: any;
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
