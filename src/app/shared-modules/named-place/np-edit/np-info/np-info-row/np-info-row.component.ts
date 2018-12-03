import { Component, Input } from '@angular/core';

export interface NpInfoRow {
  title: string;
  value: any;
  isLabel?: boolean;
}

@Component({
  selector: 'laji-np-info-row',
  templateUrl: './np-info-row.component.html',
  styleUrls: ['./np-info-row.component.css']
})
export class NpInfoRowComponent implements NpInfoRow {
  @Input() title: string;
  @Input() value: any;
  @Input() isLabel?: boolean;
}
