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
import { interval as ObservableInterval, Subject, Subscription } from 'rxjs';
import { debounceTime, take, takeUntil } from 'rxjs/operators';
import { FilterService } from '../../../shared/service/filter.service';

export interface SelectOptions {
  id: string;
  value: string;
  info?: string;
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
  @Input() selected: string[] = [];
  @Input() open = false;
  @Input() disabled = false;
  @Input() outputOnlyId = false;
  @Output() selectedChange = new EventEmitter<string[]|string>();
  @Input() multiple = true;
  @Input() info: string;
  @Input() loading = false;
  @Input() subCategories = [];
  @Input() isParentFilter = false;
  @Input() subCategory = '';
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

  toggleValue(id: string) {
    if (this.selectedOptions.findIndex(option => option.id === id) === -1) {
      this.add(id);
    } else {
      this.remove(id);
    }
  }

  add(id: string) {
    if (this.multiple) {
      if (!Array.isArray(this.selected)) {
        this.selected = [];
      }
      this.selected = [...this.selected, id];
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

  remove(id: string) {
    this.selected = this.selected.filter(value => value !== id);
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
            this.add(filterItems[0].id);
          }
        } else if (filterItems[this.selectedIdx]) {
          this.add(filterItems[this.selectedIdx].id);
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
      this.unselectedOptions = this.options;
      return;
    }
    this.unselectedOptions = [];
    this.options.map(option => {
      if (selected.includes(option.id)) {
        this.selectedOptions.push(option);
      } else {
        this.unselectedOptions.push(option);
      }
    });
  }

  checkStatus(id, cat) {
    const categoriesExceptGlobal = this.subCategories.filter(el => el !== 'GLOBAL');
    let countOptionForNotGlobal = 0;
    if (this.selected && this.selected /*&& this.selectedOptions[cat].length > 0*/) {
      if (cat === 'GLOBAL') {
        categoriesExceptGlobal.forEach(item => {
          if (this.selectedOptions[item] && this.selectedOptions[item].id === id) {
            countOptionForNotGlobal++;
          }
        });
        if (countOptionForNotGlobal === categoriesExceptGlobal.length && this.selectedOptions['GLOBAL'] && this.selectedOptions['GLOBAL'].indexOf(id) === -1) {
          this.selectedOptions['GLOBAL'].push(id);
          this.selected.push(id);
        }
        return countOptionForNotGlobal === categoriesExceptGlobal.length ? true : (countOptionForNotGlobal === 0 ? undefined : false);
      } else {
        if (this.selected.indexOf(id) > -1) {
          return true;
        } else {
          return undefined;
        }
      }
    } else {
      return undefined;
    }
  }

}
