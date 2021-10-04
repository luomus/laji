import { Directive, ElementRef, Input } from '@angular/core';

@Directive({
  selector: '[lajiFormOption]'
})
export class ProjectFormOptionDirective {

  private _formOption: string[];

  constructor(private el: ElementRef) {
  }

  @Input() set lajiFormOption(options: string) {
    const el = this.el.nativeElement;
    if (el.className) {
      this._formOption?.forEach(option => {
        el.className = el.className.replace(singleFormOptionToClassName(option), '');
      });
    }

    if (typeof options !== 'string') {
      return;
    }

    this._formOption = options.split(' ');

    this._formOption.forEach(o => {
      el.className += ' ' + singleFormOptionToClassName(o);
    });
    el.className.trim();
  }

  get lajiFormOption() {
    return this._formOption ? this._formOption.join(' ') : '';
  }
}

function singleFormOptionToClassName(o: string) {
  return `laji-form-option-${o.replace(/\./g, '-')}`;
}

export function formOptionToClassName(o: string) {
  return o.split(' ').map(singleFormOptionToClassName).join(' ');
}
