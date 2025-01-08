import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { IGlobalTemplateVersion } from '../../../kerttu-global-shared/models';

@Component({
  selector: 'bsg-version-nav',
  templateUrl: './version-nav.component.html',
  styleUrls: ['./version-nav.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VersionNavComponent {
  @Input({ required: true }) versions: IGlobalTemplateVersion[] = [];
  @Input() activeIdx?: number|null;

  @Output() activeIdxChange = new EventEmitter<number>();

  onNextClicked() {
    this.activeIdxChange.emit(this.activeIdx! + 1);
  }

  onPreviousClicked() {
    this.activeIdxChange.emit(this.activeIdx! - 1);
  }
}
