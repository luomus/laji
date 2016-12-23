import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ng2-bootstrap';
import { LocalStorage } from 'angular2-localstorage/dist';

@Component({
  selector: 'laji-whats-new',
  styleUrls: ['./whats-new.component.css'],
  templateUrl: './whats-new.component.html'
})
export class WhatsNewComponent implements OnInit {

  CurrentVersion = 0;

  @LocalStorage() public version;

  public error: boolean = false;

  @ViewChild('whatsNewModal') public modal: ModalDirective;

  constructor() { }

  ngOnInit() {
    let showModal = false;
    if (this.version !== this.CurrentVersion) {
      showModal = true;
    }
    if (showModal) {
      setTimeout(() => { this.modal.show(); }, 2000);
    }
  }

  acknowledge() {
    this.version = this.CurrentVersion;
    this.modal.hide();
  }

}
