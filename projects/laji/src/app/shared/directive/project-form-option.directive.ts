import { Directive, ElementRef, Input } from '@angular/core';

/**
 * Mark elements to be selectable for the laji-form-builder element picker.
 * The value is a the form option that the element is controlled by.
 */
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

function singleFormOptionToClassName(o: string): string {
  return `laji-form-option-${o.replace(/\./g, '-')}`;
}

export function formOptionToClassName(o: string): string {
  return o.split(' ').map(singleFormOptionToClassName).join(' ');
}
