import { ChangeDetectorRef, Component, Inject, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { LocalStorage, SessionStorage } from 'ngx-webstorage';
import { FieldType, ILabelPdf, ILabelField, ISetup, IViewSettings, Presets } from 'generic-label-maker';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../environments/environment';
import { map, share } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { LajiApi, LajiApiService } from '../../../../src/app/shared/service/laji-api.service';
import * as FileSaver from 'file-saver';
import { FormService } from '../../../generic-label-maker/src/lib/form.service';

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
  border: Presets.Border.solid,
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
        {field: 'uri', content: 'http://example.com/ID', label: 'URI - QRCode', type: FieldType.qrCode}
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
        {field: 'uri', content: 'http://example.com/ID', label: 'URI', type:  FieldType.uri}
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
  pdfLoading = false;
  defaultSetup: ISetup = NEW_SETUP;
  @LocalStorage('viewSetting', {magnification: 2}) viewSetting: IViewSettings;
  @LocalStorage('setup', NEW_SETUP) setup: ISetup;
  @SessionStorage('data', []) data: object[];

  @ViewChild('notebookImport', { static: false }) notebookImport;
  @ViewChild('notebookImportActions', { static: false }) notebookImportActions;

  availableFields$: Observable<ILabelField[]>;
  defaultAvailableFields$: Observable<ILabelField[]>;

  skipFields: string[] = [
    'secureLevel',
    'gatheringEvent.legPublic',
    'gatherings.namedPlaceID',
    'gatherings.images',
    'gatherings.units.unitFact.autocompleteSelectedTaxonID',
  ];

  constructor(
    private http: HttpClient,
    private formService: FormService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private lajiApiService: LajiApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.defaultAvailableFields$ = this.http.get<any>(environment.form).pipe(
      map(form => this.formService.schemaToAvailableFields(form.schema, [
        {field: 'uri', content: 'http://example.com/ID', label: 'URI - QRCode', type: FieldType.qrCode},
        {field: 'uri', content: 'http://example.com/ID', label: 'URI', type: FieldType.uri},
        {field: 'domain', content: 'http://example.com/', label: 'Domain', type: FieldType.domain},
        {field: 'id', content: 'ID', label: 'ID', type: FieldType.id},
        {field: '', content: 'Text', label: 'Text', type: FieldType.text}
      ], {
        skip: this.skipFields
      })),
      share()
    );
    this.availableFields$ = this.defaultAvailableFields$;
  }

  htmlToPdf(result: ILabelPdf) {
    if (isPlatformBrowser(this.platformId)) {
      this.lajiApiService.post(LajiApi.Endpoints.htmlToPdf, result.html)
        .subscribe((response) => {
          this.pdfLoading = false;
          this.cdr.detectChanges();
          FileSaver.saveAs(response, result.filename || 'labels.pdf');
        }, () => {
          this.pdfLoading = false;
          this.cdr.detectChanges();
          alert('Failed to create PDF');
        });
    }
  }

  setAvailableFields(fields) {
    this.defaultSetup = {
      ...this.defaultSetup,
      labelItems: [
        ...this.defaultSetup.labelItems.map((field, idx) => {
          let target = fields[idx] || fields[0];
          const correctType = fields.find(f => f.type === field.fields[0].type);
          if (correctType) {
            target = correctType;
          } else {
            const idType = fields.find(f => f.type && f.type === FieldType.id);
            if (idType) {
              target = {
                ...idType,
                type: field.fields[0].type
              };
            }
          }
          return {
          ...field,
            fields: [target]
          };
        })
      ]
    };
    this.availableFields$ = of(fields);
  }

  onDataChange(data: object[]) {
    this.data = data;
  }
}
