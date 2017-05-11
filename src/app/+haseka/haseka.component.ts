import { Component, OnInit, ViewChild } from '@angular/core';
import { UserService } from '../shared/service/user.service';
import { LocalStorage } from 'ng2-webstorage';
import { Router } from '@angular/router';
import { ModalDirective } from 'ngx-bootstrap';
import { RouterChildrenEventsService } from './router-children-events.service';

@Component({
  selector: 'haseka',
  templateUrl: './haseka.component.html',
  styleUrls: ['./haseka.component.css']
})
export class HasekaComponent implements OnInit {

  @LocalStorage() public vihkoSettings;
  public email: string;

  public shownDocument: string;
  @ViewChild('documentModal') public modal: ModalDirective;

  constructor(
    public userService: UserService,
    public router: Router,
    private eventService: RouterChildrenEventsService
  ) {
  }

  ngOnInit() {
    if (!this.vihkoSettings) {
      this.vihkoSettings = { showIntro: true };
    }
    this.eventService.showViewerClicked$.subscribe((docId) => {
        this.showDocumentViewer(docId);
    });
  }

  toggleInfo() {
    this.vihkoSettings = {showIntro: !this.vihkoSettings.showIntro};
  }

  showDocumentViewer(docId: string) {
    this.shownDocument = docId;
    this.modal.show();
  }
}
