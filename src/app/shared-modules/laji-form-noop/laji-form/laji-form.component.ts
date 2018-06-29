import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output
} from '@angular/core';

@Component({
  selector: 'laji-form',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LajiFormComponent {

  @Input() lang: string;
  @Input() formData: any = {};
  @Input() tick: number;
  @Input() settingsKey = '';

  @Output() onSubmit = new EventEmitter();
  @Output() onChange = new EventEmitter();

  elem: ElementRef;
  lajiFormWrapper: any;
  reactElem: any;
  renderElem: any;

  constructor() { }

  block() { }

  unBlock() { }

  submit() { }
}
