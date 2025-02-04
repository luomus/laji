import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener, Input, ViewChild } from '@angular/core';
import { ModalComponent } from 'projects/laji-ui/src/lib/modal/modal/modal.component';
import { Placement } from 'projects/laji-ui/src/lib/placement/placement.service';
import { PlatformService } from '../../../root/platform.service';

@Component({
  selector: 'laji-info',
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InfoComponent {
  @Input() placement: Placement = 'bottom';
  @Input() html?: string;
  @Input() glyphicon?: string;
  @Input() labelType = 'info';
  @Input() showOnHover = false;

  @ViewChild('modal', {static: true}) modal!: ModalComponent;

  useModal?: boolean;

  constructor(
    private cdr: ChangeDetectorRef,
    private platformService: PlatformService
  ) {}

  toggleModal() {
    if (!this.useModal) { return; }
    if (this.modal.isShown) { this.modal.hide(); } else { this.modal.show(); }
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    // window.innerWidth is undefined for node env, we don't want to show the modal for server-side rendered version.
    if (!this.platformService.isBrowser) {
      return;
    }
    this.useModal = this.platformService.window.innerWidth <= 767;
    this.cdr.markForCheck();
  }
}
