import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { LabelItem } from '../../generic-label-maker.interface';
import { LabelService } from '../../label.service';

@Component({
  selector: 'll-label-item',
  templateUrl: './label-item.component.html',
  styleUrls: ['./label-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LabelItemComponent {


  _item: LabelItem;

  size;

  constructor(private labelService: LabelService) { }

  @Input()
  set item(item: LabelItem) {
    this._item = item;
    this.size = this.labelService.mmToPixel(Math.min(item.height, item.width));
  }


}
