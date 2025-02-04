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
        selected[i as keyof typeof selected] = false;
      }
    }

    if (val) {
      val.forEach(key => {
        selected[key as keyof typeof selected] = true;
      });
    }
    this.selected = selected;
    this.initGroups();
  }

  groupSelect(group: keyof typeof this.selectedGroups) {
    if (this.selectedGroups[group]) {
      this.valueChange.emit((Object.keys(this.selected) as (keyof typeof this.selected)[]).reduce((cumulative: string[], current) => {
        if (this.selected[current] && this.groups[group].indexOf(current) === -1) {
          cumulative.push(current);
        }
        return cumulative;
      }, []));
    } else {
      const selected = [...this.groups[group]];
      ['NA', 'NE'].forEach(status => {
        if (this.selected[status as 'NA'|'NE']) {
          selected.push(status);
        }
      });
      this.valueChange.emit(selected);
    }
  }

  itemSelect(item: keyof typeof this.selected) {
    this.selected[item] = !this.selected[item];
    this.valueChange.emit(Object.keys(this.selected).reduce((cumulative: string[], current) => {
      if (this.selected[current as keyof typeof this.selected]) {
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
      this.groups[group as keyof typeof this.groups].forEach(level => {
        if (this.selected[level as keyof typeof this.selected]) {
          match++;
        }
      });
      if (match === this.groups[group as keyof typeof this.groups].length) {
        this.selectedGroups[group as keyof typeof this.groups] = true;
        hasGroup = true;
      } else if (match < 3) {
        hasGroup = true;
      }
    });
  }

}
