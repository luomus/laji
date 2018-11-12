import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'laji-redlist-class-filter',
  templateUrl: './red-list-class-filter.component.html',
  styleUrls: ['./red-list-class-filter.component.scss']
})
export class RedListClassFilterComponent implements OnInit {

  @Output() valueChange = new EventEmitter<string[]>();

  selectedGroups = {
    evaluated: false,
    redlist: false,
    endangered: false
  };

  groups = {
    evaluated: ['RE', 'EN', 'CR', 'VU', 'DD', 'NT', 'LC'],
    redlist: ['EN', 'CR', 'VU', 'DD'],
    endangered: ['EN', 'CR', 'VU']
  };

  selected: {
    RE?: boolean,
    EN?: boolean,
    CR?: boolean
    VU?: boolean
    DD?: boolean
    NT?: boolean
    LC?: boolean
    NA?: boolean
    NE?: boolean
  } = {};

  constructor() { }

  ngOnInit() {
  }

  @Input()
  set value(val: string[]) {
    const selected = {...this.selected};
    for (const i in selected) {
      if (selected.hasOwnProperty(i)) {
        selected[i] = false;
      }
    }

    if (val) {
      val.forEach(key => {
        selected[key] = true;
      });
    }
    this.selected = selected;
    this.initGroups();
  }

  groupSelect(group) {
    if (this.selectedGroups[group]) {
      this.valueChange.emit(Object.keys(this.selected).reduce((cumulative, current) => {
        if (this.selected[current] && this.groups[group].indexOf(current) === -1) {
          cumulative.push(current);
        }
        return cumulative;
      }, []));
    } else {
      this.valueChange.emit([...this.groups[group]]);
    }
  }

  itemSelect(item) {
    this.selected[item] = !this.selected[item];
    this.valueChange.emit(Object.keys(this.selected).reduce((cumulative, current) => {
      if (this.selected[current]) {
        cumulative.push(current);
      }
      return cumulative;
    }, []));
  }

  private initGroups() {
    this.selectedGroups = {
      evaluated: false,
      redlist: false,
      endangered: false
    };
    let hasGroup = false;
    Object.keys(this.groups).forEach(group => {
      if (hasGroup) {
        return;
      }
      let match = 0;
      this.groups[group].forEach(level => {
        if (this.selected[level]) {
          match++;
        }
      });
      if (match === this.groups[group].length) {
        this.selectedGroups[group] = true;
        hasGroup = true;
      } else if (match < 3) {
        hasGroup = true;
      }
    });
  }

}
