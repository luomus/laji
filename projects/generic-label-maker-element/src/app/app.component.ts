import { Component } from '@angular/core';
import { ISetup, Presets } from 'generic-label-maker';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  setup: ISetup = {
    page: {
      ...Presets.A4,
      'paddingTop.mm': 10,
      'paddingLeft.mm': 10,
      'paddingBottom.mm': 10,
      'paddingRight.mm': 10
    },
    label: {
      'height.mm': 20,
      'width.mm': 50,
      'marginTop.mm': 1.5,
      'marginLeft.mm': 1.5,
      'marginBottom.mm': 1.5,
      'marginRight.mm': 1.5,
      'font-family': 'Arial',
      'font-size.pt': 9
    },
    labelItems: [
      {
        type: 'field',
        style: {
          'width.mm': 13,
          'height.mm': 13,
        },
        x: 0,
        y: 0,
        fields: [
          {field: 'id', content: 'http://example.com/ID', label: 'ID - QRCode', type: 'qr-code'}
        ]
      },
      {
        type: 'field',
        style: {
          'width.mm': 35,
          'height.mm': 5,
        },
        x: 15,
        y: 0,
        fields: [
          {field: 'id', content: 'http://example.com/ID', label: 'ID'}
        ]
      }
    ]
  };

}
