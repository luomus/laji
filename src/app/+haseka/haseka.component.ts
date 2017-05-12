import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { UserService } from '../shared/service/user.service';
import { LocalStorage } from 'ng2-webstorage';
import { Router } from '@angular/router';
import { ModalDirective } from 'ngx-bootstrap';
import { RouterChildrenEventService } from './router-children-event.service';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'haseka',
  templateUrl: './haseka.component.html',
  styleUrls: ['./haseka.component.css']
})
export class HasekaComponent implements OnInit, OnDestroy {

  @LocalStorage() public vihkoSettings;
  public email: string;

  public shownDocument: string;
  @ViewChild('documentModal') public modal: ModalDirective;

  private showViewerClick$: Subscription;

  constructor(
    public userService: UserService,
    public router: Router,
    private eventService: RouterChildrenEventService
  ) {
  }

  ngOnInit() {
    if (!this.vihkoSettings) {
      this.vihkoSettings = { showIntro: true };
    }
    this.showViewerClick$ = this.eventService.showViewerClick$.subscribe((docId) => {
        this.showDocumentViewer(docId);
    });
  }

  ngOnDestroy() {
    this.showViewerClick$.unsubscribe();
  }

  toggleInfo() {
    this.vihkoSettings = {showIntro: !this.vihkoSettings.showIntro};
  }

  showDocumentViewer(docId: string) {
    this.shownDocument = docId;
    this.modal.show();
  }
}
