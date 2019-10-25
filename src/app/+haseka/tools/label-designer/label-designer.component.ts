import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { ILabelField, ILabelPdf, ISetup, IViewSettings, Presets } from 'label-designer';
import { isPlatformBrowser } from '@angular/common';
import { LajiApi, LajiApiService } from '../../../shared/service/laji-api.service';
import * as FileSaver from 'file-saver';
import { PdfLabelService } from '../../../shared/service/pdf-label.service';
import { Observable, of } from 'rxjs';
import { share } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { LocalStorage } from 'ngx-webstorage';

@Component({
  selector: 'laji-label-designer',
  templateUrl: './label-designer.component.html',
  styleUrls: ['./label-designer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LabelDesignerComponent implements OnInit {

  labelFields$: Observable<ILabelField[]>;
  newLabelFields$: Observable<ILabelField[]>;
  newSetup: ISetup;
  @LocalStorage('label-designer-col-map', {}) fileColumnMap;
  @LocalStorage('label-designer-view', {magnification: 2}) viewSettings: IViewSettings;
  @LocalStorage('label-designer', null) setup: ISetup;
  data: any;
  labelTranslations: any;
  downloading = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private lajiApiService: LajiApiService,
    private pdfLabelService: PdfLabelService,
    private translateService: TranslateService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.labelFields$ = this.pdfLabelService.allPossibleFields().pipe(
      share()
    );
    const translations = this.translateService.instant('labelDesigner');
    this.labelTranslations = this.translateService.currentLang !== 'en' && typeof translations === 'object' ? translations : {};
    this.newLabelFields$ = this.labelFields$;
    this.newSetup = {
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
      labelItems: this.pdfLabelService.defaultFields.map((a, i) => ({
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
    if (this.setup === null) {
      this.setup = JSON.parse(JSON.stringify(this.newSetup));
    }
    this.data = this.pdfLabelService.getData();
  }


  htmlToPdf(data: ILabelPdf) {
    if (isPlatformBrowser(this.platformId)) {
      this.lajiApiService.post(LajiApi.Endpoints.htmlToPdf, data.html)
        .subscribe((response) => {
          this.downloading = false;
          FileSaver.saveAs(response,  data.filename || 'labels.pdf');
          this.cdr.markForCheck();
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
