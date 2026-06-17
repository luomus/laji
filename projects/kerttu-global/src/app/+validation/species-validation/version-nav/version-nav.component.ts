import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { TemplateVersion } from '../../../kerttu-global-shared/models';

@Component({
    selector: 'bsg-version-nav',
    templateUrl: './version-nav.component.html',
    styleUrls: ['./version-nav.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class VersionNavComponent {
  @Input({ required: true }) versions: TemplateVersion[] = [];
  @Input() activeIdx?: number|null;

  @Output() activeIdxChange = new EventEmitter<number>();

  onNextClicked() {
    this.activeIdxChange.emit(this.activeIdx! + 1);
  }

  onPreviousClicked() {
    this.activeIdxChange.emit(this.activeIdx! - 1);
  }
}
