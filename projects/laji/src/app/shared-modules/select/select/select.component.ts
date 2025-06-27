import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, forwardRef, Input, OnChanges, OnDestroy, OnInit, Output, ViewChild
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Subject, timer } from 'rxjs';
import { debounceTime, take, takeUntil } from 'rxjs/operators';
import { FilterService } from '../../../shared/service/filter.service';
import { CheckboxType } from '../checkbox/checkbox.component';

export type IdType = string|number|boolean;
export interface SelectOption {
  id: IdType;
  value: string;
  info?: string;
  checkboxValue?: boolean|undefined;
}

@Component({
  selector: 'laji-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers:  [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => SelectComponent),
    multi: true
  }]
})
export class SelectComponent<T extends IdType|SelectOption = string> implements OnInit, OnChanges, OnDestroy, ControlValueAccessor {
  private unsubscribe$ = new Subject<null>();

  @Input({required: true}) options!: SelectOption[];
  @Input() title?: string;
  @Input() filterPlaceHolder = 'Search...';
  @Input() useFilter = true;
  @Input() filterProperties: (keyof SelectOption)[] | undefined;
  @Input() selected?: T | T[];
  @Input() open = false;
  @Input() disabled = false;

  /** true by default */
  @Input() multiple = true;

  @Input() info?: string;
  @Input() loading = false;
  @Input() checkboxType = CheckboxType.basic;
  @Input() classes: {options?: string; optionContainer?: string; menuContainer?: string} = {};

  @Output() selectedChange = new EventEmitter<T | T[]>();
  @ViewChild('filter') filter!: ElementRef<HTMLInputElement>;

  selectedOptions: SelectOption[] = [];
  unselectedOptions: SelectOption[] = [];
  filterInput = new Subject<string>();
  filterBy = '';
  selectedIdx = -1;

  private onChange?: (_: any) => void;
  private onTouch?: (_: any) => void;

  constructor(
    private cd: ChangeDetectorRef,
    private filterService: FilterService
  ) { }

  writeValue(obj: any): void {
    this.selected = obj;
    this.initOptions(this.selected);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  ngOnInit() {
    if (this.selected === undefined && this.multiple) {
      this.selected = [];
    }
    this.filterInput
      .asObservable().pipe(
        takeUntil(this.unsubscribe$),
        debounceTime(200)
      )
      .subscribe((value) => {
        this.filterBy = value;
        this.cd.markForCheck();
      });
  }

  ngOnChanges() {
    if (this.disabled) {
      this.selected = this.multiple ? [] : undefined;
      this.open = false;
    }
    this.initOptions(this.selected);
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  toggleValue(id: IdType, event: boolean|undefined) {
    const selected = this.selectedOptions.find(option => option.id === id);
    if (!selected || (this.isSelectOptions(selected) && selected.checkboxValue !== true)) {
      this.add(id, event);
    } else {
      this.remove(id, event);
    }
  }

  add(id: IdType, event: any) {
    const option = this.options?.find((item: SelectOption) => item.id === id);
    const isBasic = this.checkboxType === CheckboxType.basic;

    if (!option) {
      return;
    }

    if (this.multiple) {
      if (!Array.isArray(this.selected)) {
        this.selected = [];
      }
      if (this.checkboxType !== CheckboxType.basic) {
        const selected = this.selected.find(item => this.isSelectOptions(item) ? item.id === option.id : item === option.id);
        option.checkboxValue = true;
        if (selected && this.isSelectOptions(selected)) {
          selected.checkboxValue = true;
        } else {
          this.selected = [...this.selected, option] as T[];
        }
      } else {
        this.selected = [...this.selected, id] as T[];
      }
    } else {
      this.selected = isBasic ? id as T : option as T;
    }
    this.selectedIdx = -1;
    this.initOptions(this.selected);
    this.selectedChange.emit(this.selected);
  }

  remove(id: IdType, event: any) {
    if (this.checkboxType !== CheckboxType.basic) {
      const select = this.multiple
        ? (this.selected as T[])?.find(item => this.isSelectOptions(item) && item.id === id)
        : this.isSelectOptions(this.selected as T) && (this.selected as any).id === id;

      if (!select) {
        return;
      }

      if (this.isSelectOptions(select) && select.checkboxValue === false) {
        return this.add(id, true);
      }
    }
    this.selected = this.multiple
      ? (this.selected as T[])?.filter(value => this.isSelectOptions(value) ? value.id !== id : value !== id)
      : undefined;

    this.selectedIdx = -1;
    this.initOptions(this.selected);
    this.selectedChange.emit(this.selected);
  }

  toggle(event: MouseEvent, el: ElementRef<HTMLInputElement>) {
    if ((event.target as HTMLElement).classList.contains('no-propagation')) {
      return;
    }
    this.open = !this.open;
    if (this.open && this.useFilter) {
      timer(10).pipe(takeUntil(this.unsubscribe$), take(1))
        .subscribe(() => {
          try {
            // No IE support
            el.nativeElement.focus();
          } catch (e) { }
        });
    }
  }

  labelClick(event: MouseEvent) {
    if ((event.target as HTMLLabelElement).classList.contains('no-propagation')) {
      event.preventDefault();
    }
  }

  onFilterChange(event: KeyboardEvent, value: string) {
    switch (event.key) {
      case 'Esc':
        this.filterBy = '';
        this.initOptions(this.selected);
        return;
      case 'Enter':
        if (!this.filterBy && this.selectedIdx === -1) {
          return;
        }
        const filterItems = this.filterService.filter(this.unselectedOptions, this.filterBy);
        if (this.selectedIdx === -1) {
          if (filterItems.length > 0) {
            this.add(filterItems[0].id, event);
          }
        } else if (filterItems[this.selectedIdx]) {
          this.add(filterItems[this.selectedIdx].id, event);
        }
        return;
      case 'ArrowUp':
        if (this.selectedIdx <= 0) {
          this.selectedIdx = this.unselectedOptions.length - 1;
        } else {
          this.selectedIdx--;
        }
        return;
      case 'ArrowDown':
        if (this.selectedIdx >= this.unselectedOptions.length - 1) {
          this.selectedIdx = 0;
        } else {
          this.selectedIdx++;
        }
        return;
      default:
        this.selectedIdx = -1;
    }
    this.filterInput.next(value);
  }

  track(idx: number, item: SelectOption) {
    return item.id;
  }

  private getSelectedWithDefault(selected?: T | T[]): T | T[] | undefined {
    return selected !== undefined
      ? selected
      : this.multiple ? [] : undefined;
  }

  private initOptions(selected?: T | T[]) {
    selected = this.getSelectedWithDefault(selected);
    if (!this.options) {
      return;
    }

    const selectedOptions: SelectOption[] = [];
    const unselectedOptions: SelectOption[] = [];

    this.options.forEach(option => {
      const selectedItem = this.multiple
        ? (selected as T[] || []).find(select =>
          (option.id === select as IdType) ||
          (option.id === (select as SelectOption)?.id && ((select as SelectOption).checkboxValue === true || (select as SelectOption).checkboxValue === false))
        ) : option.id === this.selected ? this.selected : undefined;
      const targetOptions = selectedItem !== undefined ? selectedOptions : unselectedOptions;
      const checkboxValue = (selectedItem as SelectOption)?.checkboxValue ?? selectedItem !== undefined;

      targetOptions.push({
        ...option,
        checkboxValue
      });
    });

    this.selectedOptions = selectedOptions;
    this.unselectedOptions = unselectedOptions;
    this.open = this.open || !!this.selectedOptions.length;

    this.onChange?.(selected);
    this.onTouch?.(selected);
    this.cd.markForCheck();
  }

  private isSelectOptions(option: IdType|SelectOption): option is SelectOption {
    return typeof option === 'object';
  }
}

