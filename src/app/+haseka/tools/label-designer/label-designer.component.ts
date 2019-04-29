import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { Presets, ILabelField, ISetup } from 'generic-label-maker';
import { isPlatformBrowser } from '@angular/common';
import { LajiApi, LajiApiService } from '../../../shared/service/laji-api.service';
import * as FileSaver from 'file-saver';
import { PdfLabelService } from '../../../shared/service/pdf-label.service';
import { Observable, of } from 'rxjs';
import { share } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'laji-label-designer',
  templateUrl: './label-designer.component.html',
  styleUrls: ['./label-designer.component.scss']
})
export class LabelDesignerComponent implements OnInit {

  labelFields$: Observable<ILabelField[]>;
  newLabelFields$: Observable<ILabelField[]>;
  newSetup: ISetup;
  setup: ISetup;
  viewSettings: any = {magnification: 2};
  data: any;
  labelTranslations: any;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private lajiApiService: LajiApiService,
    private pdfLabelService: PdfLabelService,
    private translateService: TranslateService
  ) { }

  ngOnInit() {
    this.labelFields$ = this.pdfLabelService.allPossibleFields().pipe(
      share()
    );
    const translations = this.translateService.instant('labelDesigner');
    this.labelTranslations = this.translateService.currentLang !== 'en' && typeof translations === 'object' ? translations : {};
    this.newLabelFields$ = this.labelFields$;
    this.setup = {
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
      labelItems: this.pdfLabelService.defaultFields.map((a, i) => ({
        type: 'field',
        y: Math.max(0, (i - 1) * 5),
        x: i === 0 ? 0 : 15,
        fields: [a],
        style: {
          'width.mm': i === 0 ? 13 : 33,
          'height.mm': i === 0 ? 13 : 5
        }
      })).splice(0, 2)
    };
    this.data = this.pdfLabelService.getData();
    this.newSetup = JSON.parse(JSON.stringify(this.setup));
  }


  htmlToPdf(html: string) {
    if (isPlatformBrowser(this.platformId)) {
      this.lajiApiService.post(LajiApi.Endpoints.htmlToPdf, html)
        .subscribe((response) => {
          FileSaver.saveAs(response,  'labels.pdf');
        });
    }
  }

  changeAvailableFields(event: ILabelField[]) {
    this.newSetup = {
      ...this.newSetup,
      labelItems: [
        ...this.newSetup.labelItems.map((field, idx) => ({
          ...field,
          fields: [event[idx]]
        }))
      ]
    };
    this.labelFields$ = of(event);
  }
}
