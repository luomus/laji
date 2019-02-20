import { ChangeDetectionStrategy, Component, HostListener, Inject, Input, PLATFORM_ID, ViewChild } from '@angular/core';
import { WINDOW } from '@ng-toolkit/universal';
import { ModalDirective, PopoverDirective } from 'ngx-bootstrap';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'laji-info',
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InfoComponent {

  @Input() placement: 'top' | 'bottom' | 'left' | 'right' | 'auto' = 'left';
  @Input() html: string;
  @Input() glyphicon: string;
  @Input() labelType = 'info';
  @ViewChild('modal') public modal: ModalDirective;
  @ViewChild('pop') public popover: PopoverDirective;

  constructor(
    @Inject(WINDOW) private window,
    @Inject(PLATFORM_ID) private platformID: object
  ) { }

  @HostListener('window:resize')
  onResize() {
    if (this.isVisible()) {
      this.show();
    }
  }

  show() {
    if (!isPlatformBrowser(this.platformID)) {
      return;
    }
    const useModal = this.window.innerWidth <= 767;
    if (this.isVisible() && ((useModal && this.modal.isShown) || (!useModal && this.popover.isOpen))) {
      return;
    }
    this.hide();
    if (useModal) {
      this.modal.show();
    } else {
      this.popover.show();
    }
  }

  hide() {
    if (this.modal.isShown) {
      this.modal.hide();
    }
    if (this.popover.isOpen) {
      this.popover.hide();
    }
  }

  private isVisible() {
    return this.modal.isShown || this.popover.isOpen;
  }

}
