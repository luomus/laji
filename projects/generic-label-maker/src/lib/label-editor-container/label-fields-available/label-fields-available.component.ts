import { ChangeDetectionStrategy, Component, EventEmitter, Inject, Input, OnInit, Output, PLATFORM_ID } from '@angular/core';
import { LabelField, LabelItem } from '../../generic-label-maker.interface';
import { CdkDragRelease } from '@angular/cdk/drag-drop';
import { LabelService } from '../../label.service';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'll-label-fields-available',
  templateUrl: './label-fields-available.component.html',
  styleUrls: ['./label-fields-available.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LabelFieldsAvailableComponent implements OnInit {

  @Input() availableFields: LabelField[] = [];
  @Input() magnification = 2;

  @Output() addLabelItem = new EventEmitter<LabelItem>();

  constructor(
    @Inject(PLATFORM_ID) protected platformId,
    private labelService: LabelService
  ) { }

  ngOnInit() {
  }

  onNewFieldDragEnd(event: CdkDragRelease) {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    const targetElem = document.getElementById('label-editor');
    const targetBounds = targetElem.getBoundingClientRect();
    const elemBounds = event.source.element.nativeElement.getBoundingClientRect();
    if (
      targetBounds.left <= elemBounds.left && (targetBounds.left + targetBounds.width) > elemBounds.left &&
      targetBounds.top <= elemBounds.top && (targetBounds.top + targetBounds.height) > elemBounds.top
    ) {
      const field: LabelField = JSON.parse(JSON.stringify(event.source.data));
      const width = field.type === 'qr-code' ? 10 : 25;
      const height = field.type === 'qr-code' ? 10 : 5;
      const xPos = this.labelService.pixelToMm((elemBounds.left - targetBounds.left) / this.magnification);
      const yPos = this.labelService.pixelToMm((elemBounds.top - targetBounds.top) / this.magnification);
      this.addLabelItem.emit({
        type: 'field',
        y: yPos,
        x: xPos,
        fields: [field],
        style: {
          'height.mm': Math.min(height, this.labelService.pixelToMm(targetBounds.height / this.magnification) - yPos),
          'width.mm': Math.min(width, this.labelService.pixelToMm(targetBounds.width / this.magnification) - xPos)
        }
      });
    }
    event.source.reset();
  }

}
