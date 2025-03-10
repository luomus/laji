import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { ILabelStyle, IPageStyle } from '../../../label-designer.interface';

/**
 * @internal
 */
@Component({
  selector: 'll-margin-settings',
  templateUrl: './margin-settings.component.html',
  styleUrls: ['./margin-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarginSettingsComponent {

  @Input() type: 'padding'|'margin' = 'margin';
  @Output() styleChange = new EventEmitter<IPageStyle | ILabelStyle>();

  top!: number;
  bottom!: number;
  left!: number;
  right!: number;

  private _style!: IPageStyle | ILabelStyle;

  @Input() set style(style: IPageStyle | ILabelStyle) {
    this._style = style;
    this.top = (style as any)[this.type + 'Top.mm'] || 0;
    this.bottom = (style as any)[this.type + 'Bottom.mm'] || 0;
    this.left = (style as any)[this.type + 'Left.mm'] || 0;
    this.right = (style as any)[this.type + 'Right.mm'] || 0;
  }

  change(place: keyof Pick<this, 'top' | 'bottom' | 'left' | 'right'>, value: number): void {
    this[place] = value;
    this.styleChange.emit({
      ...this._style,
      [this.type + 'Top.mm']: +this.top,
      [this.type + 'Bottom.mm']: +this.bottom,
      [this.type + 'Left.mm']: +this.left,
      [this.type + 'Right.mm']: +this.right
    });
  }
}
