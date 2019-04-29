import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { ILabelField, ISetup, IViewSettings, Presets } from 'generic-label-maker';

@Component({
  selector: 'label-designer',
  templateUrl: './label-designer.component.html',
  styleUrls: ['./label-designer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LabelDesignerComponent {


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

  @Output()
  html = new EventEmitter<string>();
  @Output()
  setupChange = new EventEmitter<ISetup>();

  constructor(private cdr: ChangeDetectorRef) { }

  updateSetup(setup: ISetup) {
    this.setup = setup;
    this.setupChange.emit(setup);
    this.cdr.detectChanges();
  }

}
