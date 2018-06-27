import {
  ChangeDetectionStrategy, ChangeDetectorRef,
  Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output,
  ViewChild
} from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';

interface SelectOptions {
  id: string,
  value: string
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
  @Input() outputOnlyId = false;
  @Output() selectedChanged = new EventEmitter<string[]|string>();
  @Input() multiple = true;
  @Input() info: string;
  @ViewChild('filter') filter: ElementRef;

  selectedOptions: SelectOptions[] = [];
  unselectedOptions: SelectOptions[] = [];
  filterInput = new Subject<string>();
  filterBy: string;
  selectedIdx = -1;

  private filterSub: Subscription;

  constructor(private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.filterSub = this.filterInput
      .asObservable()
      .debounceTime(200)
      .subscribe((value) => {
        this.filterBy = value.toLowerCase();
        this.initOptions(this.selected, this.filterBy);
        this.cd.markForCheck();
      });
    this.initOptions(this.selected);
  }

  ngOnChanges() {
    this.initOptions(this.selected);
  }

  ngOnDestroy() {
    this.filterSub.unsubscribe();
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
      this.selected.push(id);
    } else {
      this.selected = [id];
    }
    this.selectedIdx = -1;
    this.filter.nativeElement.value = '';
    this.filterBy = '';
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
    this.initOptions(this.selected, this.filterBy);
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
      Observable.interval(10)
        .take(1)
        .subscribe(() => el.focus());
    }
  }

  onFilterChange(event: KeyboardEvent, value) {
    switch (event.key) {
      case 'Esc':
        this.filterBy = '';
        this.initOptions(this.selected, this.filterBy);
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
    this.filterInput.next(value)
  }

  track(idx, item) {
    return item.id;
  }

  private initOptions(selected, filterBy?) {
    if (!this.options) {
      return;
    }
    this.selectedOptions = [];
    if ((!selected || selected.length === 0) && !filterBy) {
      this.unselectedOptions = this.options;
      return;
    }
    this.unselectedOptions = [];
    this.options.map(option => {
      if (selected.indexOf(option.id) > -1) {
        this.selectedOptions.push(option);
      } else if (!filterBy || option.value.toLowerCase().indexOf(filterBy) > -1) {
        this.unselectedOptions.push(option);
      }
    });
  }

}
