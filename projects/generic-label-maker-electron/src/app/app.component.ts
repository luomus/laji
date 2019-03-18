import { Component, OnInit } from '@angular/core';
import { ILabelField, ISetup, Presets } from 'generic-label-maker';
import { IViewSettings } from '../../../generic-label-maker/src/lib/generic-label-maker.interface';
import { LocalStorage } from 'ngx-webstorage';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { map } from 'rxjs/operators';
import { FormService } from '../../../generic-label-maker/src/lib/form.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  @LocalStorage('viewSetting', {magnification: 2}) viewSetting: IViewSettings;
  @LocalStorage('setup', {
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
          'width.mm': 15,
          'height.mm': 15,
        },
        x: 0,
        y: 0,
        fields: [
          {field: 'id', content: 'http://id.luomus.fi/GV.1', label: 'Tunniste - QRCode', type: 'qr-code'}
        ]
      },
      {
        type: 'field',
        style: {
          'width.mm': 25,
          'height.mm': 5,
        },
        x: 16,
        y: 0,
        fields: [
          {field: 'id', content: 'http://id.luomus.fi/GV.1', label: 'Tunniste'}
        ]
      }
    ]
  }) setup: ISetup;

  availableFields$: Observable<ILabelField[]>;

  skipFields: string[] = [
    'secureLevel',
    'gatheringEvent.legPublic',
    'atherings.namedPlaceID',
    'atherings.images',
    'gatherings.units.unitFact.autocompleteSelectedTaxonID',
  ];

  constructor(
    private http: HttpClient,
    private formService: FormService
  ) {}

  ngOnInit(): void {
    this.availableFields$ = this.http.get<any>(environment.form).pipe(
      map(form => this.formService.schemaToAvailableFields(form.schema, [
        {field: 'id', content: 'http://example.com/ID', label: 'ID - QRCode', type: 'qr-code'},
        {field: 'id', content: 'http://example.com/ID', label: 'ID'}
      ], {
        skip: this.skipFields
      }))
    );
  }

}
