import { ChangeDetectionStrategy, Component, HostListener, Inject, Input, ViewChild } from '@angular/core';
import { WINDOW } from '@ng-toolkit/universal';
import { ModalDirective, PopoverDirective } from 'ngx-bootstrap';

@Component({
  selector: 'laji-info',
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InfoComponent {

  @Input() placement: 'top' | 'bottom' | 'left' | 'right' | 'auto' = 'left';
  @ViewChild('modal') public modal: ModalDirective;
  @ViewChild('pop') public popover: PopoverDirective;

  constructor(
    @Inject(WINDOW) private window
  ) { }

  @HostListener('window:resize')
  onResize() {
    if (this.isVisible()) {
      this.show();
    }
  }

  show() {
    let useModal = this.window.innerWidth <= 767;
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
