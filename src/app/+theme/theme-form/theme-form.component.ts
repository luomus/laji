import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'laji-theme-form',
  templateUrl: './theme-form.component.html',
  styleUrls: ['./theme-form.component.css']
})
export class ThemeFormComponent {

  @Input() formId;
  @Input() documentId;
  @Output() onSuccess = new EventEmitter();
  @Output() onTmpLoad = new EventEmitter();
  @Output() onError = new EventEmitter();
  @Output() onCancel = new EventEmitter();

}
