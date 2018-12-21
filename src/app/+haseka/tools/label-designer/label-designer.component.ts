import { Component, OnInit } from '@angular/core';
import { LabelField } from '../../../../../projects/generic-label-maker/src/lib/generic-label-maker.interface';

@Component({
  selector: 'laji-label-designer',
  templateUrl: './label-designer.component.html',
  styleUrls: ['./label-designer.component.scss']
})
export class LabelDesignerComponent implements OnInit {

  labelFields: LabelField[] = [
    {field: 'id', exampleTxt: 'http://id.luomus.fi/GV.1', label: 'Tunniste - QRCode', isQRCode: true},
    {field: 'id', exampleTxt: 'http://id.luomus.fi/GV.1', label: 'Tunniste'},
    {field: 'leg', exampleTxt: 'Matti Meikäläinen', label: 'Kerääjä'},
    {field: 'taxon', exampleTxt: 'Parus major', label: 'Laji'},
    {field: 'count', exampleTxt: '10', label: 'Määrä'},
    {field: 'sex', exampleTxt: 'uros', label: 'Sukupuoli'},
    {field: 'locality', exampleTxt: 'Kuusen alla', label: 'Sijainti'},
    {field: 'country', exampleTxt: 'Suomi', label: 'Maa'},
    {field: 'coordinates', exampleTxt: '338:665', label: 'Koordinaatit'},
    {field: 'notes', exampleTxt: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas risus magna, vulputate eu ' +
        'sodales sed, ornare sagittis sapien. Sed eu vestibulum metus, ac blandit elit. Nunc at elit posuere, vestibulum metus in, ' +
        'aliquet velit. Aenean ornare nunc scelerisque felis pulvinar, in dignissim quam dignissim. Donec eleifend at nulla ac iaculis. ' +
        'Ut ac volutpat nisl, et interdum urna. Quisque bibendum luctus consectetur.', label: 'Muistiipanot'
    }
  ];

  constructor() { }

  ngOnInit() {
  }

}
