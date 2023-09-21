import { ChangeDetectionStrategy, Component, HostListener, Input, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { PopoverDirective } from 'ngx-bootstrap/popover';
import { PlatformService } from '../../../root/platform.service';

@Component({
  selector: 'laji-info',
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InfoComponent {
  @Input() placement: 'top' | 'bottom' | 'left' | 'right' | 'auto' = 'left';
  @Input() html: string;
  @Input() glyphicon: string;
  @Input() labelType = 'info';
  @Input() showOnHover = false;
  @Input() container = 'body';
  @Input() noShow = false;
  @Input() adaptivePosition = false;

  // @ViewChild('modal', {static: true}) public modal: ModalDirective;
  // @ViewChild('pop', {static: true}) public popover: PopoverDirective;

  position: string;

  constructor(private platformService: PlatformService) {}
  //
  // @HostListener('window:resize')
  // onResize() {
  //   if (this.isVisible()) {
  //     this.show();
  //   }
  // }
  //
  // // @HostListener('mousemove', ['$event'])
  // // onMousemove(event: MouseEvent) {
  // //   if (this.modal.isShown) {
  // //
  // //   } else {
  // //     if (this.container !== 'body') {
  // //       this.position = (event.pageY - event.clientY + 300) + 'px';
  // //     } else {
  // //       this.position = 'auto';
  // //     }
  // //   }
  // // }
  //
  // toggle(e?: any) {
  //   this.isVisible() ? this.hide() : this.show(e);
  // }
  //
  // show(e?: MouseEvent) {
  //   if (this.platformService.isServer) {
  //     return;
  //   }
  //   const useModal = this.useModal();
  //   // if (this.isVisible() && ((useModal && this.modal.isShown) || (!useModal && this.popover.isOpen))) {
  //   //   return;
  //   // }
  //   // if (this.noShow) {
  //   //   return;
  //   // }
  //   // this.hide();
  //   // if (useModal) {
  //   //   // this.modal.show();
  //   // } else {
  //   //   // this.popover.show();
  //   // }
  // }
  //
  // hide() {
  //   // if (this.modal.isShown) {
  //   //   this.modal.hide();
  //   // }
  //   // if (this.popover.isOpen) {
  //   //   this.popover.hide();
  //   // }
  // }
  //
  // mouseEnter() {
  //   if (!this.useModal() && this.showOnHover) {
  //     this.show();
  //   }
  // }
  //
  // mouseLeave() {
  //   if (!this.useModal() && this.showOnHover) {
  //     this.hide();
  //   }
  // }
  //
  // private isVisible() {
  //   // return this.modal.isShown || this.popover.isOpen;
  // }
  //
  // private useModal() {
  //   return this.platformService.isBrowser && window.innerWidth <= 767;
  // }
}
