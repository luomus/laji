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
  @Output() submitPublic = new EventEmitter();
  @Output() submitPrivate = new EventEmitter();
  @Output() cancel = new EventEmitter();
  @Output() lock = new EventEmitter();
}
