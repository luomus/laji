import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';
import { LocalStorage } from 'ngx-webstorage';

@Component({
  selector: 'laji-whats-new',
  styleUrls: ['./whats-new.component.css'],
  templateUrl: './whats-new.component.html'
})
export class WhatsNewComponent implements OnInit {

  CurrentVersion = 1;

  @LocalStorage() public version;

  public error = false;

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
