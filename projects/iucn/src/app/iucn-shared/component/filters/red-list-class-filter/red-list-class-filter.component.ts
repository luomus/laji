import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'iucn-redlist-class-filter',
  templateUrl: './red-list-class-filter.component.html',
  styleUrls: ['./red-list-class-filter.component.scss']
})
export class RedListClassFilterComponent {

  @Output() valueChange = new EventEmitter<string[]>();

  selectedGroups = {
    evaluated: false,
    redlist: false,
    endangered: false
  };

  groups = {
    evaluated: ['RE', 'CR', 'EN', 'VU', 'DD', 'NT', 'LC'],
    redlist: ['RE', 'CR', 'EN', 'VU', 'DD', 'NT'],
    endangered: ['CR', 'EN', 'VU']
  };

  selected: {
    RE?: boolean;
    CR?: boolean;
    EN?: boolean;
    VU?: boolean;
    DD?: boolean;
    NT?: boolean;
    LC?: boolean;
    NA?: boolean;
    NE?: boolean;
  } = {};

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
      const selected = [...this.groups[group]];
      ['NA', 'NE'].forEach(status => {
        if (this.selected[status]) {
          selected.push(status);
        }
      });
      this.valueChange.emit(selected);
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
