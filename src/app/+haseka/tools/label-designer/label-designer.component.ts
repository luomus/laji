import { Component, OnInit } from '@angular/core';
import { LabelField } from '../../../../../projects/generic-label-maker/src/lib/generic-label-maker.interface';

@Component({
  selector: 'laji-label-designer',
  templateUrl: './label-designer.component.html',
  styleUrls: ['./label-designer.component.scss']
})
export class LabelDesignerComponent implements OnInit {

  labelFields: LabelField[] = [
    {field: 'id', exampleTxt: 'http://id.luomus.fi/GV.1', label: 'Tunniste'},
    {field: 'leg', exampleTxt: 'Matti Meikäläinen', label: 'Kerääjä'},
    {field: 'taxon', exampleTxt: 'Parus major', label: 'Laji'},
    {field: 'count', exampleTxt: '10', label: 'Määrä'},
    {field: 'sex', exampleTxt: 'uros', label: 'Sukupuoli'},
    {field: 'locality', exampleTxt: 'Kuusen alla', label: 'Sijainti'},
    {field: 'country', exampleTxt: 'Suomi', label: 'Maa'},
    {field: 'coordinates', exampleTxt: '338:665', label: 'Koordinaatit'}
  ];

  constructor() { }

  ngOnInit() {
  }

}
