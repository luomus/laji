import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'll-label-qrcode',
  template: '<qrcode [class.print]="print" [qrdata]="qrdata" [size]="size * (print ? 4 : 1)" [level]="level" [usesvg]="false"></qrcode>',
  styleUrls: ['./label-qrcode.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LabelQRCodeComponent {

  @Input() qrdata: string;
  @Input() size: number;
  @Input() level: string;
  @Input() print = false;

}
