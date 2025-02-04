import { AfterViewInit, ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { LocalStorage } from 'ngx-webstorage';
import { UserService } from '../../../shared/service/user.service';
import { take } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { ModalComponent } from 'projects/laji-ui/src/lib/modal/modal/modal.component';

@Component({
  selector: 'laji-project-form-terms',
  templateUrl: './terms.component.html',
  styleUrls: ['./terms.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TermsComponent implements OnInit, OnDestroy, AfterViewInit {

  @LocalStorage() public vihkoSettings: any;

  @Input() modal = false;
  @Input() dismissLabel = 'Ok';

  @ViewChild('modal') public modalComponent!: ModalComponent;

  modalIsVisible = false;
  private showModalSub!: Subscription;

  constructor(private userService: UserService) { }

  ngOnInit() {
    if (!this.vihkoSettings) {
      this.vihkoSettings = { showIntro: true };
    }
  }

  ngOnDestroy(): void {
    this.showModalSub?.unsubscribe();
  }

  ngAfterViewInit() {
    if (!this.modalComponent) {
      return;
    }

    this.modalComponent.onShownChange.subscribe(shown => { this.modalIsVisible = shown; });
    this.showModalSub = this.userService.isLoggedIn$.pipe(take(1)).subscribe(isLoggedIn => {
      if (isLoggedIn) {
        this.modalComponent.show();
      }
    });
  }

  toggleInfo() {
    this.vihkoSettings = {showIntro: !this.vihkoSettings.showIntro};
    if (this.modalComponent && this.modalIsVisible) {
      this.modalComponent.hide();
    }
  }
}
