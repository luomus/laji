import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { LabelField, LabelItem } from '../../generic-label-maker.interface';
import { CdkDragEnd } from '@angular/cdk/drag-drop';

@Component({
  selector: 'll-label-fields-available',
  templateUrl: './label-fields-available.component.html',
  styleUrls: ['./label-fields-available.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LabelFieldsAvailableComponent implements OnInit {

  @Input() availableFields: LabelField[] = [];

  @Output() addLabelItem = new EventEmitter<LabelItem>();

  constructor() { }

  ngOnInit() {
  }

  onNewFieldDragEnd(event: CdkDragEnd) {
    const field: LabelField = JSON.parse(JSON.stringify(event.source.data));
    this.addLabelItem.emit({
      type: 'field',
      y: 10,
      x: 25,
      fields: [field],
      style: {
        'height.mm': field.isQRCode ? 10 : 4,
        'width.mm': field.isQRCode ? 10 : 20
      }
    });
    event.source.reset();
  }

}
