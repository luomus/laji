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
import { debounceTime, take } from 'rxjs/operators';

interface SelectOptions {
  id: string;
  value: string;
}

@Component({
  selector: 'laji-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectComponent implements OnInit, OnChanges, OnDestroy {

  @Input() options: SelectOptions[];
  @Input() title: string;
  @Input() filterPlaceHolder = 'Search...';
  @Input() useFilter = true;
  @Input() selected: string[] = [];
  @Input() open = false;
  @Input() disabled = false;
  @Input() outputOnlyId = false;
  @Output() selectedChanged = new EventEmitter<string[]|string>();
  @Input() multiple = true;
  @Input() info: string;
  @ViewChild('filter', { static: false }) filter: ElementRef;

  selectedOptions: SelectOptions[] = [];
  unselectedOptions: SelectOptions[] = [];
  filterInput = new Subject<string>();
  filterBy: string;
  selectedIdx = -1;

  private filterSub: Subscription;

  constructor(private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.filterSub = this.filterInput
      .asObservable().pipe(
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
    if (this.filterSub) {
      this.filterSub.unsubscribe();
    }
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
      this.selectedChanged.emit(id);
    } else {
      this.selectedChanged.emit(this.selected);
    }
  }

  remove(id: string) {
    this.selected = this.selected.filter(value => value !== id);
    this.selectedIdx = -1;
    this.initOptions(this.selected);
    if (this.outputOnlyId) {
      this.selectedChanged.emit(id);
    } else {
      this.selectedChanged.emit(this.selected);
    }
  }

  toggle(event, el) {
    if (event.target.classList.contains('no-propagation')) {
      return;
    }
    this.open = !this.open;
    if (this.open && this.useFilter) {
      ObservableInterval(10).pipe(take(1))
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
        if (this.selectedIdx === -1) {
          if (this.unselectedOptions.length > 0) {
            this.add(this.unselectedOptions[0].id);
          }
        } else if (this.unselectedOptions[this.selectedIdx]) {
          this.add(this.unselectedOptions[this.selectedIdx].id);
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
      if (selected.indexOf(option.id) > -1) {
        this.selectedOptions.push(option);
      } else {
        this.unselectedOptions.push(option);
      }
    });
  }

}
