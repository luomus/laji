import { Component, Input, OnInit, OnChanges } from '@angular/core';

@Component({
  selector: 'laji-np-info-row',
  templateUrl: './np-info-row.component.html',
  styleUrls: ['./np-info-row.component.css']
})
export class NpInfoRowComponent implements OnInit, OnChanges {
  @Input() key: string;
  @Input() value: any;
  @Input() fields: any;

  nameOfValue: string;

  constructor() { }

  ngOnInit() {
    this.updateValueName();
  }

  ngOnChanges() {
    this.updateValueName();
  }

  updateValueName() {
    const prop = this.fields[this.key];
    if ('enum' in prop) {
      const idx = prop['enum'].indexOf(this.value);
      this.nameOfValue = prop['enumNames'][idx];
    } else {
      this.nameOfValue = this.value;
    }
  }
}
