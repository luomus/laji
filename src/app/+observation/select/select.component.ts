import {
  Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output,
  ViewChild
} from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';

interface SelectOptions {
  id: string,
  name: string
}

@Component({
  selector: 'laji-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.css']
})
export class SelectComponent implements OnInit, OnChanges, OnDestroy {

  @Input() options: SelectOptions[];
  @Input() title: string;
  @Input() filterPlaceHolder = 'Search...';
  @Input() useFilter = true;
  @Input() selected: string[] = [];
  @Output() selectedChanged = new EventEmitter<string[]>();
  @ViewChild('filter') filter: ElementRef;

  selectedOptions: SelectOptions[] = [];
  unselectedOptions: SelectOptions[] = [];
  open = false;
  filterInput = new Subject<string>();
  filterBy: string;
  selectedIdx = -1;

  private filterSub: Subscription;

  constructor() { }

  ngOnInit() {
    this.filterSub = this.filterInput
      .asObservable()
      .debounceTime(200)
      .subscribe((value) => {
        this.filterBy = value.toLowerCase();
        this.initOptions(this.selected, this.filterBy);
      });
    this.initOptions(this.selected);
  }

  ngOnChanges() {
    this.initOptions(this.selected);
  }

  ngOnDestroy() {
    this.filterSub.unsubscribe();
  }

  add(id: string) {
    this.selected.push(id);
    this.selectedIdx = -1;
    this.filter.nativeElement.value = '';
    this.filterBy = '';
    this.initOptions(this.selected);
    this.selectedChanged.emit(this.selected);
  }

  remove(id: string) {
    this.selected = this.selected.filter(value => value !== id);
    this.selectedIdx = -1;
    this.initOptions(this.selected, this.filterBy);
    this.selectedChanged.emit(this.selected);
  }

  toggle(el) {
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
      } else if (!filterBy || option.name.toLowerCase().indexOf(filterBy) > -1) {
        this.unselectedOptions.push(option);
      }
    });
  }

}
