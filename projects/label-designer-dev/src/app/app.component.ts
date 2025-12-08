import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ILabelField, ILabelPdf, ISetup, FieldType, IViewSettings } from '../../../label-designer/src/lib/label-designer.interface';
import { Presets } from '../../../label-designer/src/lib/presets';
import { SchemaService } from '../../../label-designer/src/lib/schema.service';
import { Global } from '../../../laji/src/environments/global';
import { LajiApi, LajiApiService } from '../../../laji/src/app/shared/service/laji-api.service';
import { TranslateService } from '@ngx-translate/core';
import { map } from 'rxjs/operators';
import * as FileSaver from 'file-saver';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  availableFields?: ILabelField[] = [];
  labelFields?: ILabelField[] = [];

  translations = {};

  defaultSetup: ISetup;
  setup: ISetup;

  fileColumnMap = {};
  viewSettings: IViewSettings = {magnification: 2};

  data: any[] = [];
  downloading = false;

  defaultFields: ILabelField[] = [
    { field: 'gatherings.units.id', content: 'http://tun.fi/EXAMPLE', label: 'ID - QRCode', type: FieldType.qrCode },
    { field: 'gatherings.units.id', content: 'http://tun.fi/EXAMPLE', label: 'ID', type: FieldType.uri },
    { field: 'gatherings.units.id_domain', content: 'EXAMPLE', label: 'label.domain', type: FieldType.domain },
    { field: 'gatherings.units.id_short', content: 'EXAMPLE', label: 'label.id_short', type: FieldType.id },
    { field: '', content: 'Text', label: 'Text', type: FieldType.text }
  ];

  constructor(
    private lajiApiService: LajiApiService,
    private schemaService: SchemaService,
    private translateService: TranslateService,
    private cdr: ChangeDetectorRef
  ) {
    this.defaultSetup = {
      page: {
        ...Presets.A4,
        'paddingTop.mm': 10,
        'paddingLeft.mm': 10,
        'paddingBottom.mm': 10,
        'paddingRight.mm': 10
      },
      border: Presets.Border.solid,
      label: {
        'height.mm': 20,
        'width.mm': 60,
        'marginTop.mm': 1.5,
        'marginLeft.mm': 1.5,
        'marginBottom.mm': 1.5,
        'marginRight.mm': 1.5,
        'font-family': Presets.DefaultFont,
        'font-size.pt': 9
      },
      labelItems: this.defaultFields.map((a, i) => ({
        type: <'field'>'field',
        y: Math.max(0, (i - 1) * 5),
        x: i === 0 ? 0 : 15,
        fields: [a],
        style: {
          'width.mm': i === 0 ? 13 : 45,
          'height.mm': i === 0 ? 13 : 5
        }
      })).splice(0, 2)
    };
    this.setup = JSON.parse(JSON.stringify(this.defaultSetup));
  }

  ngOnInit() {
    this.allPossibleFields().subscribe(labelFields => {
      this.availableFields = labelFields;
      this.labelFields = labelFields;
      this.cdr.markForCheck();
    });
    this.translateService.get('labelDesigner').subscribe(translations => {
      this.translations = translations;
      this.cdr.markForCheck();
    });
  }


  htmlToPdf(data: ILabelPdf) {
    this.lajiApiService.post(LajiApi.Endpoints.htmlToPdf, data.html)
      .subscribe(
        (response) => {
          this.downloading = false;
          FileSaver.saveAs(response,  data.filename || 'labels.pdf');
          this.cdr.markForCheck();
        },
        (err) => {
          if (err.status === 413) {
            alert(this.translateService.instant('label.error.tooLarge'));
          } else {
            alert(this.translateService.instant('label.error.generic'));
          }
          this.downloading = false;
          this.cdr.markForCheck();
        });
  }

  changeAvailableFields(event: ILabelField[]) {
    console.log(event);
    this.setup = {
      ...this.setup,
      labelItems: [
        ...this.setup.labelItems.map((field, idx) => ({
          ...field,
          fields: [event[idx]]
        }))
      ]
    };
    this.labelFields = event;
  }

  private allPossibleFields(): Observable<ILabelField[]> {
    return this.lajiApiService.get(LajiApi.Endpoints.forms, Global.forms.default, { lang: this.translateService.currentLang }).pipe(
      map(form => form
        ? this.schemaService.schemaToAvailableFields(form.schema, [...this.defaultFields], { skip: [], special: {} })
        : []
      )
    );
  }
}
