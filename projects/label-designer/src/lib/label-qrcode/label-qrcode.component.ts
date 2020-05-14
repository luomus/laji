import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { QRCodeErrorCorrectionLevel } from '../label-designer.interface';

@Component({
  selector: 'll-label-qrcode',
  template: '<qrcode [margin]="0" [class.print]="print" [qrdata]="qrdata" [width]="size * (print ? 4 : 1)" [errorCorrectionLevel]="level" elementType="img"></qrcode>',
  styleUrls: ['./label-qrcode.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LabelQRCodeComponent {

  @Input() qrdata: string;
  @Input() size: number;
  @Input() level: QRCodeErrorCorrectionLevel;
  @Input() print = false;

}
