import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'laji-form',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LajiFormComponent {

  static TOP_OFFSET = 50;
  static BOTTOM_OFFSET = 61;

  @Input() formData: any = {};
  @Input() tick: number;
  @Input() settingsKey = '';

  @Output() dataSubmit = new EventEmitter();
  @Output() dataChange = new EventEmitter();
  @Output() validationError = new EventEmitter();

  lang: string;
  elem: ElementRef;
  lajiFormWrapper: any;
  reactElem: any;
  renderElem: any;

  block() { }

  unBlock() { }

  submit() { }
}
