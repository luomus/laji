import { AfterViewInit, ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { LocalStorage } from 'ngx-webstorage';
import { UserService } from '../../../shared/service/user.service';
import { take } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'laji-project-form-terms',
  templateUrl: './terms.component.html',
  styleUrls: ['./terms.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TermsComponent implements OnInit, OnDestroy, AfterViewInit {

  @LocalStorage() public vihkoSettings;

  @Input() modal = false;
  @Input() dismissLabel = 'Ok';


  modalIsVisible = false;
  private showModalSub: Subscription;

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
  }

  toggleInfo() {
    this.vihkoSettings = {showIntro: !this.vihkoSettings.showIntro};
  }
}
