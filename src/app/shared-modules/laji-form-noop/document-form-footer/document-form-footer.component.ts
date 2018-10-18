import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'laji-document-form-footer',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocumentFormFooterComponent {
  @Input() form: any;
  @Input() status = '';
  @Input() saving = false;
  @Output() onSubmitPublic = new EventEmitter();
  @Output() onSubmitPrivate = new EventEmitter();
  @Output() onCancel = new EventEmitter();
}
