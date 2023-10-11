import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener, Input, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { PopoverPlacement, PopoverRootElement } from 'projects/laji-ui/src/lib/popover/popover.directive';

@Component({
  selector: 'laji-info',
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InfoComponent {
  @Input() placement: PopoverPlacement = 'left';
  @Input() html: string;
  @Input() glyphicon: string;
  @Input() labelType = 'info';
  @Input() showOnHover = false;

  @ViewChild('modal', {static: true}) modal: ModalDirective;

  useModal: boolean;

  constructor(private cdr: ChangeDetectorRef) {}

  toggleModal() {
    if (!this.useModal) { return; }
    if (this.modal.isShown) { this.modal.hide(); } else { this.modal.show(); }
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.useModal = window.innerWidth <= 767;
    this.cdr.markForCheck();
  }
}
