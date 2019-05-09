import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { FieldType, ILabelField, ISetup, IViewSettings, Presets, PresetSetup, QRCodeErrorCorrectionLevel } from 'generic-label-maker';

@Component({
  selector: 'label-designer',
  templateUrl: './label-designer.component.html',
  styleUrls: ['./label-designer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LabelDesignerComponent {

  @Input()
  pdfLoading: boolean;

  @Input()
  showIntro: boolean;

  @Input()
  data: object[];

  @Input()
  defaultDomain = 'http://tun.fi/EXAMPLE.';

  @Input()
  availableFields: ILabelField[] = [];

  @Input()
  newAvailableFields: ILabelField[] = [];

  @Input()
  viewSetting: IViewSettings = {
    magnification: 2
  };

  @Input()
  qrCodeErrorCorrectionLevel: QRCodeErrorCorrectionLevel = QRCodeErrorCorrectionLevel.levelM;

  @Input()
  presets: PresetSetup[] = [];

  @Input()
  newSetup: ISetup;

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
  html = new EventEmitter<string>();
  @Output()
  setupChange = new EventEmitter<ISetup>();
  @Output()
  pdfLoadingChange = new EventEmitter<boolean>();

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
    }, 10000);
  }
}
