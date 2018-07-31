import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UserService } from '../shared/service/user.service';
import { LocalStorage } from 'ngx-webstorage';
import { NavigationEnd, Router } from '@angular/router';
import { ModalDirective } from 'ngx-bootstrap';
import { Subscription } from 'rxjs';
import { RouterChildrenEventService } from '../shared-modules/own-submissions/service/router-children-event.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'haseka',
  templateUrl: './haseka.component.html',
  styleUrls: ['./haseka.component.css']
})
export class HasekaComponent implements OnInit, OnDestroy {

  @LocalStorage() public vihkoSettings;
  public email: string;
  public isFront = false;
  public documentModalVisible = false;

  public shownDocument: string;
  @ViewChild('documentModal') public modal: ModalDirective;

  private showViewerClick$: Subscription;
  private subRoute: Subscription;

  constructor(
    public userService: UserService,
    public router: Router,
    private eventService: RouterChildrenEventService
  ) {
  }

  ngOnInit() {
    this.modal.config = {animated: false};
    if (!this.vihkoSettings) {
      this.vihkoSettings = { showIntro: true };
    }
    this.showViewerClick$ = this.eventService.showViewerClick$.subscribe((docId) => {
        this.showDocumentViewer(docId);
    });
    this.subRoute = this.router.events
      .filter(event => event instanceof NavigationEnd)
      .map(event => true)
      .startWith(true)
      .subscribe(() => {
        this.isFront = this.router.isActive('/vihko', true);
      });
  }

  ngOnDestroy() {
    this.showViewerClick$.unsubscribe();
    this.subRoute.unsubscribe();
  }

  toggleInfo() {
    this.vihkoSettings = {showIntro: !this.vihkoSettings.showIntro};
  }

  showDocumentViewer(docId: string) {
    this.shownDocument = docId;
    this.modal.show();
  }
}
