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
  category: string;
  info?: string;
}

@Component({
  selector: 'laji-select-subcategories',
  templateUrl: './select-subcategories.component.html',
  styleUrls: ['./select-subcategories.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectSubcategoriesComponent implements OnInit, OnChanges, OnDestroy {
  private unsubscribe$ = new Subject<null>();

  @Input() options: SelectOptions[];
  @Input() title: string;
  @Input() filterPlaceHolder = 'Search...';
  @Input() useFilter = true;
  @Input() selected: object = {id: [], category: undefined};
  @Input() open = false;
  @Input() disabled = false;
  @Input() outputOnlyId = false;
  @Output() selectedChange = new EventEmitter<{id: string[]|string, category: string}>();
  @Input() multiple = true;
  @Input() info: string;
  @Input() loading = false;
  @Input() subCategories = [];
  @ViewChild('filter') filter: ElementRef;

  selectedOptions = {};
  unselectedOptions = {};
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

  toggleValue(id: string, category: string) {
    if (!this.selectedOptions[category]) {
      this.add(id, category);
      return;
    }
    if (this.selectedOptions[category].findIndex(option => option.id === id) === -1) {
      this.add(id, category);
    } else {
      this.remove(id, category);
    }
  }

  add(id: string, category: string) {
    if (this.multiple) {
      if (!Array.isArray(this.selected)) {
        this.selected = {};
      }
      this.selected['id'] = [...this.selected['id'] || [], id];
      this.selected['category'] = category;
    } else {
      this.selected['category'] = category;
    }
    this.selectedIdx = -1;
    this.initOptions(this.selected);
    if (this.outputOnlyId) {
      this.selectedChange.emit({id, category});
    } else {
      this.selectedChange.emit({id: this.selected['id'], category: this.selected['category']});
    }
  }

  remove(id: string, category: string) {
    this.selected['id'] = this.selected['id'].filter(value => value !== id);
    this.selectedIdx = -1;
    this.initOptions(this.selected);
    if (this.outputOnlyId) {
      this.selectedChange.emit({id, category});
    } else {
      this.selectedChange.emit({id: this.selected['id'], category: this.selected['category']});
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

  onFilterChange(event: KeyboardEvent, value, category) {
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
            this.add(filterItems[0].id, category);
          }
        } else if (filterItems[this.selectedIdx]) {
          this.add(filterItems[this.selectedIdx].id, category);
        }
        return;
      case 'ArrowUp':
        if (this.selectedIdx <= 0) {
          this.selectedIdx = this.unselectedOptions['id'].length - 1;
        } else {
          this.selectedIdx--;
        }
        return;
      case 'ArrowDown':
        if (this.selectedIdx >= this.unselectedOptions['id'].length - 1) {
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
    if (!this.options || !this.options[this.selected['category']]) {
      return;
    }
    // this.selectedOptions = [];
    if (!selected || !selected['id'] || !selected['category']) {
      this.unselectedOptions = this.options;
      return;
    }
    // this.unselectedOptions = [];
    /*this.options.map(option => {
      if (selected['id'].indexOf(option.id) > -1) {
        this.selectedOptions.push(option);
      } else {
        this.unselectedOptions.push(option);
      }
    });*/


    console.log(Array.isArray(this.options[this.selected['category']]));

  for (const i in this.options[this.selected['category']]) {
    if (selected['id'].indexOf(this.options[this.selected['category']][i]['id']) > -1) {
      if (!this.selectedOptions[this.selected['category']]) {
        this.selectedOptions[this.selected['category']] = [this.options[this.selected['category']][i]];
      } else {
        this.selectedOptions[this.selected['category']].push(this.options[this.selected['category']][i]);
      }
    } else {
      if (!this.unselectedOptions[this.selected['category']]) {
        this.unselectedOptions[this.selected['category']] = [this.options[this.selected['category']][i]];
      } else {
        this.unselectedOptions[this.selected['category']].push(this.options[this.selected['category']][i]);
      }
    }
  }

  }

}

