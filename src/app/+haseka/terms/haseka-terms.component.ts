import { AfterViewInit, ChangeDetectionStrategy, Component, Input, OnInit, ViewChild } from '@angular/core';
import { LocalStorage } from 'ngx-webstorage';
import { ModalDirective } from 'ngx-bootstrap';

@Component({
  selector: 'laji-haseka-terms',
  templateUrl: './haseka-terms.component.html',
  styleUrls: ['./haseka-terms.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HasekaTermsComponent implements OnInit, AfterViewInit {

  @LocalStorage() public vihkoSettings;

  @Input() modal = false;
  @Input() dismissLabel = 'Ok';

  @ViewChild('modal') public modalComponent: ModalDirective;

  modalIsVisible = false;

  constructor() { }

  ngOnInit() {
    if (!this.vihkoSettings) {
      this.vihkoSettings = { showIntro: true };
    }
  }

  ngAfterViewInit() {
    if (!this.modalComponent) {
      return;
    }

    this.modalComponent.onShown.subscribe(() => { this.modalIsVisible = true; });
    this.modalComponent.onHidden.subscribe(() => { this.modalIsVisible = false; });
    this.modalComponent.show();
  }

  toggleInfo() {
    this.vihkoSettings = {showIntro: !this.vihkoSettings.showIntro};
    if (this.modalComponent && this.modalIsVisible) {
      this.modalComponent.hide();
    }
  }

}
