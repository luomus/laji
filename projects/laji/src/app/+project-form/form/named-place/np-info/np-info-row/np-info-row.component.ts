import { Component, Input } from '@angular/core';

export interface NpInfoRow {
  title: string;
  value: any;
  pipe?: 'label' | 'area';
}

@Component({
  selector: 'laji-np-info-row',
  templateUrl: './np-info-row.component.html',
  styleUrls: ['./np-info-row.component.scss']
})
export class NpInfoRowComponent implements NpInfoRow {
  @Input({ required: true }) title!: string;
  @Input() value: any;
  @Input() pipe?: 'label' | 'area';
}
