import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { IGlobalTemplateVersion } from '../../../kerttu-global-shared/models';

@Component({
  selector: 'laji-version-nav',
  templateUrl: './version-nav.component.html',
  styleUrls: ['./version-nav.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VersionNavComponent {
  @Input() versions: IGlobalTemplateVersion[] = [];
  @Input() activeIdx = 0;

  @Output() activeIdxChange = new EventEmitter<number>();

  onNextClicked() {
    this.activeIdxChange.emit(this.activeIdx + 1);
  }

  onPreviousClicked() {
    this.activeIdxChange.emit(this.activeIdx - 1);
  }
}
