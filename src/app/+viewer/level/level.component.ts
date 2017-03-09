import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { isArray } from 'util';

@Component({
  selector: 'laji-level',
  templateUrl: './level.component.html',
  styleUrls: ['./level.component.css']
})
export class LevelComponent implements OnInit, OnChanges {

  @Input() item: Object;
  @Input() skip: string[] = [];
  @Input() subLevels: string[] = [];
  @Input() level: string = 'document';
  @Input() showTitle = true;
  @Input() keyMap: KeyMap = {};
  items: ViewRow[] = [];

  constructor() { }

  ngOnInit() {
    this.initDocument();
  }

  ngOnChanges() {
    this.initDocument();
  }

  keyType(key) {
    if (this.subLevels.indexOf(key) > -1) {
      return isArray(this.item[key]) ? 'subArray' : 'subObject';
    }
    return isArray(this.item[key]) ? 'array' : (typeof this.item[key] === 'object' ? 'object' : 'other');
  }

  initDocument() {
    if (typeof this.item === 'object') {
      this.items = Object
        .keys(this.item)
        .reduce((total, curr) => {
          if (this.skip.indexOf(curr) > -1) {
            return total;
          }
          total.push({
            key: this.keyMap[curr] || curr,
            type: this.keyType(curr),
            value: this.item[curr]
          });
          return total;
        }, []);
    } else {
      this.items = [{
        key: this.keyMap[this.level] || this.level,
        type: 'other',
        value: this.item
      }];
    }
  }

}

export interface ViewRow {
  type: 'subArray'|'subObject'|'object'|'array'|'other';
  key: string;
  value: any;
}

export interface KeyMap {
  [key: string]: string;
}
