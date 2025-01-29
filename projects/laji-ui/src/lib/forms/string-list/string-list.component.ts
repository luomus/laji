import { ChangeDetectionStrategy, Component, ElementRef, forwardRef, HostListener, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'lu-form-string-list',
  templateUrl: 'string-list.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormStringListComponent),
      multi: true
    }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormStringListComponent implements ControlValueAccessor {
  value: string[] = [];
  onChange: (value: string[]) => void = () => {};
  onTouched: (value: string[]) => void = () => {};

  @ViewChild('textInput') textInput!: ElementRef;

  @HostListener('keydown.enter', ['$event'])
  onKeyDownEnter(event: KeyboardEvent) {
    event.preventDefault();
  }
  @HostListener('keyup.enter', ['$event'])
  onKeyUpEnter(event: KeyboardEvent) {
    this.value.push(this.textInput.nativeElement.value);
    this.textInput.nativeElement.value = '';
    this.onChange(this.value);
    event.preventDefault();
  }

  onRemoveIdx(idx: number) {
    this.value.splice(idx, 1);
    this.onChange(this.value);
  }

  writeValue(value: string[]): void {
    this.value = value;
  }

  registerOnChange(fn: (value: string[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: (value: string[]) => void): void {
    this.onTouched = fn;
  }
}

