import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import {
  FieldType,
  ILabelField,
  ISetup,
  IViewSettings,
  Presets,
  PresetSetup,
  QRCodeErrorCorrectionLevel,
  LabelDesignerTranslationsInterface,
  ILabelPdf, IColumnMap
} from '@luomus/label-designer';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'label-designer',
  templateUrl: './label-designer.component.html',
  styleUrls: ['./label-designer.component.scss'],
  // This needs to be default otherwise initial changes are not populated on the places where the element is used!
  changeDetection: ChangeDetectionStrategy.Default
})
export class LabelDesignerComponent {

  @Input()
  pdfLoading?: boolean;

  @Input()
  showIntro?: boolean;

  @Input()
  allowLabelItemRepeat = false;

  @Input()
  data?: Record<string, any>[];

  @Input()
  defaultDomain = 'http://tun.fi/EXAMPLE.';

  @Input()
  availableFields: ILabelField[] = [];

  @Input()
  defaultAvailableFields: ILabelField[] = [];

  @Input()
  fileColumnMap?: IColumnMap;

  @Input()
  viewSetting: IViewSettings = {
    magnification: 2
  };

  @Input()
  qrCodeErrorCorrectionLevel: QRCodeErrorCorrectionLevel = QRCodeErrorCorrectionLevel.levelM;

  @Input()
  presets: PresetSetup[] = [];

  @Input()
  translations?: LabelDesignerTranslationsInterface;

  @Input()
  defaultSetup?: ISetup;

  @Input()
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
          {field: 'id', content: 'http://example.com/ID', label: 'ID - QRCode', type: FieldType.qrCode}
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
          {field: 'id', content: 'http://example.com/ID', label: 'ID', type: FieldType.id}
        ]
      }
    ]
  };

  @Output()
  html = new EventEmitter<ILabelPdf>();
  @Output()
  setupChange = new EventEmitter<ISetup>();
  @Output()
  pdfLoadingChange = new EventEmitter<boolean>();
  @Output()
  fileColumnMapChange = new EventEmitter<IColumnMap>();

  pdfTimeout: any;

  constructor(private cdr: ChangeDetectorRef) { }

  updateSetup(setup: ISetup) {
    this.setup = setup;
    this.setupChange.emit(setup);
    this.cdr.detectChanges();
  }

  updateLoading(loading: boolean) {
    this.pdfLoading = loading;
    this.pdfLoadingChange.emit(loading);
    if (this.pdfTimeout) {
      clearTimeout(this.pdfTimeout);
    }
    this.pdfTimeout = setTimeout(() => {
      this.pdfLoading = false;
      this.cdr.detectChanges();
    }, 600000);
  }
}
