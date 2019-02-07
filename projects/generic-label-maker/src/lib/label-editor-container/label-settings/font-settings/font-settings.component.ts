import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IFontStyle } from '../../../generic-label-maker.interface';

@Component({
  selector: 'll-font-settings',
  templateUrl: './font-settings.component.html',
  styleUrls: ['./font-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FontSettingsComponent implements OnInit {

  fontFamily: string[] = [
    'Arial',
    'Arial Black',
    'Courier New',
    'Georgia',
    'Lucida Console',
    'Palatino Linotype',
    'Times New Roman',
    'Verdana',
  ];
  fontSizes: number[] = [];

  @Input() allowEmptyFontFamily = false;
  @Input() showUnderline = false;
  @Input() fontSettings: IFontStyle;
  @Output() fontSettingsChange = new EventEmitter<IFontStyle>();

  constructor() { }

  ngOnInit() {
    const sizes = [];
    for (let i = 6; i <= 20; i++) {
      sizes.push(i);
    }
    this.fontSizes = sizes;
  }

  change(field: string, value: string|number) {
    this.fontSettingsChange.emit({
      ...this.fontSettings,
      [field]: value
    });
  }

}
