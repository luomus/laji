import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { interval as ObservableInterval, Subject } from 'rxjs';
import { debounceTime, take, takeUntil } from 'rxjs/operators';
import { FilterService } from '../../../shared/service/filter.service';
import { CheckboxType } from '../checkbox/checkbox.component';

type idType = string|number|boolean;
export interface SelectOptions {
  id: idType;
  value: string;
  info?: string;
  checkboxValue?: boolean|undefined;
}

@Component({
  selector: 'laji-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectComponent implements OnInit, OnChanges, OnDestroy {
  private unsubscribe$ = new Subject<null>();

  @Input() options: SelectOptions[];
  @Input() title: string;
  @Input() filterPlaceHolder = 'Search...';
  @Input() useFilter = true;
  @Input() selected: (idType|SelectOptions)[] = [];
  @Input() open = false;
  @Input() disabled = false;
  @Input() outputOnlyId = false;
  @Input() multiple = true;
  @Input() info: string;
  @Input() loading = false;
  @Input() checkboxType = CheckboxType.basic;
  @Input() classes: {options: string, optionContainer: string, menuCountainer: string} | {} = {};

  @Output() selectedChange = new EventEmitter<(SelectOptions|idType)[]|idType>();
  @ViewChild('filter') filter: ElementRef;

  selectedOptions: SelectOptions[] = [];
  unselectedOptions: SelectOptions[] = [];
  filterInput = new Subject<string>();
  filterBy: string;
  selectedIdx = -1;

  constructor(
    private cd: ChangeDetectorRef,
    private filterService: FilterService
  ) { }

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


  toggleValue(id: idType, event) {
    const index = this.selectedOptions.findIndex(option => option.id === id);
    if (this.checkboxType === CheckboxType.partial) {
      const newEvent = this.selectedOptions === undefined || this.selectedOptions[index]?.checkboxValue !== true;
      if (index === -1 || this.selectedOptions[index].checkboxValue !== true) {
        this.add(id, newEvent);
      } else {
        this.remove(id, newEvent);
      }
    } else {
      if (index === -1) {
        this.add(id, event);
      } else {
        this.remove(id, event);
      }
    }

  }

  add(id: idType, event) {
    if (this.multiple) {
      if (!Array.isArray(this.selected)) {
        this.selected = [];
      }
      let tmpOption;
      let tmpOptionIndex;
      if (this.checkboxType !== CheckboxType.basic) {
        tmpOption = this.options.filter((item: SelectOptions) => item.id === id);
        tmpOption[0].checkboxValue = true;
        tmpOptionIndex = this.selected.findIndex((item: SelectOptions) => item.id === tmpOption[0].id);
        if (tmpOptionIndex > -1) {
          this.selected[tmpOptionIndex]['checkboxValue'] = true;
        }
        this.selected = tmpOptionIndex === -1 ? [...this.selected, ...tmpOption] : this.selected;
      } else {
        this.selected = [...this.selected, id];
      }
    } else {
      this.selected = [id];
    }
    this.selectedIdx = -1;
    this.initOptions(this.selected);
    if (this.outputOnlyId) {
      this.selectedChange.emit(id);
    } else {
      this.selectedChange.emit(this.selected);
    }
  }

  remove(id: idType, event) {
    if (this.checkboxType === CheckboxType.partial) {
    const findIndex = this.selected.findIndex((item: SelectOptions) => item.id === id);
      if (this.selected[findIndex]['checkboxValue'] === false) {
        this.add(id, true);
        return;
      } else {
        this.selected = this.selected.filter((item: SelectOptions) => item.id !== id);
      }
    } else {
      this.selected = this.selected.filter(value => value !== id);
    }

    this.selectedIdx = -1;
    this.initOptions(this.selected);
    if (this.outputOnlyId) {
      this.selectedChange.emit(id);
    } else {
      this.selectedChange.emit(this.selected);
    }
  }

  toggle(event, el) {
    if (event.target.classList.contains('no-propagation')) {
      return;
    }
    this.open = !this.open;
    if (this.open && this.useFilter) {
      ObservableInterval(10).pipe(takeUntil(this.unsubscribe$), take(1))
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

  private initOptions(selected) {
    if (!this.options) {
      return;
    }
    this.selectedOptions = [];
    if (!selected || selected.length === 0) {
      this.options.map(option => {
        option.checkboxValue = this.checkboxType === 'basic' ? false : undefined;
      });
      this.unselectedOptions = this.options;
      return;
    }
    this.unselectedOptions = [];

    this.options.forEach(option => {
      const selectedItem = selected.find(select =>
        (option.id === select) ||
        (option.id === select?.id && (select.checkboxValue === true || select.checkboxValue === false))
      );
      const targetOptions = selectedItem !== undefined ? this.selectedOptions : this.unselectedOptions;
      const checkboxValue = selectedItem?.checkboxValue ?? selectedItem !== undefined;

      targetOptions.push({
        ...option,
        checkboxValue
      });
    });
  }


}
