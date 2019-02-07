import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'laji-form',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LajiFormComponent {

  @Input() formData: any = {};
  @Input() tick: number;
  @Input() settingsKey = '';

  @Output() dataSubmit = new EventEmitter();
  @Output() dataChange = new EventEmitter();

  lang: string;
  elem: ElementRef;
  lajiFormWrapper: any;
  reactElem: any;
  renderElem: any;

  constructor() { }

  block() { }

  unBlock() { }

  submit() { }
}
