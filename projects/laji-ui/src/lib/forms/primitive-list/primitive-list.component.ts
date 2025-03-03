import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, forwardRef, HostListener, Input, Output, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

type Kind = 'string' | 'number' | 'enum';
type KindToConcreteType<K extends Kind> = K extends 'number' ? number : string;
type ElementType<T extends { kind: Kind }> = KindToConcreteType<T['kind']>;

@Component({
  selector: 'lu-form-primitive-list',
  templateUrl: 'primitive-list.component.html',
  styleUrls: ['primitive-list.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormPrimitiveListComponent),
      multi: true
    }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormPrimitiveListComponent<K extends Kind, T extends KindToConcreteType<K>> implements ControlValueAccessor {
  @Input() inputId?: string;
  /**
   * If kind === 'enum', then enumVariants must be defined.
   */
  @Input({ required: true }) kind!: K;
  @Input() enumVariants!: K extends 'enum' ? string[] : undefined;

  valueList: T[] = [];
  onChange: (value: T[]) => void = () => {};
  onTouched: (value: T[]) => void = () => {};

  @ViewChild('inputElem') inputElem?: ElementRef;
  @ViewChild('selectElem') selectElem?: ElementRef;

  @HostListener('keydown.enter', ['$event'])
  onKeyDownEnter(event: KeyboardEvent) {
    event.preventDefault();
  }
  @HostListener('keyup.enter', ['$event'])
  onKeyUpEnter(event: KeyboardEvent) {
    event.preventDefault();
    this.add();
  }

  onAdd(event: Event) {
    event.preventDefault();
    this.add();
  }

  onSelectChange(event: Event) {
    event.preventDefault();
    this.add();
  }

  onRemoveIdx(idx: number, event: Event) {
    event.preventDefault();
    this.valueList.splice(idx, 1);
    this.onChange(this.valueList);
  }

  getUnusedEnumVariants(): string[] {
    return this.enumVariants?.filter(v => !(this.valueList as string[]).includes(v)) ?? [];
  }

  private add() {
    const elem = this.kind === 'enum' ? this.selectElem! : this.inputElem!;
    const val = elem.nativeElement.value;
    if (val === null || val === 'null' || val === '') {
      return;
    }
    this.valueList.push(elem.nativeElement.value);
    elem.nativeElement.value = null;
    this.onChange(this.valueList);
  }

  // ------------------------------  //
  // ControlValueAccessor methods:   //
  // ------------------------------- //
  writeValue(value: T[]): void {
    if (!value) {
      this.valueList = [];
    } else {
      this.valueList = value;
    }
  }

  registerOnChange(fn: (value: ElementType<this>[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: (value: ElementType<this>[]) => void): void {
    this.onTouched = fn;
  }
  // ------------------------------- //
}

