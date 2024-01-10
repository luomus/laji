import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, forwardRef, Input, OnChanges, OnDestroy, OnInit, Output, ViewChild
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Subject, timer } from 'rxjs';
import { debounceTime, take, takeUntil } from 'rxjs/operators';
import { FilterService } from '../../../shared/service/filter.service';
import { CheckboxType } from '../checkbox/checkbox.component';

type IdType = string|number|boolean;
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

  @Input() options: SelectOption[];
  @Input() title: string;
  @Input() filterPlaceHolder = 'Search...';
  @Input() useFilter = true;
  @Input() filterProperties: (keyof SelectOption)[] | undefined;
  @Input() selected: T[] = [];
  @Input() open = false;
  @Input() disabled = false;
  @Input() multiple = true;
  @Input() info: string;
  @Input() loading = false;
  @Input() checkboxType = CheckboxType.basic;
  @Input() classes: {options?: string; optionContainer?: string; menuContainer?: string} = {};

  @Output() selectedChange = new EventEmitter<T[]>();
  @ViewChild('filter') filter: ElementRef;

  selectedOptions: SelectOption[] = [];
  unselectedOptions: SelectOption[] = [];
  filterInput = new Subject<string>();
  filterBy: string;
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
      this.selected = [];
      this.open = false;
    }
    this.initOptions(this.selected);
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  toggleValue(id: IdType, event) {
    const selected = this.selectedOptions.find(option => option.id === id);
    if (!selected || (this.isSelectOptions(selected) && selected.checkboxValue !== true)) {
      this.add(id, event);
    } else {
      this.remove(id, event);
    }
  }

  add(id: IdType, event) {
    const option = this.options.find((item: SelectOption) => item.id === id);
    const isBasic = this.checkboxType === CheckboxType.basic;
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
      this.selected = isBasic ? [id] as T[] : [option] as T[];
    }
    this.selectedIdx = -1;
    this.initOptions(this.selected);
    this.selectedChange.emit(this.selected);
  }

  remove(id: IdType, event) {
    if (this.checkboxType !== CheckboxType.basic) {
      const select = this.selected.find(item => this.isSelectOptions(item) && item.id === id);
      if (this.isSelectOptions(select) && select.checkboxValue === false) {
        return this.add(id, true);
      }
    }
    this.selected = this.selected.filter(value => this.isSelectOptions(value) ? value.id !== id : value !== id);
    this.selectedIdx = -1;
    this.initOptions(this.selected);
    this.selectedChange.emit(this.selected);
  }

  toggle(event, el) {
    if (event.target.classList.contains('no-propagation')) {
      return;
    }
    this.open = !this.open;
    if (this.open && this.useFilter) {
      timer(10).pipe(takeUntil(this.unsubscribe$), take(1))
        .subscribe(() => {
          try {
            // No IE support
            el.focus();
          } catch (e) { }
        });
    }
  }

  labelClick(event) {
    if (event.target.classList.contains('no-propagation')) {
      event.preventDefault();
    }
  }

  onFilterChange(event: KeyboardEvent, value) {
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

  track(idx, item) {
    return item.id;
  }

  private initOptions(selected = []) {
    if (!this.options) {
      return;
    }

    const selectedOptions = [];
    const unselectedOptions = [];

    this.options.forEach(option => {
      const selectedItem = selected.find(select =>
        (option.id === select) ||
        (option.id === select?.id && (select.checkboxValue === true || select.checkboxValue === false))
      );
      const targetOptions = selectedItem !== undefined ? selectedOptions : unselectedOptions;
      const checkboxValue = selectedItem?.checkboxValue ?? selectedItem !== undefined;

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

