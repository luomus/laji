import { Component, Inject, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { FormService, ILabelField, ISetup, IViewSettings, Presets } from 'generic-label-maker';
import { LocalStorage } from 'ngx-webstorage';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../environments/environment';
import { map, share, switchMap } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { LajiApi, LajiApiService } from '../../../../src/app/shared/service/laji-api.service';
import * as FileSaver from 'file-saver';

const NEW_SETUP: ISetup = {
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

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  newSetup: ISetup = NEW_SETUP;
  @LocalStorage('viewSetting', {magnification: 2}) viewSetting: IViewSettings;
  @LocalStorage('setup', NEW_SETUP) setup: ISetup;

  @ViewChild('notebookImport') notebookImport;
  @ViewChild('notebookImportActions') notebookImportActions;

  availableFields$: Observable<ILabelField[]>;
  newAvailableFields$: Observable<ILabelField[]>;

  skipFields: string[] = [
    'secureLevel',
    'gatheringEvent.legPublic',
    'atherings.namedPlaceID',
    'atherings.images',
    'gatherings.units.unitFact.autocompleteSelectedTaxonID',
  ];

  constructor(
    private http: HttpClient,
    private formService: FormService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private lajiApiService: LajiApiService,
  ) {}

  ngOnInit(): void {
    this.newAvailableFields$ = this.http.get<any>(environment.form).pipe(
      map(form => this.formService.schemaToAvailableFields(form.schema, [
        {field: 'id', content: 'http://example.com/ID', label: 'ID - QRCode', type: 'qr-code'},
        {field: 'id', content: 'http://example.com/ID', label: 'ID'}
      ], {
        skip: this.skipFields
      })),
      share()
    );
    this.availableFields$ = this.newAvailableFields$;
  }

  htmlToPdf(html: string) {
    if (isPlatformBrowser(this.platformId)) {
      this.lajiApiService.post(LajiApi.Endpoints.htmlToPdf, html)
        .subscribe((response) => {
          FileSaver.saveAs(response,  'labels.pdf');
        });
    }
  }

  setAvailableFields(fields) {
    this.newSetup = {
      ...this.newSetup,
      labelItems: [
        ...this.newSetup.labelItems.map((field, idx) => ({
          ...field,
          fields: [fields[idx]]
        }))
      ]
    };
    this.availableFields$ = of(fields);
  }
}
