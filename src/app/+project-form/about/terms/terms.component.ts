import { AfterViewInit, ChangeDetectionStrategy, Component, Input, OnInit, ViewChild } from '@angular/core';
import { LocalStorage } from 'ngx-webstorage';
import { ModalDirective } from 'ngx-bootstrap/modal';

@Component({
  selector: 'laji-project-form-terms',
  templateUrl: './terms.component.html',
  styleUrls: ['./terms.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TermsComponent implements OnInit, AfterViewInit {

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
