import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'laji-audio-viewer-settings',
  templateUrl: './audio-viewer-settings.component.html',
  styleUrls: ['./audio-viewer-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AudioViewerSettingsComponent {
  @Input() zoomed = true;
  @Input() xRangePadding = 1;

  @Input() defaultZoomed = true;
  @Input() defaultXRangePadding = 1;

  @Input() displayInline = false;
  @Input() setDefaultSettingsInfoText: string;

  @Output() zoomedChange = new EventEmitter<boolean>();
  @Output() xRangePaddingChange = new EventEmitter<number>();

  onXRangePaddingSelect(value: string) {
    this.onXRangePaddingChange(parseFloat(value));
  }

  onZoomedChange(value: boolean) {
    this.zoomed = value;
    this.zoomedChange.emit(value);
  }

  setDefaultSettings() {
    this.onXRangePaddingChange(this.defaultXRangePadding);
    this.onZoomedChange(this.defaultZoomed);
  }

  private onXRangePaddingChange(value: number) {
    this.xRangePadding = value;
    this.xRangePaddingChange.emit(value);
  }
}
