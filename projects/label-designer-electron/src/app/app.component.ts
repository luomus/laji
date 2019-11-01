import { ChangeDetectorRef, Component, Inject, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { LocalStorage, SessionStorage } from 'ngx-webstorage';
import { FieldType, ILabelPdf, ILabelField, ISetup, IViewSettings, Presets } from 'label-designer';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { LajiApi, LajiApiService } from '../../../../src/app/shared/service/laji-api.service';
import * as FileSaver from 'file-saver';
import { SchemaService } from '../../../label-designer/src/lib/schema.service';

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
    'font-family': 'Open Sans',
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

  availableFields: ILabelField[];
  defaultAvailableFields: ILabelField[];

  constructor(
    private http: HttpClient,
    private formService: SchemaService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private lajiApiService: LajiApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.availableFields = [
      {field: 'uri', content: 'http://example.com/ID', label: 'URI - QRCode', type: FieldType.qrCode},
      {field: 'uri', content: 'http://example.com/ID', label: 'URI', type:  FieldType.uri},
      {field: '', content: 'Text', label: 'Text', type: FieldType.text}
    ];
    this.defaultAvailableFields = [
      {field: 'uri', content: 'http://example.com/ID', label: 'URI - QRCode', type: FieldType.qrCode},
      {field: 'uri', content: 'http://example.com/ID', label: 'URI', type:  FieldType.uri},
      {field: '', content: 'Text', label: 'Text', type: FieldType.text}
    ];
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
    this.availableFields = fields;
  }

  onDataChange(data: object[]) {
    this.data = data;
  }
}
