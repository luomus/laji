import { ChangeDetectionStrategy, Component, HostListener, Inject, Input, PLATFORM_ID, ViewChild, OnInit } from '@angular/core';
import { WINDOW } from '@ng-toolkit/universal';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { PopoverDirective } from 'ngx-bootstrap/popover';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'laji-info',
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InfoComponent implements OnInit {

  @Input() placement: 'top' | 'bottom' | 'left' | 'right' | 'auto' = 'left';
  @Input() html: string;
  @Input() glyphicon: string;
  @Input() labelType = 'info';
  @Input() showOnHover = false;
  @Input() containerInfo = 'body';
  @Input() noShow = false;

  @ViewChild('modal', { static: true }) public modal: ModalDirective;
  @ViewChild('pop', { static: true }) public popover: PopoverDirective;

  isInsideModal: string;
  container: string;
  position: any;

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

  @HostListener('mousemove', ['$event'])
    onMousemove(event: MouseEvent) {
     if (this.modal.isShown) {

     } else {
      if (this.containerInfo !== 'body') {
        this.position = (event.pageY - event.clientY + 300 ) + 'px';
      } else {
        this.position = 'auto';
      }
     }
    }

  ngOnInit() {
   this.container = this.containerInfo;
  }

  show(e?: MouseEvent) {
    e?.stopPropagation();
    if (!isPlatformBrowser(this.platformID)) {
      return;
    }
    const useModal = this.useModal();
    if (this.isVisible() && ((useModal && this.modal.isShown) || (!useModal && this.popover.isOpen))) {
      return;
    }
    if (this.noShow) {
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

  mouseEnter() {
    if (!this.useModal() && this.showOnHover) {
      this.show();
    }
  }

  mouseLeave() {
    if (!this.useModal() && this.showOnHover) {
      this.hide();
    }
  }

  private isVisible() {
    return this.modal.isShown || this.popover.isOpen;
  }

  private useModal() {
    return this.window.innerWidth <= 767;
  }
}
